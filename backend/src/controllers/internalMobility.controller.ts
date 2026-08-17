import { Request, Response } from 'express';
import { InternalOpportunity } from '../models/internalOpportunity.model';
import { InternalApplication } from '../models/internalApplication.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Interview } from '../models/interview.model';
import { Notification } from '../models/notification.model';

// ==========================================
// HR ADMIN ENDPOINTS
// ==========================================

export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const opportunity = new InternalOpportunity(req.body);
    await opportunity.save();
    res.status(201).json({ success: true, data: opportunity });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getOpportunitiesHR = async (req: Request, res: Response) => {
  try {
    const opportunities = await InternalOpportunity.find()
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: opportunities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOpportunity = async (req: Request, res: Response) => {
  try {
    const opportunity = await InternalOpportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    res.status(200).json({ success: true, data: opportunity });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteOpportunity = async (req: Request, res: Response) => {
  try {
    const opportunity = await InternalOpportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    
    // Check if there are applications
    const appsCount = await InternalApplication.countDocuments({ opportunityId: opportunity._id });
    if (appsCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete opportunity with existing applications' });
    }

    await opportunity.deleteOne();
    res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOpportunityApplicants = async (req: Request, res: Response) => {
  try {
    const applications = await InternalApplication.find({ opportunityId: req.params.id })
      .populate('employeeId', 'firstName lastName email employeeCode profileImage')
      .populate('currentDepartmentId', 'departmentName')
      .populate('currentDesignationId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllApplicationsHR = async (req: Request, res: Response) => {
  try {
    const applications = await InternalApplication.find()
      .populate('employeeId', 'firstName lastName email employeeCode profileImage')
      .populate('currentDepartmentId', 'departmentName')
      .populate('currentDesignationId', 'title')
      .populate('targetDepartmentId', 'departmentName')
      .populate('targetDesignationId', 'title')
      .populate('opportunityId', 'title location')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { status, rejectionReason } = req.body;
    const application = await InternalApplication.findByIdAndUpdate(req.params.id, { status, rejectionReason }, { new: true });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const scheduleInternalInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      round,
      interviewType,
      date,
      startTime,
      endTime,
      interviewer,
      interviewerId,
      meetingLink,
      venue,
      notes,
    } = req.body;

    if (!round || !interviewType || !date || !startTime || !endTime || !interviewer || !interviewerId) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const application = await InternalApplication.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (application.status !== 'Shortlisted') {
      return res.status(400).json({ success: false, error: 'Application must be Shortlisted before scheduling an interview' });
    }

    const interviewDate = new Date(date);
    if (interviewDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, error: 'Interview date cannot be in the past' });
    }

    if (endTime <= startTime) {
      return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    if (interviewType === 'Online' && !meetingLink) {
      return res.status(400).json({ success: false, error: 'Meeting Link is required for Online interviews' });
    }
    if (interviewType === 'Offline' && !venue) {
      return res.status(400).json({ success: false, error: 'Venue is required for Offline interviews' });
    }

    const interview = await Interview.create({
      applicationId: application._id,
      applicationModel: 'InternalApplication',
      candidateId: application.employeeId,
      opportunityId: application.opportunityId?._id || application.opportunityId,
      category: 'Internal Mobility',
      round,
      interviewType,
      date: interviewDate,
      startTime,
      endTime,
      interviewer,
      interviewerId,
      meetingLink,
      venue,
      notes,
      status: 'Scheduled',
    });

    application.status = 'Interview Scheduled';
    application.interviewId = interview._id;
    await application.save();

    await Notification.create({
      userId: application.employeeId,
      title: 'Internal Mobility Interview Scheduled',
      message: `Your ${round} interview for the internal transfer has been scheduled on ${interviewDate.toLocaleDateString()} at ${startTime}.`,
      type: 'General',
      isRead: false
    });

    await Notification.create({
      userId: interviewerId,
      title: 'New Internal Interview Assigned',
      message: `You have been assigned to conduct an internal mobility ${round} interview on ${interviewDate.toLocaleDateString()} at ${startTime}.`,
      type: 'General',
      isRead: false
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const confirmInternalTransfer = async (req: Request, res: Response) => {
  try {
    const application = await InternalApplication.findById(req.params.id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'Selected') {
      return res.status(400).json({ success: false, message: 'Application must be Selected before confirming transfer' });
    }

    const opportunity = application.opportunityId as any;

    const user = await User.findById(application.employeeId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    user.departmentId = application.targetDepartmentId;
    user.designationId = application.targetDesignationId;
    await user.save();

    application.status = 'Transfer Completed';
    await application.save();

    res.status(200).json({ success: true, message: 'Transfer confirmed successfully', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// EMPLOYEE ENDPOINTS
// ==========================================

export const getPublishedOpportunities = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const opportunities = await InternalOpportunity.find({
      status: 'Published',
      deadline: { $gte: currentDate }
    })
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: opportunities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyForOpportunity = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const { opportunityId, reason, relevantSkills, additionalComments } = req.body;

    const existingApp = await InternalApplication.findOne({ employeeId, opportunityId });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this opportunity' });
    }

    const employee = await User.findById(employeeId);
    if (!employee || !employee.departmentId || !employee.designationId) {
      return res.status(400).json({ success: false, message: 'Employee profile is incomplete' });
    }

    const opportunity = await InternalOpportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const application = new InternalApplication({
      employeeId,
      opportunityId,
      currentDepartmentId: employee.departmentId,
      currentDesignationId: employee.designationId,
      targetDepartmentId: opportunity.departmentId,
      targetDesignationId: opportunity.designationId,
      reason,
      relevantSkills,
      additionalComments,
      managerRecommendation: employee.role === 'Manager' ? 'Not Required' : 'Pending'
    });

    await application.save();
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const applications = await InternalApplication.find({ employeeId })
      .populate({
        path: 'opportunityId',
        populate: [
          { path: 'departmentId', select: 'departmentName' },
          { path: 'designationId', select: 'title' }
        ]
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const withdrawApplication = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const application = await InternalApplication.findOne({ _id: req.params.id, employeeId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    if (['Selected', 'Rejected', 'Withdrawn', 'Transfer Completed'].includes(application.status)) {
      return res.status(400).json({ success: false, message: `Cannot withdraw application that is ${application.status}` });
    }

    application.status = 'Withdrawn';
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// MANAGER ENDPOINTS
// ==========================================

export const getTeamApplications = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    
    // Find all employees managed by this manager using the Project logic (same as My Team)
    const projects = await Project.find({ managerId });
    const teamMemberIds = [...new Set(projects.flatMap(p => (p.teamMembers || []).map(id => id ? id.toString() : null).filter(Boolean)))];

    const applications = await InternalApplication.find({ employeeId: { $in: teamMemberIds } })
      .populate('employeeId', 'firstName lastName email employeeCode profileImage')
      .populate('currentDepartmentId', 'departmentName')
      .populate('currentDesignationId', 'title')
      .populate('targetDepartmentId', 'departmentName')
      .populate('targetDesignationId', 'title')
      .populate('opportunityId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recommendApplication = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    const { managerRecommendation, managerRemarks } = req.body;
    
    const application = await InternalApplication.findById(req.params.id).populate('employeeId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const employee = application.employeeId as any;
    
    const projects = await Project.find({ managerId });
    const teamMemberIds = [...new Set(projects.flatMap(p => (p.teamMembers || []).map(id => id ? id.toString() : null).filter(Boolean)))];

    const employeeIdStr = (employee._id || employee).toString();
    if (!teamMemberIds.includes(employeeIdStr)) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this application' });
    }

    application.managerRecommendation = managerRecommendation;
    application.managerRemarks = managerRemarks;
    if (application.status === 'Applied') {
      application.status = 'Under Review';
    }
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
