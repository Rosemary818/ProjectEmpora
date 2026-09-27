import { Request, Response, NextFunction } from 'express';
import { TravelRequest } from '../models/travelRequest.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { AppError } from '../utils/error';

// Helper for sending notifications
const sendNotification = async (userId: string, title: string, message: string) => {
  await Notification.create({
    userId,
    type: 'TravelRequest',
    title,
    message,
  });
};

// 1. Create Travel Request
export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromLocation, destination, startDate, endDate, purpose, travelType, estimatedCost, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (new Date(startDate) > new Date(endDate)) {
      return next(new AppError('Start date cannot be after end date', 400));
    }

    const user = await User.findById(userId).populate('departmentId');
    if (!user) return next(new AppError('User not found', 404));

    let status = 'Pending Manager Approval';
    let resolvedManagerId = user.managerId;

    if (!resolvedManagerId && user.departmentId) {
      // Fallback 1: Department Manager
      const dept = user.departmentId as any;
      if (dept && dept.managerId) {
        resolvedManagerId = dept.managerId;
      }
    }

    if (!resolvedManagerId) {
      // Fallback 2: Project Manager
      const mongoose = require('mongoose');
      const Project = mongoose.model('Project');
      if (Project) {
        const project = await Project.findOne({ teamMembers: userId, managerId: { $exists: true, $ne: null } });
        if (project && project.managerId) {
          resolvedManagerId = project.managerId;
        }
      }
    }

    if (userRole === 'Manager') {
      status = 'Pending HR Approval';
    } else if (!resolvedManagerId) {
      return next(new AppError('You do not have an assigned manager to approve this request.', 400));
    }

    const travelRequest = await TravelRequest.create({
      requesterId: userId,
      requesterRole: userRole,
      managerId: resolvedManagerId,
      fromLocation,
      destination,
      startDate,
      endDate,
      purpose,
      travelType,
      estimatedCost: estimatedCost || 0,
      notes,
      status: status as any
    });

    // Notify approver
    if (userRole === 'Manager') {
      // Notify HR Admins
      const hrAdmins = await User.find({ role: 'HRAdmin' });
      for (const hr of hrAdmins) {
        await sendNotification(hr.id, 'New Manager Travel Request', `New Manager travel approval request from ${user.firstName} ${user.lastName}: ${fromLocation} → ${destination}, ${new Date(startDate).toLocaleDateString()}–${new Date(endDate).toLocaleDateString()}.`);
      }
    } else if (resolvedManagerId) {
      await sendNotification(resolvedManagerId.toString(), 'New Travel Request', `New business travel request from ${user.firstName} ${user.lastName}: ${fromLocation} → ${destination}, ${new Date(startDate).toLocaleDateString()}–${new Date(endDate).toLocaleDateString()}.`);
    }

    res.status(201).json({ success: true, data: travelRequest });
  } catch (error) {
    next(error);
  }
};

// 2. Get My Requests (Employee or Manager)
export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await TravelRequest.find({ requesterId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// 3. Get Team Requests (For Manager)
export const getTeamRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await TravelRequest.find({ managerId: req.user.id, requesterId: { $ne: req.user.id } })
      .populate('requesterId', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// 4. Get HR Monitoring (All Employee Requests)
export const getHRMonitoring = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await TravelRequest.find({ requesterRole: { $ne: 'Manager' } })
      .populate('requesterId', 'firstName lastName email department')
      .populate('managerId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// 5. Get HR Approvals (All Manager Requests)
export const getHRApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await TravelRequest.find({ requesterRole: 'Manager' })
      .populate('requesterId', 'firstName lastName email department')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// 6. Process Approval (Approve / Reject)
export const processApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, reason } = req.body; // action = 'Approve' | 'Reject'
    const travelRequest = await TravelRequest.findById(req.params.id).populate('requesterId', 'firstName lastName');

    if (!travelRequest) return next(new AppError('Request not found', 404));
    
    // Prevent self-approval
    if (travelRequest.requesterId._id.toString() === req.user.id) {
      return next(new AppError('You cannot approve or reject your own request', 403));
    }

    let newStatus = '';

    // Check permissions
    if (req.user.role === 'Manager') {
      if (travelRequest.managerId?.toString() !== req.user.id) {
        return next(new AppError('You can only approve requests for your team members', 403));
      }
      if (travelRequest.status !== 'Pending Manager Approval') {
        return next(new AppError('Request is not pending your approval', 400));
      }
      newStatus = action === 'Approve' ? 'Manager Approved' : 'Manager Rejected';

    } else if (req.user.role === 'HRAdmin' || req.user.role === 'SuperAdmin') {
      if (travelRequest.requesterRole !== 'Manager') {
        return next(new AppError('HR Admins can only approve Manager travel requests', 403));
      }
      if (travelRequest.status !== 'Pending HR Approval') {
        return next(new AppError('Request is not pending HR approval', 400));
      }
      newStatus = action === 'Approve' ? 'HR Approved' : 'HR Rejected';
    } else {
      return next(new AppError('You do not have permission to process this request', 403));
    }

    travelRequest.status = newStatus as any;
    if (action === 'Approve') {
      travelRequest.approvedAt = new Date();
      travelRequest.approverId = req.user.id as any;
    } else {
      travelRequest.rejectionReason = reason;
      travelRequest.approverId = req.user.id as any;
    }

    await travelRequest.save();

    // Send notification
    const destination = travelRequest.destination;
    const msg = action === 'Approve' 
      ? `Your business travel request to ${destination} has been approved${req.user.role === 'Manager' ? ' by your Manager' : ' by HR'}.`
      : `Your business travel request to ${destination} has been rejected.${reason ? ` Reason: ${reason}` : ''}`;
    
    await sendNotification(travelRequest.requesterId._id.toString(), 'Travel Request Update', msg);

    res.status(200).json({ success: true, data: travelRequest });
  } catch (error) {
    next(error);
  }
};

// 7. Cancel Request
export const cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const travelRequest = await TravelRequest.findById(req.params.id);

    if (!travelRequest) return next(new AppError('Request not found', 404));

    if (travelRequest.requesterId.toString() !== req.user.id) {
      return next(new AppError('You can only cancel your own requests', 403));
    }

    if (['Manager Rejected', 'HR Rejected', 'Cancelled', 'Completed'].includes(travelRequest.status)) {
      return next(new AppError('Request cannot be cancelled in its current state', 400));
    }

    travelRequest.status = 'Cancelled';
    await travelRequest.save();

    res.status(200).json({ success: true, data: travelRequest });
  } catch (error) {
    next(error);
  }
};
