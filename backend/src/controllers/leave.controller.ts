import { Request, Response, NextFunction } from 'express';
import { LeaveRequest } from '../models/leave.model';
import { AppError } from '../utils/error';

// Calculate number of weekdays between two dates
const calculateDays = (start: Date, end: Date): number => {
  let count = 0;
  let curDate = new Date(start.getTime());
  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leaveType, startDate, endDate, reason, relationship } = req.body;
    let documentUrl;

    if (req.file) {
      documentUrl = `/uploads/${req.file.filename}`;
    }

    if (!leaveType || !startDate || !endDate || !reason) {
      return next(new AppError('Please provide all required fields', 400));
    }

    if (leaveType === 'Bereavement Leave' && !relationship) {
      return next(new AppError('Please provide the relationship for Bereavement Leave', 400));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return next(new AppError('End date cannot be before start date', 400));
    }

    const numberOfDays = calculateDays(start, end);
    if (numberOfDays === 0) {
      return next(new AppError('Leave duration must include at least one working day', 400));
    }

    const leaveRequest = await LeaveRequest.create({
      userId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      documentUrl,
      relationship,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      data: leaveRequest,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMyLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaves = await LeaveRequest.find({ userId: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAllLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate({
        path: 'userId',
        select: 'firstName lastName email departmentId designationId role',
        populate: [
          { path: 'departmentId', select: 'departmentName' },
          { path: 'designationId', select: 'designationName' }
        ]
      })
      .sort('-createdAt')
      .lean();

    const mappedLeaves = leaves.map((leave: any) => {
      if (leave.userId) {
        leave.userId.departmentName = leave.userId.departmentId?.departmentName || 'Not Assigned';
        leave.userId.designationName = leave.userId.designationId?.designationName || 'Not Set';
      }
      return leave;
    });
      
    res.status(200).json({
      success: true,
      data: mappedLeaves,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return next(new AppError('Leave request not found', 404));
    }

    // Do not allow employees to approve their own request (should be prevented by routes restrictTo anyway)
    if (leave.userId.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot approve/reject your own leave request', 403));
    }

    leave.status = status;
    if (status === 'Rejected') {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error: any) {
    next(error);
  }
};
