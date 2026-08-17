import { Request, Response } from 'express';
import { Asset } from '../models/asset.model';
import { AssetAssignmentHistory } from '../models/assetAssignmentHistory.model';
import { User } from '../models/user.model';

export const createAsset = async (req: Request, res: Response) => {
  try {
    const { assetName, assetId, category, brand, model, serialNumber, purchaseDate, warrantyExpiry, condition, status, notes } = req.body;

    const existingAsset = await Asset.findOne({ assetId });
    if (existingAsset) {
      return res.status(400).json({ success: false, message: 'Asset ID already exists' });
    }

    if (serialNumber) {
      const existingSerial = await Asset.findOne({ serialNumber });
      if (existingSerial) {
        return res.status(400).json({ success: false, message: 'Serial Number already exists' });
      }
    }

    const asset = await Asset.create({
      assetName,
      assetId,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      warrantyExpiry,
      condition,
      status,
      notes,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAssets = async (req: Request, res: Response) => {
  try {
    const { category, status, condition, search } = req.query;

    let query: any = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (condition) query.condition = condition;

    if (search) {
      query.$or = [
        { assetName: { $regex: search as string, $options: 'i' } },
        { assetId: { $regex: search as string, $options: 'i' } },
        { serialNumber: { $regex: search as string, $options: 'i' } },
      ];
      const users = await User.find({
        $or: [
          { firstName: { $regex: search as string, $options: 'i' } },
          { lastName: { $regex: search as string, $options: 'i' } },
          { employeeCode: { $regex: search as string, $options: 'i' } },
        ]
      }).select('_id');
      
      if (users.length > 0) {
        query.$or.push({ assignedTo: { $in: users.map(u => u._id) } });
      }
    }

    const assets = await Asset.find(query)
      .populate('assignedTo', 'firstName lastName employeeCode department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assets.length, data: assets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName employeeCode department')
      .populate('createdBy', 'firstName lastName');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { assetName, category, brand, model, serialNumber, purchaseDate, warrantyExpiry, condition, notes } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (serialNumber && serialNumber !== asset.serialNumber) {
      const existingSerial = await Asset.findOne({ serialNumber });
      if (existingSerial) {
        return res.status(400).json({ success: false, message: 'Serial Number already exists' });
      }
    }

    asset.assetName = assetName || asset.assetName;
    asset.category = category || asset.category;
    asset.brand = brand || asset.brand;
    asset.model = model || asset.model;
    asset.serialNumber = serialNumber || asset.serialNumber;
    asset.purchaseDate = purchaseDate || asset.purchaseDate;
    asset.warrantyExpiry = warrantyExpiry || asset.warrantyExpiry;
    asset.condition = condition || asset.condition;
    asset.notes = notes || asset.notes;

    await asset.save();

    res.status(200).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignAsset = async (req: Request, res: Response) => {
  try {
    const { employeeId, assignedDate, conditionAtAssignment, notes } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.status === 'Retired' || asset.status === 'Under Maintenance') {
      return res.status(400).json({ success: false, message: `Cannot assign a ${asset.status} asset` });
    }
    if (asset.status === 'Assigned') {
      return res.status(400).json({ success: false, message: 'Asset is already assigned. Please return or transfer it first.' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    asset.assignedTo = employeeId;
    asset.status = 'Assigned';
    if (conditionAtAssignment) asset.condition = conditionAtAssignment;
    await asset.save();

    await AssetAssignmentHistory.create({
      assetId: asset._id,
      employeeId,
      action: 'ASSIGNED',
      assignedDate: assignedDate || new Date(),
      conditionAtAssignment: conditionAtAssignment || asset.condition,
      notes,
      performedBy: (req as any).user.id
    });

    res.status(200).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const returnAsset = async (req: Request, res: Response) => {
  try {
    const { returnDate, conditionAtReturn, notes } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.status !== 'Assigned') {
      return res.status(400).json({ success: false, message: 'Only assigned assets can be returned' });
    }

    const employeeId = asset.assignedTo;
    
    asset.assignedTo = undefined;
    asset.status = 'Available';
    if (conditionAtReturn) asset.condition = conditionAtReturn;
    await asset.save();

    await AssetAssignmentHistory.create({
      assetId: asset._id,
      employeeId: employeeId,
      action: 'RETURNED',
      returnedDate: returnDate || new Date(),
      conditionAtReturn: conditionAtReturn || asset.condition,
      notes,
      performedBy: (req as any).user.id
    });

    res.status(200).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const transferAsset = async (req: Request, res: Response) => {
  try {
    const { newEmployeeId, transferDate, condition, notes } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.status !== 'Assigned') {
      return res.status(400).json({ success: false, message: 'Only assigned assets can be transferred' });
    }

    const oldEmployeeId = asset.assignedTo;
    const newEmployee = await User.findById(newEmployeeId);
    if (!newEmployee) return res.status(404).json({ success: false, message: 'New employee not found' });

    asset.assignedTo = newEmployeeId;
    if (condition) asset.condition = condition;
    await asset.save();

    // Log return for old employee
    await AssetAssignmentHistory.create({
      assetId: asset._id,
      employeeId: oldEmployeeId,
      action: 'RETURNED',
      returnedDate: transferDate || new Date(),
      conditionAtReturn: condition || asset.condition,
      notes: `Transferred to ${newEmployee.firstName} ${newEmployee.lastName}. ${notes || ''}`,
      performedBy: (req as any).user.id
    });

    // Log assignment for new employee
    await AssetAssignmentHistory.create({
      assetId: asset._id,
      employeeId: newEmployeeId,
      action: 'ASSIGNED',
      assignedDate: transferDate || new Date(),
      conditionAtAssignment: condition || asset.condition,
      notes: `Transferred from previous owner. ${notes || ''}`,
      performedBy: (req as any).user.id
    });

    res.status(200).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const maintainAsset = async (req: Request, res: Response) => {
  try {
    const { maintenanceStartDate, endDate, reason, notes, status } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (status === 'Available') {
      if (asset.status !== 'Under Maintenance') {
        return res.status(400).json({ success: false, message: 'Asset is not under maintenance' });
      }
      asset.status = 'Available';
    } else {
      if (asset.status === 'Assigned') {
        return res.status(400).json({ success: false, message: 'Asset is currently assigned. Return it before maintenance.' });
      }
      asset.status = 'Under Maintenance';
    }
    
    await asset.save();

    await AssetAssignmentHistory.create({
      assetId: asset._id,
      action: 'MAINTENANCE',
      assignedDate: maintenanceStartDate || new Date(),
      returnedDate: endDate,
      notes: `${reason ? 'Reason: ' + reason + '. ' : ''}${notes || ''}`,
      performedBy: (req as any).user.id
    });

    res.status(200).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const retireAsset = async (req: Request, res: Response) => {
  try {
    const { retirementDate, reason, notes } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.status === 'Assigned') {
      return res.status(400).json({ success: false, message: 'Return the asset before retiring it' });
    }

    asset.status = 'Retired';
    await asset.save();

    await AssetAssignmentHistory.create({
      assetId: asset._id,
      action: 'RETIRED',
      assignedDate: retirementDate || new Date(),
      notes: `${reason ? 'Reason: ' + reason + '. ' : ''}${notes || ''}`,
      performedBy: (req as any).user.id
    });

    res.status(200).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetHistory = async (req: Request, res: Response) => {
  try {
    const history = await AssetAssignmentHistory.find({ assetId: req.params.id })
      .populate('employeeId', 'firstName lastName employeeCode')
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAssets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const assets = await Asset.find({ assignedTo: userId, status: 'Assigned' })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeamAssets = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    
    // 1. Find projects where managerId is the current user
    const { Project } = await import('../models/project.model');
    const projects = await Project.find({ managerId });
    
    // 2. Extract unique team member IDs
    const teamMemberIdsSet = new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())));
    const teamMemberIds = [...teamMemberIdsSet];
    
    if (teamMemberIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 3. Fetch assets assigned to these team members
    const teamAssets = await Asset.find({ 
      assignedTo: { $in: teamMemberIds },
      status: 'Assigned' 
    })
      .populate('assignedTo', 'firstName lastName employeeCode')
      .sort({ createdAt: -1 })
      .lean();
      
    // Populate department and designation names for the frontend
    const { User } = await import('../models/user.model');
    const assignedUserIds = [...new Set(teamAssets.map(a => (a.assignedTo as any)?._id))].filter(id => id);
    
    if (assignedUserIds.length > 0) {
      const users = await User.find({ _id: { $in: assignedUserIds } })
        .populate('departmentId', 'departmentName')
        .populate('designationId', 'designationName')
        .lean();
        
      const userMap = new Map();
      users.forEach((u: any) => userMap.set(u._id.toString(), u));
      
      teamAssets.forEach((asset: any) => {
        if (asset.assignedTo) {
          const userDetails = userMap.get(asset.assignedTo._id.toString());
          if (userDetails) {
            asset.assignedTo.departmentName = userDetails.departmentId?.departmentName || 'Not Assigned';
            asset.assignedTo.designationName = userDetails.designationId?.designationName || 'Not Set';
          }
        }
      });
    }

    res.status(200).json({ success: true, data: teamAssets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetStats = async (req: Request, res: Response) => {
  try {
    const total = await Asset.countDocuments();
    const available = await Asset.countDocuments({ status: 'Available' });
    const assigned = await Asset.countDocuments({ status: 'Assigned' });
    const maintenance = await Asset.countDocuments({ status: 'Under Maintenance' });
    const retired = await Asset.countDocuments({ status: 'Retired' });

    res.status(200).json({
      success: true,
      data: {
        total,
        available,
        assigned,
        maintenance,
        retired
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
