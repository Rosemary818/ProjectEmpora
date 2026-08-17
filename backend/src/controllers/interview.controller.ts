import { Request, Response } from 'express';
import { Interview } from '../models/interview.model';
import { JobApplication } from '../models/jobApplication.model';
import { Notification } from '../models/notification.model';

export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const {
      applicationId,
      candidateId,
      jobId,
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

    if (!applicationId || !candidateId || !jobId || !round || !interviewType || !date || !startTime || !endTime || !interviewer || !interviewerId) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
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
      applicationId,
      candidateId,
      jobId,
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

    const application = await JobApplication.findById(applicationId);
    if (application) {
      application.status = 'Interview Scheduled';
      application.statusHistory.push({ status: 'Interview Scheduled', date: new Date() });
      await application.save();
    }

    await Notification.create({
      userId: candidateId,
      title: 'Interview Scheduled',
      message: `Your ${round} interview has been scheduled on ${interviewDate.toLocaleDateString()} at ${startTime}.`,
      type: 'General',
      isRead: false
    });

    await Notification.create({
      userId: interviewerId,
      title: 'New Interview Assigned',
      message: `You have been assigned to conduct a ${round} interview on ${interviewDate.toLocaleDateString()} at ${startTime}.`,
      type: 'General',
      isRead: false
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHRInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await Interview.find()
      .populate('candidateId', 'firstName lastName email profileImage')
      .populate('jobId', 'title departmentId')
      .populate('opportunityId', 'title departmentId')
      .sort({ date: 1, startTime: 1 });
    res.status(200).json({ success: true, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCandidateInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await Interview.find({ candidateId: req.user.id })
      .populate('jobId', 'title')
      .populate('opportunityId', 'title')
      .sort({ date: 1, startTime: 1 });
    res.status(200).json({ success: true, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, meetingLink, venue, notes, interviewer, status, interviewType } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    let isRescheduled = false;
    let oldDate = interview.date;
    let oldTime = interview.startTime;

    if (date) interview.date = new Date(date);
    if (startTime) interview.startTime = startTime;
    if (endTime) interview.endTime = endTime;
    if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    if (venue !== undefined) interview.venue = venue;
    if (notes !== undefined) interview.notes = notes;
    if (interviewer) interview.interviewer = interviewer;
    if (interviewType) interview.interviewType = interviewType;

    if (status) {
       interview.status = status;
    } else if (date || startTime || endTime) {
       // Only count as rescheduled if the user isn't explicitly marking it as completed or cancelled and time changed
       if (oldDate.getTime() !== interview.date.getTime() || oldTime !== interview.startTime) {
           interview.status = 'Rescheduled';
           isRescheduled = true;
       }
    }

    if (interview.interviewType === 'Online' && !interview.meetingLink) {
        return res.status(400).json({ success: false, error: 'Meeting Link is required for Online interviews' });
    }
    if (interview.interviewType === 'Offline' && !interview.venue) {
        return res.status(400).json({ success: false, error: 'Venue is required for Offline interviews' });
    }

    if (interview.endTime <= interview.startTime) {
        return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    await interview.save();

    if (isRescheduled) {
      await Notification.create({
        userId: interview.candidateId,
        title: 'Interview Rescheduled',
        message: `Your ${interview.round} interview has been rescheduled to ${interview.date.toLocaleDateString()} at ${interview.startTime}.`,
        type: 'General',
        isRead: false
      });
    }

    if (status === 'Completed') {
       await Notification.create({
        userId: interview.candidateId,
        title: 'Interview Completed',
        message: `Your ${interview.round} interview was marked as completed.`,
        type: 'General',
        isRead: false
      });
    }

    res.status(200).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const cancelInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Cancellation reason is required' });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    interview.status = 'Cancelled';
    interview.cancellationReason = reason;
    await interview.save();

    await Notification.create({
      userId: interview.candidateId,
      title: 'Interview Cancelled',
      message: `Your ${interview.round} interview has been cancelled. Reason: ${reason}`,
      type: 'General',
      isRead: false
    });

    res.status(200).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHRDashboardWidgets = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayCount, upcomingCount, completedCount] = await Promise.all([
      Interview.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: { $in: ['Scheduled', 'Rescheduled'] } }),
      Interview.countDocuments({ date: { $gte: tomorrow }, status: { $in: ['Scheduled', 'Rescheduled'] } }),
      Interview.countDocuments({ status: 'Completed' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayInterviews: todayCount,
        upcomingInterviews: upcomingCount,
        completedInterviews: completedCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCandidateDashboardWidgets = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingInterview = await Interview.findOne({ 
      candidateId: req.user.id, 
      date: { $gte: today }, 
      status: { $in: ['Scheduled', 'Rescheduled'] } 
    }).sort({ date: 1, startTime: 1 })
      .populate('jobId', 'title')
      .populate('opportunityId', 'title');

    res.status(200).json({
      success: true,
      data: {
        nextInterview: upcomingInterview
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getManagerInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await Interview.find({ interviewerId: req.user.id })
      .populate('candidateId', 'firstName lastName email profileImage phone')
      .populate('jobId', 'title')
      .populate('opportunityId', 'title')
      .populate({
        path: 'applicationId',
        select: 'resume coverLetter relevantSkills reason'
      })
      .sort({ date: 1, startTime: 1 });
    res.status(200).json({ success: true, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { technicalRating, communicationRating, problemSolvingRating, recommendation, comments } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    if (interview.interviewerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to submit feedback for this interview' });
    }

    interview.feedback = {
      technicalRating,
      communicationRating,
      problemSolvingRating,
      recommendation,
      comments,
      submittedAt: new Date()
    };
    interview.status = 'Completed';
    await interview.save();

    // Notify HR Admins
    const hrAdmins = await import('../models/user.model').then(m => m.User.find({ role: 'HRAdmin', status: 'Active' }));
    const notifications = hrAdmins.map(hr => ({
      userId: hr._id,
      title: 'Interview Feedback Submitted',
      message: `Feedback for ${interview.round} has been submitted by the interviewer.`,
      type: 'General',
      isRead: false
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const hrDecision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'Proceed to Next Round', 'Select Candidate', 'Reject Candidate'

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    let application: any = null;
    let isInternal = interview.applicationModel === 'InternalApplication';

    if (isInternal) {
      application = await import('../models/internalApplication.model').then(m => m.InternalApplication.findById(interview.applicationId));
    } else {
      application = await JobApplication.findById(interview.applicationId);
    }

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (decision === 'Proceed to Next Round') {
      application.status = 'Under Review';
      if (!isInternal) application.statusHistory.push({ status: 'Under Review', date: new Date() });
    } else if (decision === 'Select Candidate') {
      application.status = 'Selected';
      if (!isInternal) application.statusHistory.push({ status: 'Selected', date: new Date() });
    } else if (decision === 'Reject Candidate') {
      application.status = 'Rejected';
      if (!isInternal) application.statusHistory.push({ status: 'Rejected', date: new Date() });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid decision' });
    }

    await application.save();
    res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
