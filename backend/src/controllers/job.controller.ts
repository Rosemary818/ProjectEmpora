import { Request, Response } from 'express';
import { Job } from '../models/job.model';
import { JobApplication } from '../models/jobApplication.model';
import { User, IUser } from '../models/user.model';
import { ConversionService } from '../services/conversion.service';
import mongoose from 'mongoose';

// Create a new job
export const createJob = async (req: Request, res: Response) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all jobs (for HR Admin)
export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find()
      .populate('departmentId', 'departmentName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get only published jobs (for Career Portal)
export const getPublishedJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ 
      status: 'Published',
      deadline: { $gte: new Date() }
    })
      .populate('departmentId', 'departmentName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('departmentId', 'departmentName');
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('departmentId', 'departmentName');

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get job statistics
export const getJobStats = async (req: Request, res: Response) => {
  try {
    const totalJobs = await Job.countDocuments();
    const publishedJobs = await Job.countDocuments({ status: 'Published' });
    const draftJobs = await Job.countDocuments({ status: 'Draft' });
    const closedJobs = await Job.countDocuments({ status: 'Closed' });

    res.status(200).json({
      success: true,
      data: {
        total: totalJobs,
        published: publishedJobs,
        draft: draftJobs,
        closed: closedJobs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all applications for HR Admin
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const { JobApplication } = await import('../models/jobApplication.model');
    
    const applications = await JobApplication.find()
      .populate('candidateId', 'firstName lastName email phoneNumber location profileImage')
      .populate({
        path: 'jobId',
        select: 'title departmentId employmentType location',
        populate: { path: 'departmentId', select: 'departmentName' }
      })
      .sort({ appliedAt: -1 });
      
    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update an application status
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { JobApplication } = await import('../models/jobApplication.model');
    const { status, offerLetterUrl } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    application.status = status;
    if (offerLetterUrl) {
      application.offerLetterUrl = offerLetterUrl;
    }
    application.statusHistory.push({ status, date: new Date() });
    
    await application.save();

    // If converted to employee, update user role
    let emailSent = false;
    if (status === 'Converted to Employee') {
      const user = await User.findById(application.candidateId);
      if (user) {
        if (user.role === 'Employee') {
          return res.status(400).json({ success: false, error: 'This candidate has already been converted to an employee' });
        }
        
        const result = await ConversionService.setupEmployeeCredentialsAndEmail(user as IUser);
        emailSent = result.emailSent;
        // Saving the user will trigger the pre-save hook to generate employeeCode if not set
        await user.save();
      }
    }

    res.status(200).json({ success: true, data: application, emailSent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resendWelcomeEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const application = await JobApplication.findById(id);
    
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (application.status !== 'Converted to Employee') {
      return res.status(400).json({ success: false, error: 'Application has not been converted to an employee yet' });
    }

    const user = await User.findById(application.candidateId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Employee account not found for this application' });
    }

    const emailSent = await ConversionService.regeneratePasswordAndResendEmail(user as IUser);
    await user.save();

    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Failed to send welcome email' });
    }

    res.status(200).json({
      success: true,
      message: 'Welcome email resent successfully',
      email: user.email
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
