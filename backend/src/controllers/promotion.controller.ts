import { Request, Response, NextFunction } from 'express';
import { Promotion } from '../models/promotion.model';
import { User } from '../models/user.model';
import { Designation } from '../models/designation.model';
import { Project } from '../models/project.model';
import { Notification } from '../models/notification.model';
import { AppError } from '../utils/error';

// 1. Manager: Create Promotion Proposal
export const createPromotionProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, proposedDesignation, reason, managerRemarks } = req.body;
    const managerId = req.user?.id;

    if (!employeeId || !proposedDesignation || !reason) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Verify employee belongs to manager
    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Verify employee belongs to manager (direct report or project member)
    let isTeamMember = employee.managerId?.toString() === managerId;
    
    if (!isTeamMember) {
      const isProjectMember = await Project.exists({
        managerId,
        teamMembers: employeeId
      });
      if (isProjectMember) {
        isTeamMember = true;
      }
    }

    if (!isTeamMember && req.user?.role !== 'HRAdmin' && req.user?.role !== 'SuperAdmin') {
      return next(new AppError('You can only propose promotions for your team members', 403));
    }

    // Check for existing pending proposals for this employee
    const existingProposal = await Promotion.findOne({
      employeeId,
      status: { $in: ['Pending HR Review', 'Approved'] } // Approved but not yet Effective
    });

    if (existingProposal) {
      return next(new AppError('An active promotion proposal already exists for this employee', 400));
    }

    const trimmedDesignation = proposedDesignation.trim();

    // Find or create designation
    let designation = await Designation.findOne({
      designationName: { $regex: new RegExp(`^${trimmedDesignation}$`, 'i') },
      departmentId: employee.departmentId
    });

    if (!designation) {
      designation = await Designation.create({
        designationName: trimmedDesignation,
        departmentId: employee.departmentId,
        description: `Created during promotion proposal for ${employee.firstName} ${employee.lastName}`
      });
    }

    const promotion = await Promotion.create({
      employeeId,
      departmentId: employee.departmentId,
      currentDesignationId: employee.designationId,
      proposedDesignationId: designation._id,
      reason,
      managerRemarks,
      status: 'Pending HR Review',
      proposedBy: managerId,
    });

    // Notify HR Admins
    const hrAdmins = await User.find({ role: 'HRAdmin' });
    const hrNotifications = hrAdmins.map(hr => ({
      userId: hr._id,
      type: 'Promotion',
      title: 'New Promotion Proposal',
      message: `A new promotion proposal has been submitted for ${employee.firstName} ${employee.lastName} by their manager.`
    }));
    await Notification.insertMany(hrNotifications);

    res.status(201).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('PROMOTION ERROR:', error);
    next(error);
  }
};

// 2. Manager: Get Team Promotions
export const getManagerPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = req.user?.id;

    // Find employees under this manager
    const teamMembers = await User.find({ managerId }).select('_id');
    const teamMemberIds = teamMembers.map(m => m._id);

    const promotions = await Promotion.find({ employeeId: { $in: teamMemberIds } })
      .populate('employeeId', 'firstName lastName profileImage employeeCode')
      .populate('currentDesignationId', 'designationName')
      .populate('proposedDesignationId', 'designationName')
      .populate('departmentId', 'departmentName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

// 3. HR Admin: Get All Promotions
export const getAllPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promotions = await Promotion.find()
      .populate('employeeId', 'firstName lastName profileImage employeeCode')
      .populate('currentDesignationId', 'designationName')
      .populate('proposedDesignationId', 'designationName')
      .populate('departmentId', 'departmentName')
      .populate('proposedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

// 4. Employee: Get Own Promotions
export const getEmployeePromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.id;

    const promotions = await Promotion.find({ employeeId })
      .populate('currentDesignationId', 'designationName')
      .populate('proposedDesignationId', 'designationName')
      .populate('departmentId', 'departmentName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

// 5. HR Admin: Update Promotion Status (Approve/Reject)
export const updatePromotionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, hrRemarks, effectiveDate } = req.body;
    const hrAdminId = req.user?.id;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return next(new AppError('Valid status is required (Approved or Rejected)', 400));
    }

    const promotion = await Promotion.findById(id).populate('employeeId');

    if (!promotion) {
      return next(new AppError('Promotion proposal not found', 404));
    }

    if (promotion.status !== 'Pending HR Review') {
      return next(new AppError(`Cannot review a promotion that is already ${promotion.status}`, 400));
    }

    if (status === 'Approved' && !effectiveDate) {
      return next(new AppError('Effective date is required when approving a promotion', 400));
    }

    promotion.status = status;
    promotion.hrRemarks = hrRemarks;
    promotion.reviewedBy = hrAdminId;
    promotion.reviewedAt = new Date();

    if (status === 'Approved') {
      promotion.effectiveDate = effectiveDate;
      promotion.approvedAt = new Date();

      const emp: any = promotion.employeeId;
      // Notifications for approval
      await Notification.create({
        userId: emp._id,
        type: 'Promotion',
        title: 'Promotion Approved',
        message: `Congratulations! Your promotion proposal has been approved. It will be effective on ${new Date(effectiveDate).toLocaleDateString()}.`
      });
      if (emp.managerId) {
        await Notification.create({
          userId: emp.managerId,
          type: 'Promotion',
          title: 'Promotion Proposal Approved',
          message: `The promotion proposal for ${emp.firstName} ${emp.lastName} has been approved.`
        });
      }

    } else if (status === 'Rejected') {
      if (!hrRemarks) {
        return next(new AppError('HR Remarks are required when rejecting a promotion', 400));
      }
      promotion.rejectedAt = new Date();

      const emp: any = promotion.employeeId;
      // Notification to manager
      if (emp.managerId) {
        await Notification.create({
          userId: emp.managerId,
          type: 'Promotion',
          title: 'Promotion Proposal Rejected',
          message: `The promotion proposal for ${emp.firstName} ${emp.lastName} has been rejected by HR.`
        });
      }
      // Note: Typically you might not notify the employee of a rejection if they didn't know about it, 
      // but according to requirements: "Notify manager and employee: Promotion proposal has been rejected."
      await Notification.create({
        userId: emp._id,
        type: 'Promotion',
        title: 'Promotion Proposal Update',
        message: `Your recent promotion proposal has been rejected.`
      });
    }

    await promotion.save();

    // If the approved effective date is today or in the past, we should ideally mark it Effective now.
    // If HR is updating the status to "Approved" directly from here and the effective date has passed,
    // trigger the role update immediately.
    if (status === 'Approved' && effectiveDate && new Date(effectiveDate) <= new Date()) {
      promotion.status = 'Effective';
      await promotion.save();

      await User.findByIdAndUpdate(promotion.employeeId, {
        designationId: promotion.proposedDesignationId
        // Also update jobTitle if needed by fetching designationName
      });
    }

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

// 6. Manager: Cancel Promotion
export const cancelPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const managerId = req.user?.id;

    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return next(new AppError('Promotion not found', 404));
    }

    if (promotion.proposedBy.toString() !== managerId && req.user?.role !== 'HRAdmin') {
      return next(new AppError('You do not have permission to cancel this promotion', 403));
    }

    if (promotion.status !== 'Pending HR Review' && promotion.status !== 'Draft') {
      return next(new AppError(`Cannot cancel promotion with status: ${promotion.status}`, 400));
    }

    promotion.status = 'Cancelled';
    await promotion.save();

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};
