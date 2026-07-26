import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { LeaveRequest } from '../models/leave.model';
import { Attendance } from '../models/attendance.model';
import { Task } from '../models/task.model';
import { Timesheet } from '../models/timesheet.model';
import { AppError } from '../utils/error';

// HR Admin / SuperAdmin: Get all employees and managers
export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await User.find({ role: { $in: ['Employee', 'Manager'] } })
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error: any) {
    next(error);
  }
};

// SuperAdmin: Get ALL users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    next(error);
  }
};

// HR Admin / SuperAdmin: Get single user details with stats
export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Only allow HRAdmin to view Employee/Manager, SuperAdmin can view all
    if (req.user.role === 'HRAdmin' && !['Employee', 'Manager'].includes(user.role)) {
      return next(new AppError('HR Admins can only view Employees and Managers', 403));
    }

    // Fetch related stats
    const totalLeaves = await LeaveRequest.countDocuments({ userId: user._id });
    const pendingLeaves = await LeaveRequest.countDocuments({ userId: user._id, status: 'Pending' });
    const totalAttendance = await Attendance.countDocuments({ userId: user._id });
    const assignedTasks = await Task.countDocuments({ assignedTo: user._id });
    const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Completed' });
    const submittedTimesheets = await Timesheet.countDocuments({ employeeId: user._id, status: 'Submitted' });
    const approvedTimesheets = await Timesheet.countDocuments({ employeeId: user._id, status: 'Approved' });

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalLeaves,
          pendingLeaves,
          totalAttendance,
          assignedTasks,
          completedTasks,
          submittedTimesheets,
          approvedTimesheets
        }
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update permitted user profile fields (HRAdmin/SuperAdmin)
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (req.user.role === 'HRAdmin' && !['Employee', 'Manager'].includes(user.role)) {
      return next(new AppError('HR Admins can only modify Employees and Managers', 403));
    }

    const { department, jobTitle, status } = req.body;

    if (department !== undefined) user.department = department;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (status !== undefined) {
      if (!['Active', 'Inactive'].includes(status)) {
        return next(new AppError('Invalid status', 400));
      }
      user.status = status;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

// Update user status (Activate/Deactivate)
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return next(new AppError('Status must be Active or Inactive', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (req.user.role === 'HRAdmin' && !['Employee', 'Manager'].includes(user.role)) {
      return next(new AppError('HR Admins can only change status of Employees and Managers', 403));
    }
    
    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot change your own status', 400));
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};
