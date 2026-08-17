import { Request, Response } from 'express';
import { JobApplication } from '../models/jobApplication.model';
import { Job } from '../models/job.model';
import { Notification } from '../models/notification.model';
import { Resume } from '../models/resume.model';
import { SavedJob } from '../models/savedJob.model';

// Apply for a job
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const candidateId = (req as any).user._id;

    // 1. Check if job exists, is published and not expired
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'Published') {
      return res.status(400).json({ success: false, message: 'Job is not actively taking applications' });
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // 2. Check if already applied
    const existingApplication = await JobApplication.findOne({ candidateId, jobId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // 3. Create application
    const { coverLetter, portfolio, github, linkedin } = req.body;
    let resumePath = '';
    
    if (req.file) {
      // In a real prod environment, you might upload to S3. Here we use the local path.
      resumePath = `/uploads/${req.file.filename}`;
    } else {
      const existingResume = await Resume.findOne({ candidateId });
      if (existingResume) {
        resumePath = existingResume.resumeUrl;
      } else {
        return res.status(400).json({ success: false, message: 'Resume is required' });
      }
    }

    const application = await JobApplication.create({
      candidateId,
      jobId: jobId as string,
      status: 'Applied',
      resume: resumePath,
      coverLetter,
      portfolio,
      github,
      linkedin,
      statusHistory: [{ status: 'Applied', date: new Date() }]
    });

    // 3.5 Increment totalApplications on the Job
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } });

    // 4. Create notification
    await Notification.create({
      userId: candidateId,
      type: 'Job',
      title: 'Application Submitted',
      message: `Your application for ${job.title} has been successfully submitted.`
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully applied for the job',
      data: application
    });

  } catch (error: any) {
    console.error('Error applying for job:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Dashboard Data for Candidate
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const candidateId = (req as any).user._id;
    const currentDate = new Date();

    // 1. Available Jobs Count (Published & Not Expired)
    const availableJobsCount = await Job.countDocuments({
      status: 'Published',
      deadline: { $gte: currentDate }
    });

    // 2. Application Counts
    const applicationsSubmitted = await JobApplication.countDocuments({ candidateId });
    const underReviewCount = await JobApplication.countDocuments({ candidateId, status: 'Under Review' });
    const interviewCount = await JobApplication.countDocuments({ candidateId, status: 'Interview Scheduled' });
    const selectedCount = await JobApplication.countDocuments({ candidateId, status: 'Selected' });

    // 3. Latest Job Openings (Max 5)
    const latestJobs = await Job.find({
      status: 'Published',
      deadline: { $gte: currentDate }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('departmentId', 'departmentName');

    // 4. Recent Applications (Max 5)
    const recentApplications = await JobApplication.find({ candidateId })
      .sort({ appliedAt: -1 })
      .limit(5)
      .populate('jobId', 'title');

    // 5. Recent Notifications (Max 5)
    const notifications = await Notification.find({ userId: candidateId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Get a list of all applied Job IDs for the frontend to disable the "Apply" buttons globally
    const appliedJobsRecords = await JobApplication.find({ candidateId }).select('jobId');
    const appliedJobIds = appliedJobsRecords.map(app => app.jobId);

    // 7. Saved Jobs Counts & IDs
    const savedJobsCount = await SavedJob.countDocuments({ candidateId });
    const savedJobsRecords = await SavedJob.find({ candidateId }).select('jobId');
    const savedJobIds = savedJobsRecords.map(sj => sj.jobId);

    return res.status(200).json({
      success: true,
      data: {
        availableJobsCount,
        applicationsSubmitted,
        underReviewCount,
        interviewCount,
        selectedCount,
        latestJobs,
        recentApplications,
        notifications,
        appliedJobIds,
        savedJobsCount,
        savedJobIds
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all applications for the logged-in candidate
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const candidateId = (req as any).user._id;

    const applications = await JobApplication.find({ candidateId })
      .populate({
        path: 'jobId',
        select: 'title departmentId employmentType location',
        populate: { path: 'departmentId', select: 'departmentName' }
      })
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    console.error('Error fetching my applications:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Withdraw an application
export const withdrawApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const candidateId = (req as any).user._id;

    const application = await JobApplication.findOne({ _id: id, candidateId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'Applied' && application.status !== 'Under Review') {
      return res.status(400).json({ 
        success: false, 
        message: 'Application cannot be withdrawn at this stage.' 
      });
    }

    application.status = 'Withdrawn';
    application.statusHistory.push({ status: 'Withdrawn', date: new Date() });
    
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application successfully withdrawn',
      data: application
    });
  } catch (error: any) {
    console.error('Error withdrawing application:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle a saved job
export const toggleSavedJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const candidateId = (req as any).user._id;

    const existingSave = await SavedJob.findOne({ candidateId, jobId });
    
    if (existingSave) {
      await SavedJob.deleteOne({ _id: existingSave._id });
      return res.status(200).json({
        success: true,
        message: 'Job removed from saved jobs',
        saved: false
      });
    } else {
      const newSavedJob = await SavedJob.create({ candidateId, jobId: jobId as string });
      return res.status(201).json({
        success: true,
        message: 'Job saved successfully',
        saved: true,
        data: newSavedJob
      });
    }
  } catch (error: any) {
    console.error('Error toggling saved job:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get saved jobs
export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const candidateId = (req as any).user._id;

    const savedJobs = await SavedJob.find({ candidateId })
      .populate({
        path: 'jobId',
        populate: { path: 'departmentId', select: 'departmentName' }
      })
      .sort({ savedAt: -1 });

    return res.status(200).json({
      success: true,
      data: savedJobs
    });
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

