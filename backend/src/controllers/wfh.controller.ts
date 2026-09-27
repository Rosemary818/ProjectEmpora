import { Request, Response, NextFunction } from 'express';
import { WFHRequest } from '../models/wfhRequest.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { AppError } from '../utils/error';

// Employee: Create WFH Request
export const createWFHRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromDate, toDate, reason } = req.body;
    const employeeId = req.user?.id;

    if (!fromDate || !toDate || !reason) {
      return next(new AppError('From Date, To Date and Reason are required', 400));
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return next(new AppError('From Date cannot be after To Date', 400));
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    let assignedManagerId = employee.managerId;
    if (!assignedManagerId) {
      const projects = await Project.find({ teamMembers: employeeId, status: 'Active' });
      if (projects.length > 0) {
        assignedManagerId = projects[0].managerId as any;
      }
    }

    // Check for overlapping requests
    const overlapping = await WFHRequest.findOne({
      employee: employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ]
    });

    if (overlapping) {
      return next(new AppError('You already have a WFH request for this period', 400));
    }

    const wfhRequest = await WFHRequest.create({
      employee: employeeId,
      manager: assignedManagerId || null,
      fromDate,
      toDate,
      reason,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: wfhRequest
    });
  } catch (error) {
    next(error);
  }
};

// Employee: Get My WFH Requests
export const getMyWFHRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wfhRequests = await WFHRequest.find({ employee: req.user?.id })
      .populate('manager', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wfhRequests
    });
  } catch (error) {
    next(error);
  }
};

// Manager: Get Team WFH Requests
export const getTeamWFHRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = req.user?.id;
    const projects = await Project.find({ managerId });
    const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];

    const wfhRequests = await WFHRequest.find({ 
      $or: [
        { manager: managerId },
        { employee: { $in: teamMemberIds } }
      ]
    })
      .populate('employee', 'firstName lastName email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wfhRequests
    });
  } catch (error) {
    next(error);
  }
};

// HR/Admin: Get All WFH Requests
export const getAllWFHRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wfhRequests = await WFHRequest.find()
      .populate('employee', 'firstName lastName email department')
      .populate('manager', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wfhRequests
    });
  } catch (error) {
    next(error);
  }
};

// Manager/HR/Admin: Update WFH Request Status
export const updateWFHRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, managerComment } = req.body;
    const { id } = req.params;
    const userId = req.user?.id;

    if (!['Approved', 'Rejected', 'Cancelled'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const wfhRequest = await WFHRequest.findById(id);

    if (!wfhRequest) {
      return next(new AppError('WFH Request not found', 404));
    }

    // Check authorization: Must be the assigned manager, an Admin/HR, or their project manager
    let isManager = wfhRequest.manager && wfhRequest.manager.toString() === userId;
    const isPrivileged = req.user?.role === 'SuperAdmin' || req.user?.role === 'HRAdmin';

    if (!isManager && !isPrivileged && req.user?.role === 'Manager') {
      const projects = await Project.find({ teamMembers: wfhRequest.employee, managerId: userId, status: 'Active' });
      if (projects.length > 0) {
        isManager = true;
      }
    }

    if (!isManager && !isPrivileged) {
      // If not manager and not privileged, maybe employee cancelling?
      if (wfhRequest.employee.toString() === userId && status === 'Cancelled') {
         // allow cancellation by employee
      } else {
        return next(new AppError('Not authorized to update this request', 403));
      }
    }

    wfhRequest.status = status;
    wfhRequest.managerComment = managerComment || wfhRequest.managerComment;
    
    if (status === 'Approved' || status === 'Rejected') {
      wfhRequest.approvedBy = userId;
      wfhRequest.approvedAt = new Date();
    }

    await wfhRequest.save();

    res.status(200).json({
      success: true,
      data: wfhRequest
    });
  } catch (error) {
    next(error);
  }
};

// Get WFH Calendar
export const getWFHCalendar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, id } = req.user!;
    let query: any = { status: 'Approved' };

    if (role === 'Employee') {
      query.employee = id;
    } else if (role === 'Manager') {
      const projects = await Project.find({ managerId: id });
      const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(mem => mem.toString())))];
      query.$or = [{ manager: id }, { employee: { $in: [id, ...teamMemberIds] } }];
    }
    // HR/Admin sees all approved

    const wfhCalendar = await WFHRequest.find(query)
      .populate('employee', 'firstName lastName')
      .select('employee fromDate toDate');

    res.status(200).json({
      success: true,
      data: wfhCalendar
    });
  } catch (error) {
    next(error);
  }
};
