import { Request, Response, NextFunction } from 'express';
import { ServiceRequest } from '../models/serviceRequest.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { AppError } from '../utils/error';

const addSlaStatus = async (requests: any[], checkOverdue: boolean = false) => {
  const now = new Date();
  const enhancedRequests = [];

  for (let req of requests) {
    if (!req.dueDate) {
      const doc = await ServiceRequest.findById(req._id);
      if (doc) {
        await doc.save();
        
        // Refetch to get populated fields again if necessary, or just rely on the existing populated req
        req.dueDate = doc.dueDate;
        req.overdueNotified = doc.overdueNotified;
      }
    }
    
    let slaStatus = 'Pending';
    if (req.status === 'Resolved' || req.status === 'Closed') {
      slaStatus = 'Completed';
    } else if (req.dueDate) {
      const timeDiff = new Date(req.dueDate).getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 0) {
        slaStatus = 'Overdue';
        
        if (checkOverdue && !req.overdueNotified) {
          const serviceExecutives = await User.find({ role: 'ServiceExecutive' });
          const seNotifications = serviceExecutives.map((se) => ({
            userId: se._id,
            type: 'Service Request',
            title: 'Service Request Overdue',
            message: `Service Request "${req.title}" (Priority: ${req.priority}) is overdue!`,
          }));
          if (seNotifications.length > 0) {
            await Notification.insertMany(seNotifications);
          }
          await ServiceRequest.findByIdAndUpdate(req._id, { overdueNotified: true });
        }
      } else if (hoursDiff <= 24) {
        slaStatus = 'Due Soon';
      }
    }
    
    const plainReq = typeof req.toObject === 'function' ? req.toObject() : req;
    enhancedRequests.push({ ...plainReq, slaStatus });
  }

  return enhancedRequests;
};

export const createServiceRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category, description, priority } = req.body;

    const serviceRequest = await ServiceRequest.create({
      employeeId: req.user.id,
      title,
      category,
      description,
      priority: priority || 'Low',
      status: 'Open',
    });

    // Notify Service Executives
    const serviceExecutives = await User.find({ role: 'ServiceExecutive' });
    const seNotifications = serviceExecutives.map((se) => ({
      userId: se._id,
      type: 'Service Request',
      title: 'New Service Request',
      message: `Employee ${req.user.firstName} ${req.user.lastName} submitted a new service request: ${title}`,
    }));
    if (seNotifications.length > 0) {
      await Notification.insertMany(seNotifications);
    }

    res.status(201).json({
      success: true,
      data: serviceRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyServiceRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceRequests = await ServiceRequest.find({ employeeId: req.user.id })
      .populate('repliedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    const enhancedData = await addSlaStatus(serviceRequests, false);

    res.status(200).json({
      success: true,
      count: enhancedData.length,
      data: enhancedData,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamServiceRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Find projects where managerId is the current user
    const projects = await Project.find({ managerId: req.user.id });
    
    // 2. Extract unique team member IDs
    const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];

    const serviceRequests = await ServiceRequest.find({ employeeId: { $in: teamMemberIds } })
      .populate('employeeId', 'firstName lastName profileImage employeeCode department')
      .populate('repliedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    const enhancedData = await addSlaStatus(serviceRequests, false);

    res.status(200).json({
      success: true,
      count: enhancedData.length,
      data: enhancedData,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllServiceRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceRequests = await ServiceRequest.find()
      .populate('employeeId', 'firstName lastName profileImage employeeCode department')
      .populate('repliedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    const enhancedData = await addSlaStatus(serviceRequests, true); // checkOverdue = true

    res.status(200).json({
      success: true,
      count: enhancedData.length,
      data: enhancedData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, serviceExecutiveReply } = req.body;
    
    const serviceRequest = await ServiceRequest.findById(req.params.id).populate('employeeId', 'firstName lastName');

    if (!serviceRequest) {
      return next(new AppError('Service Request not found', 404));
    }

    let statusChanged = false;

    if (serviceExecutiveReply) {
      serviceRequest.serviceExecutiveReply = serviceExecutiveReply;
      serviceRequest.repliedBy = req.user.id;
      serviceRequest.repliedAt = new Date();
    }

    if (status && status !== serviceRequest.status) {
      serviceRequest.status = status;
      statusChanged = true;
      if ((status === 'Resolved' || status === 'Closed') && !serviceRequest.resolvedAt) {
        serviceRequest.resolvedAt = new Date();
      }
    }

    await serviceRequest.save();

    // Notify Employee
    if (statusChanged || serviceExecutiveReply) {
      let title = 'Service Request Updated';
      let message = `Your service request "${serviceRequest.title}" has been updated.`;
      
      if (status === 'Resolved') {
        title = 'Service Request Resolved';
        message = `Your service request "${serviceRequest.title}" has been marked as Resolved.`;
      } else if (status === 'Closed') {
        title = 'Service Request Closed';
        message = `Your service request "${serviceRequest.title}" has been marked as Closed.`;
      } else if (serviceExecutiveReply && !statusChanged) {
        title = 'New Support Reply';
        message = `Service Executive has replied to your service request "${serviceRequest.title}".`;
      }

      await Notification.create({
        userId: (serviceRequest.employeeId as any)._id,
        type: 'Service Request',
        title,
        message,
      });
    }

    res.status(200).json({
      success: true,
      data: serviceRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const employeeUpdateServiceRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, employeeReply } = req.body;
    
    const serviceRequest = await ServiceRequest.findOne({ _id: req.params.id, employeeId: req.user.id });

    if (!serviceRequest) {
      return next(new AppError('Service Request not found', 404));
    }

    let isReopened = false;
    let isReplied = false;

    if (employeeReply) {
      serviceRequest.employeeReply = employeeReply;
      serviceRequest.employeeRepliedAt = new Date();
      isReplied = true;
    }

    if (status && status === 'Open' && (serviceRequest.status === 'Resolved' || serviceRequest.status === 'Closed')) {
      serviceRequest.status = 'Open';
      isReopened = true;
    }

    await serviceRequest.save();

    if (isReopened || isReplied) {
      const serviceExecutives = await User.find({ role: 'ServiceExecutive' });
      const seNotifications = serviceExecutives.map((se) => ({
        userId: se._id,
        type: 'Service Request',
        title: isReopened ? 'Service Request Reopened' : 'New Reply on Service Request',
        message: `Employee ${req.user.firstName} ${req.user.lastName} ${isReopened ? 'reopened' : 'replied to'} service request: ${serviceRequest.title}`,
      }));
      if (seNotifications.length > 0) {
        await Notification.insertMany(seNotifications);
      }
    }

    res.status(200).json({
      success: true,
      data: serviceRequest,
    });
  } catch (error) {
    next(error);
  }
};
