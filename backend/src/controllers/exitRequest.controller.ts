import { Request, Response } from 'express';
import { ExitRequest } from '../models/exitRequest.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { Project } from '../models/project.model';
import mongoose from 'mongoose';

const sendNotification = async (userId: mongoose.Types.ObjectId | string, title: string, message: string, type: string = 'System') => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

// ---------------------------------------------------------
// EMPLOYEE ENDPOINTS
// ---------------------------------------------------------

export const submitResignation = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const { resignationDate, proposedLastWorkingDate, reason, comments } = req.body;

    // Validate if an active request already exists
    const existingRequest = await ExitRequest.findOne({
      employeeId,
      status: { $nin: ['Completed', 'Rejected', 'Cancelled'] }
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have an active resignation request.' });
    }

    if (new Date(proposedLastWorkingDate) < new Date(resignationDate)) {
      return res.status(400).json({ success: false, message: 'Proposed last working date cannot be before resignation date.' });
    }

    // Get user details to populate managerId and departmentId
    const user = await User.findById(employeeId);
    if (!user || user.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Only active employees can submit a resignation.' });
    }

    // Determine manager. Empora uses User.managerId for direct report
    const managerId = user.managerId;
    const departmentId = user.departmentId;

    const exitRequest = await ExitRequest.create({
      employeeId,
      managerId,
      departmentId,
      resignationDate,
      proposedLastWorkingDate,
      reason,
      comments,
      status: 'Submitted',
    });

    // Notify Manager
    if (managerId) {
      await sendNotification(managerId, 'New Resignation Request', `${user.firstName} ${user.lastName} has submitted a resignation request.`);
    }

    // Notify HR Admins
    const hrAdmins = await User.find({ role: 'HRAdmin' });
    hrAdmins.forEach(hr => {
      sendNotification(hr._id, 'New Resignation Request', `${user.firstName} ${user.lastName} has submitted a resignation request.`);
    });

    res.status(201).json({ success: true, data: exitRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyResignation = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const requests = await ExitRequest.find({ employeeId })
      .populate('managerId', 'firstName lastName')
      .populate('managerReview.reviewedBy', 'firstName lastName')
      .populate('hrReview.reviewedBy', 'firstName lastName')
      .populate('exitInterview.interviewerId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------
// MANAGER ENDPOINTS
// ---------------------------------------------------------

export const getTeamResignations = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    
    // First find team members through projects (manager is project manager)
    const projects = await Project.find({ managerId });
    const teamMemberIdsProject = projects.flatMap(p => p.teamMembers.map(id => id.toString()));
    
    // Also find direct reports through User model
    const directReports = await User.find({ managerId }).select('_id');
    const directReportIds = directReports.map(u => u._id.toString());
    
    const allTeamMemberIds = [...new Set([...teamMemberIdsProject, ...directReportIds])];

    const requests = await ExitRequest.find({ employeeId: { $in: allTeamMemberIds } })
      .populate('employeeId', 'firstName lastName employeeCode')
      .populate('departmentId', 'departmentName')
      .sort({ createdAt: -1 });

    // Populate designation
    const users = await User.find({ _id: { $in: allTeamMemberIds } }).populate('designationId', 'designationName');
    const userMap = new Map();
    users.forEach(u => userMap.set(u._id.toString(), u));

    const populatedRequests = requests.map(req => {
      const obj = req.toObject();
      if (obj.employeeId) {
        const emp = obj.employeeId as any;
        const userDetails = userMap.get(emp._id.toString());
        emp.designationName = userDetails?.designationId?.designationName || 'Not Set';
      }
      return obj;
    });

    res.status(200).json({ success: true, data: populatedRequests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const managerReview = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    const { id } = req.params;
    const { status, comments } = req.body; // status: 'Approved' | 'Rejected'

    const exitRequest = await ExitRequest.findById(id).populate('employeeId', 'firstName lastName');
    if (!exitRequest) return res.status(404).json({ success: false, message: 'Exit request not found' });

    if (exitRequest.status !== 'Submitted' && exitRequest.status !== 'Manager Review') {
       return res.status(400).json({ success: false, message: 'Request is not in a state for manager review' });
    }

    exitRequest.managerReview = {
      status,
      reviewedBy: managerId,
      reviewedAt: new Date(),
      comments
    };

    if (status === 'Approved') {
      exitRequest.status = 'HR Review';
      // Notify HR
      const hrAdmins = await User.find({ role: 'HRAdmin' });
      hrAdmins.forEach(hr => {
        sendNotification(hr._id, 'Resignation Manager Approved', `Manager has approved resignation for ${(exitRequest.employeeId as any).firstName} ${(exitRequest.employeeId as any).lastName}. Pending HR Review.`);
      });
      // Notify Employee
      await sendNotification(exitRequest.employeeId, 'Resignation Status Update', `Your manager has approved your resignation request.`);
    } else if (status === 'Rejected') {
      exitRequest.status = 'Rejected';
      await sendNotification(exitRequest.employeeId, 'Resignation Status Update', `Your manager has rejected your resignation request.`);
    }

    await exitRequest.save();
    res.status(200).json({ success: true, data: exitRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------
// HR ADMIN ENDPOINTS
// ---------------------------------------------------------

export const getAllResignations = async (req: Request, res: Response) => {
  try {
    const { status, departmentId } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;

    const requests = await ExitRequest.find(query)
      .populate('employeeId', 'firstName lastName employeeCode')
      .populate('departmentId', 'departmentName')
      .populate('managerId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const hrReview = async (req: Request, res: Response) => {
  try {
    const hrId = (req as any).user.id;
    const { id } = req.params;
    const { status, noticePeriodDays, approvedLastWorkingDate, comments } = req.body;

    const exitRequest = await ExitRequest.findById(id);
    if (!exitRequest) return res.status(404).json({ success: false, message: 'Exit request not found' });

    exitRequest.hrReview = {
      status,
      reviewedBy: hrId,
      reviewedAt: new Date(),
      comments
    };

    if (status === 'Approved') {
      exitRequest.status = 'Notice Period';
      exitRequest.noticePeriodDays = noticePeriodDays || 30;
      exitRequest.approvedLastWorkingDate = approvedLastWorkingDate;
      await sendNotification(exitRequest.employeeId, 'Resignation HR Approved', `HR has approved your resignation. Your last working date is set to ${new Date(approvedLastWorkingDate).toLocaleDateString()}.`);
    } else if (status === 'Rejected') {
      exitRequest.status = 'Rejected';
      await sendNotification(exitRequest.employeeId, 'Resignation HR Rejected', `HR has rejected your resignation request.`);
    }

    await exitRequest.save();
    res.status(200).json({ success: true, data: exitRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClearance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assetClearance, salaryClearance, leaveClearance, documentClearance, managerClearance } = req.body;

    const exitRequest = await ExitRequest.findById(id);
    if (!exitRequest) return res.status(404).json({ success: false, message: 'Exit request not found' });

    if (!exitRequest.clearance) {
      exitRequest.clearance = {
        assetClearance: 'Pending',
        salaryClearance: 'Pending',
        leaveClearance: 'Pending',
        documentClearance: 'Pending',
        managerClearance: 'Pending'
      };
    }

    if (assetClearance) exitRequest.clearance.assetClearance = assetClearance;
    if (salaryClearance) exitRequest.clearance.salaryClearance = salaryClearance;
    if (leaveClearance) exitRequest.clearance.leaveClearance = leaveClearance;
    if (documentClearance) exitRequest.clearance.documentClearance = documentClearance;
    if (managerClearance) exitRequest.clearance.managerClearance = managerClearance;

    // Check if notice period is completed or clearance is starting
    if (exitRequest.status === 'Notice Period') {
      exitRequest.status = 'Clearance Pending';
      await sendNotification(exitRequest.employeeId, 'Clearance Started', `Your exit clearance process has begun.`);
    }

    // Check if all clearance is completed to move to exit interview
    const c = exitRequest.clearance;
    if (c.assetClearance === 'Completed' && c.salaryClearance === 'Completed' && 
        c.leaveClearance === 'Completed' && c.documentClearance === 'Completed' && 
        c.managerClearance === 'Completed') {
      if (exitRequest.status === 'Clearance Pending') {
         exitRequest.status = 'Exit Interview';
      }
    }

    await exitRequest.save();
    res.status(200).json({ success: true, data: exitRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleExitInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledDate, scheduledTime, interviewerId, comments } = req.body;

    const exitRequest = await ExitRequest.findById(id);
    if (!exitRequest) return res.status(404).json({ success: false, message: 'Exit request not found' });

    exitRequest.exitInterview = {
      ...exitRequest.exitInterview,
      scheduledDate,
      scheduledTime,
      interviewerId,
      status: 'Pending',
      comments
    };

    exitRequest.status = 'Exit Interview';
    await exitRequest.save();

    await sendNotification(exitRequest.employeeId, 'Exit Interview Scheduled', `Your exit interview has been scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}.`);

    res.status(200).json({ success: true, data: exitRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeExitInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const exitRequest = await ExitRequest.findById(id);
    if (!exitRequest) return res.status(404).json({ success: false, message: 'Exit request not found' });

    if (exitRequest.exitInterview) {
      exitRequest.exitInterview.status = 'Completed';
      exitRequest.exitInterview.feedback = feedback;
    }

    await exitRequest.save();
    res.status(200).json({ success: true, data: exitRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeExit = async (req: Request, res: Response) => {
  try {
    const hrId = (req as any).user.id;
    const { id } = req.params;

    const exitRequest = await ExitRequest.findById(id);
    if (!exitRequest) return res.status(404).json({ success: false, message: 'Exit request not found' });

    // Validate all clearances are completed
    const c = exitRequest.clearance;
    if (!c || c.assetClearance !== 'Completed' || c.salaryClearance !== 'Completed' || 
        c.leaveClearance !== 'Completed' || c.documentClearance !== 'Completed' || 
        c.managerClearance !== 'Completed') {
      return res.status(400).json({ success: false, message: 'All clearances must be completed before finalizing the exit.' });
    }

    if (!exitRequest.exitInterview || exitRequest.exitInterview.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Exit interview must be completed.' });
    }

    exitRequest.status = 'Completed';
    exitRequest.completedAt = new Date();
    exitRequest.completedBy = hrId;
    await exitRequest.save();

    // Set user account to Inactive
    const user = await User.findById(exitRequest.employeeId);
    if (user) {
      user.status = 'Inactive';
      await user.save();
    }

    await sendNotification(exitRequest.employeeId, 'Offboarding Completed', `Your offboarding process is now fully completed. Thank you for your contributions!`);

    res.status(200).json({ success: true, data: exitRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
