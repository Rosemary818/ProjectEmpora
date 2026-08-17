import { Request, Response, NextFunction } from 'express';
import { Designation } from '../models/designation.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/error';

// Create new designation
export const createDesignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designationName, designationCode, departmentId, description } = req.body;

    const existing = await Designation.findOne({ designationName: { $regex: new RegExp(`^${designationName}$`, 'i') }, departmentId });
    if (existing) {
      return next(new AppError('A designation with this name already exists in the selected department', 400));
    }

    if (designationCode) {
      const codeExists = await Designation.findOne({ designationCode: { $regex: new RegExp(`^${designationCode}$`, 'i') } });
      if (codeExists) {
        return next(new AppError('Designation code already in use', 400));
      }
    }

    const designation = await Designation.create({
      designationName,
      designationCode,
      departmentId,
      description
    });

    res.status(201).json({
      success: true,
      data: designation,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Duplicate field value entered', 400));
    }
    next(error);
  }
};

// Get all designations
export const getAllDesignations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }

    const designations = await Designation.find(filter)
      .populate('departmentId', 'departmentName departmentCode status')
      .sort('-createdAt');

    // Add employee count to each designation
    const designationsWithCount = await Promise.all(
      designations.map(async (desig) => {
        const employeeCount = await User.countDocuments({ designationId: desig._id });
        return {
          ...desig.toObject(),
          employeeCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: designationsWithCount,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get designation by ID
export const getDesignationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const designation = await Designation.findById(req.params.id)
      .populate('departmentId', 'departmentName departmentCode');

    if (!designation) {
      return next(new AppError('Designation not found', 404));
    }

    const employeeCount = await User.countDocuments({ designationId: designation._id });

    res.status(200).json({
      success: true,
      data: {
        ...designation.toObject(),
        employeeCount
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// Update designation
export const updateDesignation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designationName, designationCode, departmentId, description, status } = req.body;

    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      return next(new AppError('Designation not found', 404));
    }

    if (designationName && designationName !== designation.designationName) {
      const existing = await Designation.findOne({ 
        designationName: { $regex: new RegExp(`^${designationName}$`, 'i') }, 
        departmentId: departmentId || designation.departmentId 
      });
      if (existing && existing._id.toString() !== designation._id.toString()) {
        return next(new AppError('A designation with this name already exists in the selected department', 400));
      }
    }

    if (designationCode && designationCode !== designation.designationCode) {
      const codeExists = await Designation.findOne({ 
        designationCode: { $regex: new RegExp(`^${designationCode}$`, 'i') } 
      });
      if (codeExists && codeExists._id.toString() !== designation._id.toString()) {
        return next(new AppError('Designation code already in use', 400));
      }
    }

    if (designationName) designation.designationName = designationName;
    if (designationCode) designation.designationCode = designationCode;
    if (departmentId) designation.departmentId = departmentId;
    if (description !== undefined) designation.description = description;
    if (status) designation.status = status;

    await designation.save();

    res.status(200).json({
      success: true,
      data: designation,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Duplicate field value entered', 400));
    }
    next(error);
  }
};

// Toggle status (Activate/Deactivate)
export const toggleDesignationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return next(new AppError('Status must be Active or Inactive', 400));
    }

    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      return next(new AppError('Designation not found', 404));
    }

    if (status === 'Inactive') {
      const usersCount = await User.countDocuments({ designationId: designation._id, status: 'Active' });
      if (usersCount > 0) {
        return next(new AppError(`Cannot deactivate designation because ${usersCount} active users are currently assigned to it.`, 400));
      }
    }

    designation.status = status;
    await designation.save();

    res.status(200).json({
      success: true,
      data: designation,
    });
  } catch (error: any) {
    next(error);
  }
};
