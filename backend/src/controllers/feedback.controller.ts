import { Request, Response, NextFunction } from 'express';
import { Feedback } from '../models/feedback.model';
import { Complaint } from '../models/complaint.model';
import { ServiceRequest } from '../models/serviceRequest.model';
import { AppError } from '../utils/error';

export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId, requestType, rating, comment } = req.body;

    if (!requestId || !requestType || !rating) {
      return next(new AppError('Please provide requestId, requestType, and rating', 400));
    }

    if (requestType !== 'Complaint' && requestType !== 'ServiceRequest') {
      return next(new AppError('Invalid requestType', 400));
    }

    let requestDoc;
    if (requestType === 'Complaint') {
      requestDoc = await Complaint.findById(requestId);
    } else {
      requestDoc = await ServiceRequest.findById(requestId);
    }

    if (!requestDoc) {
      return next(new AppError(`${requestType} not found`, 404));
    }

    // Ensure the current user is the requester
    if (requestDoc.employeeId.toString() !== req.user.id) {
      return next(new AppError('You can only submit feedback for your own requests', 403));
    }

    // Ensure status is Solved/Resolved
    if (requestDoc.status !== 'Solved' && requestDoc.status !== 'Resolved' && requestDoc.status !== 'Closed') {
      return next(new AppError(`Feedback can only be submitted for resolved requests`, 400));
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ requestId, requestType: requestType as 'Complaint' | 'ServiceRequest' });
    if (existingFeedback) {
      return next(new AppError('Feedback has already been submitted for this request', 400));
    }

    const feedback = await Feedback.create({
      requestId,
      requestType,
      requesterId: req.user.id,
      serviceExecutiveId: requestDoc.repliedBy,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackForRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestType, requestId } = req.params;

    const feedback = await Feedback.findOne({ requestId, requestType: requestType as 'Complaint' | 'ServiceRequest' })
      .populate('requesterId', 'firstName lastName profileImage')
      .populate('serviceExecutiveId', 'firstName lastName profileImage');

    res.status(200).json({
      success: true,
      data: feedback || null
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceExecutiveFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only ServiceExecutives should ideally call this, but we filter by req.user.id
    const feedbacks = await Feedback.find({ serviceExecutiveId: req.user.id })
      .populate('requesterId', 'firstName lastName profileImage employeeCode')
      .populate('requestId') // might not populate properly due to refPath without manual population if requestId fields differ
      .sort({ createdAt: -1 });

    let totalRating = 0;
    let fiveStarCount = 0;
    let lowRatingCount = 0;

    for (const f of feedbacks) {
      totalRating += f.rating;
      if (f.rating === 5) fiveStarCount++;
      if (f.rating <= 3) lowRatingCount++;
    }

    const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      metrics: {
        averageRating,
        totalFeedback: feedbacks.length,
        fiveStarCount,
        lowRatingCount
      },
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};
