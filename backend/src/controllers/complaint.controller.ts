import { Request, Response, NextFunction } from 'express';
import { Complaint } from '../models/complaint.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { AppError } from '../utils/error';

export const createComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, subject, description } = req.body;

    const complaint = await Complaint.create({
      employeeId: req.user.id,
      category,
      subject,
      description,
      status: 'Open',
    });

    // Notify Service Executives
    const serviceExecutives = await User.find({ role: 'ServiceExecutive' });
    const seNotifications = serviceExecutives.map((se) => ({
      userId: se._id,
      type: 'Complaint',
      title: 'New Complaint Received',
      message: `Employee ${req.user.firstName} ${req.user.lastName} submitted a new complaint: ${subject}`,
    }));
    if (seNotifications.length > 0) {
      await Notification.insertMany(seNotifications);
    }

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const complaints = await Complaint.find({ employeeId: req.user.id })
      .populate('repliedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Find projects where managerId is the current user
    const projects = await Project.find({ managerId: req.user.id });
    
    // 2. Extract unique team member IDs
    const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];

    const complaints = await Complaint.find({ employeeId: { $in: teamMemberIds } })
      .populate('employeeId', 'firstName lastName profileImage employeeCode')
      .populate('repliedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const complaints = await Complaint.find()
      .populate('employeeId', 'firstName lastName profileImage employeeCode')
      .populate('repliedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, hrReply } = req.body;
    
    const complaint = await Complaint.findById(req.params.id).populate('employeeId', 'firstName lastName');

    if (!complaint) {
      return next(new AppError('Complaint not found', 404));
    }

    if (hrReply) {
      complaint.hrReply = hrReply;
      complaint.repliedBy = req.user.id;
      complaint.repliedAt = new Date();
    }

    if (status) {
      complaint.status = status;
      if (status === 'Solved' && !complaint.solvedAt) {
        complaint.solvedAt = new Date();
      }
    }

    await complaint.save();

    // Notify Employee
    if (status === 'Solved' || hrReply) {
      let title = 'Complaint Updated';
      let message = `Your complaint "${complaint.subject}" has been updated.`;
      
      if (status === 'Solved') {
        title = 'Complaint Solved';
        message = `Your complaint "${complaint.subject}" has been marked as Solved.`;
      } else if (hrReply) {
        title = 'New Support Reply';
        message = `Service Executive has replied to your complaint "${complaint.subject}".`;
      }

      await Notification.create({
        userId: (complaint.employeeId as any)._id,
        type: 'Complaint',
        title,
        message,
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const employeeUpdateComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, employeeReply } = req.body;
    
    const complaint = await Complaint.findOne({ _id: req.params.id, employeeId: req.user.id });

    if (!complaint) {
      return next(new AppError('Complaint not found', 404));
    }

    let isReopened = false;
    let isReplied = false;

    if (employeeReply) {
      complaint.employeeReply = employeeReply;
      complaint.employeeRepliedAt = new Date();
      isReplied = true;
    }

    if (status && status === 'Open' && complaint.status === 'Solved') {
      complaint.status = 'Open';
      isReopened = true;
    }

    await complaint.save();

    if (isReopened || isReplied) {
      const serviceExecutives = await User.find({ role: 'ServiceExecutive' });
      const seNotifications = serviceExecutives.map((se) => ({
        userId: se._id,
        type: 'Complaint',
        title: isReopened ? 'Complaint Reopened' : 'New Reply on Complaint',
        message: `Employee ${req.user.firstName} ${req.user.lastName} ${isReopened ? 'reopened' : 'replied to'} complaint: ${complaint.subject}`,
      }));
      if (seNotifications.length > 0) {
        await Notification.insertMany(seNotifications);
      }
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};
