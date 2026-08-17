import { Request, Response, NextFunction } from 'express';
import { Attendance } from '../models/attendance.model';
import { AppError } from '../utils/error';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { LeaveRequest } from '../models/leave.model';
import { AttendanceService } from '../services/attendance.service';

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = AttendanceService.getMidnightDate(new Date());

    // Validate that employee is not on leave
    await AttendanceService.validateCanCheckIn(req.user._id, today);

    // Check if user already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return next(new AppError('You have already checked in today', 400));
    }

    const checkInTime = new Date();
    const { status, isLate } = AttendanceService.calculateStatus(checkInTime);

    const attendance = await Attendance.create({
      employee: req.user._id,
      date: today,
      checkIn: checkInTime,
      status,
      isLate,
    });

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('You have already checked in today', 400));
    }
    next(error);
  }
};

export const checkOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = AttendanceService.getMidnightDate(new Date());

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (!attendance) {
      return next(new AppError('You have not checked in today', 400));
    }

    if (attendance.checkOut) {
      return next(new AppError('You have already checked out today', 400));
    }

    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;

    const { workingHours, overtimeHours } = AttendanceService.calculateHours(attendance.checkIn, checkOutTime);
    attendance.workingHours = workingHours;
    attendance.overtimeHours = overtimeHours;

    await attendance.save();

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMyAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await Attendance.find({ employee: req.user._id }).sort('-date');
    
    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getTeamAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = req.user.id;
    
    // Find projects managed by this user
    const projects = await Project.find({ managerId });
    const teamMemberIdsSet = new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())));
    const teamMemberIds = [...teamMemberIdsSet];

    // Find those users
    const teamMembers = await User.find({ _id: { $in: teamMemberIds }, role: 'Employee' }).select('firstName lastName email profileImage');
    const validTeamMemberIds = teamMembers.map(u => u._id);

    // Get their attendance
    const attendanceRecords = await Attendance.find({ employee: { $in: validTeamMemberIds } })
      .populate('employee', 'firstName lastName email profileImage')
      .sort('-date -checkIn');

    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = AttendanceService.getMidnightDate(new Date());

    // Get all employees
    const employees = await User.find({ role: 'Employee' }).select('firstName lastName email profileImage');
    const employeeIds = employees.map(u => u._id);

    // Get all attendance records
    const allRecords = await Attendance.find({ employee: { $in: employeeIds } })
      .populate('employee', 'firstName lastName email profileImage')
      .sort('-date -checkIn');

    // Get today's attendance for summary stats
    const todaysAttendance = await Attendance.find({ 
      employee: { $in: employeeIds },
      date: today
    });

    // Get today's approved leaves
    const todayLeaves = await LeaveRequest.find({
      userId: { $in: employeeIds },
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    // Calculate metrics directly using the new model fields
    const totalEmployees = employees.length;
    const present = todaysAttendance.filter(a => a.status === 'Present').length;
    const absent = todaysAttendance.filter(a => a.status === 'Absent').length;
    const late = todaysAttendance.filter(a => a.status === 'Late' || a.isLate).length;
    const onLeave = todayLeaves.length; // Actually, the cron job or service handles On Leave, but we can count approved leaves here too.

    res.status(200).json({
      success: true,
      data: {
        records: allRecords,
        summary: {
          totalEmployees,
          present,
          absent,
          late,
          onLeave
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
