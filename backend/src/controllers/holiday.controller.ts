import { Request, Response, NextFunction } from 'express';
import { Holiday } from '../models/holiday.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/error';

const notifyAllUsers = async (title: string, message: string) => {
  const users = await User.find({ status: 'Active' }).select('_id');
  const notifications = users.map(user => ({
    userId: user._id,
    type: 'Holiday',
    title,
    message,
  }));
  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};

export const createHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await Holiday.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await notifyAllUsers(
      `🎉 New Holiday Added: ${holiday.name}`,
      `A new holiday is scheduled for ${new Date(holiday.date).toLocaleDateString()}`
    );

    res.status(201).json({
      success: true,
      data: holiday,
    });
  } catch (error) {
    next(error);
  }
};

export const getHolidays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: holidays.length,
      data: holidays,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!holiday) {
      return next(new AppError('Holiday not found', 404));
    }

    await notifyAllUsers(
      `📅 Holiday Updated: ${holiday.name}`,
      `The holiday on ${new Date(holiday.date).toLocaleDateString()} has been updated.`
    );

    res.status(200).json({
      success: true,
      data: holiday,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);

    if (!holiday) {
      return next(new AppError('Holiday not found', 404));
    }

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
