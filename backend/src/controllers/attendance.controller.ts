import { Request, Response, NextFunction } from 'express';
import { Attendance } from '../models/attendance.model';
import { AppError } from '../utils/error';

// Helper to truncate date to midnight for accurate day comparison
const getMidnightDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Helper to format hours and minutes
const formatWorkingHours = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = getMidnightDate(new Date());

    // Check if user already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return next(new AppError('You have already checked in today', 400));
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      checkInTime: new Date(),
      status: 'Present',
    });

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Handle MongoDB duplicate key error for unique index
      return next(new AppError('You have already checked in today', 400));
    }
    next(error);
  }
};

export const checkOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = getMidnightDate(new Date());

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!attendance) {
      return next(new AppError('You have not checked in today', 400));
    }

    if (attendance.checkOutTime) {
      return next(new AppError('You have already checked out today', 400));
    }

    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;

    // Calculate duration
    const durationMs = checkOutTime.getTime() - attendance.checkInTime.getTime();
    attendance.totalWorkingHours = formatWorkingHours(durationMs);

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
    const records = await Attendance.find({ userId: req.user._id }).sort('-date');
    
    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    next(error);
  }
};
