import { Request, Response, NextFunction } from 'express';
import { Visitor } from '../models/visitor.model';
import { AppError } from '../utils/error';

// 1. Host Checks In Visitor
export const checkInVisitor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return next(new AppError('Visitor not found', 404));
    }

    if (visitor.hostUserId.toString() !== req.user.id) {
      return next(new AppError('Only the host can check in this visitor', 403));
    }

    if (visitor.status !== 'Expected') {
      return next(new AppError(`Cannot check in visitor with status: ${visitor.status}`, 400));
    }

    visitor.status = 'Checked In';
    visitor.checkInTime = new Date();
    await visitor.save();

    // In a real application, you might trigger a notification to the host or reception here.

    res.status(200).json({ success: true, data: visitor });
  } catch (error) {
    next(error);
  }
};

// 2. Host Checks Out Visitor
export const checkOutVisitor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return next(new AppError('Visitor not found', 404));
    }

    if (visitor.hostUserId.toString() !== req.user.id) {
      return next(new AppError('Only the host can check out this visitor', 403));
    }

    if (visitor.status !== 'Checked In') {
      return next(new AppError(`Cannot check out visitor with status: ${visitor.status}`, 400));
    }

    visitor.status = 'Checked Out';
    visitor.checkOutTime = new Date();
    await visitor.save();

    res.status(200).json({ success: true, data: visitor });
  } catch (error) {
    next(error);
  }
};

// 3. HR Admin Gets All Visitors
export const getHRVisitors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitors = await Visitor.find()
      .populate('hostUserId', 'firstName lastName email')
      .populate('meetingId', 'title date startTime endTime')
      .populate('roomId', 'name type')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: visitors });
  } catch (error) {
    next(error);
  }
};
