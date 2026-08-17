import { Request, Response, NextFunction } from 'express';
import { Referral } from '../models/referral.model';
import { User, IUser } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { AppError } from '../utils/error';
import { Department } from '../models/department.model';
import { Designation } from '../models/designation.model';
import mongoose from 'mongoose';
import { ConversionService } from '../services/conversion.service';

// Helper to create notifications
const sendNotification = async (userId: any, title: string, message: string) => {
  await Notification.create({
    userId,
    type: 'Referral',
    title,
    message
  });
};

// 1. Employee: Submit a Referral
export const submitReferral = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateName, email, phone, position, department, experience, currentCompany, expectedCTC, linkedIn, notes } = req.body;
    
    if (!req.file) {
      return next(new AppError('Please upload a resume', 400));
    }

    const resumePath = `/uploads/${req.file.filename}`;

    const existingReferral = await Referral.findOne({ email: email.toLowerCase(), position });
    if (existingReferral) {
      return next(new AppError('A referral for this candidate and position already exists', 400));
    }

    const referral = await Referral.create({
      candidateName,
      email: email.toLowerCase(),
      phone,
      position,
      department,
      experience: Number(experience),
      currentCompany,
      expectedCTC,
      resume: resumePath,
      linkedIn,
      notes,
      referredBy: req.user.id
    });

    // Notify employee
    await sendNotification(req.user.id, 'Referral Submitted', `Your referral for ${candidateName} has been successfully submitted.`);

    res.status(201).json({
      success: true,
      data: referral
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('A referral for this candidate and position already exists', 400));
    }
    next(error);
  }
};

// 2. Employee: Get My Referrals
export const getMyReferrals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const referrals = await Referral.find({ referredBy: req.user.id }).sort('-createdAt');

    const totalReferrals = referrals.length;
    const pending = referrals.filter(r => r.status === 'Pending').length;
    const hired = referrals.filter(r => r.status === 'Hired').length;

    res.status(200).json({
      success: true,
      data: {
        referrals,
        summary: {
          totalReferrals,
          pending,
          hired
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. HR Admin: Get All Referrals
export const getAllReferrals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const referrals = await Referral.find().populate('referredBy', 'firstName lastName email').sort('-createdAt');

    const totalReferrals = referrals.length;
    const pendingReview = referrals.filter(r => r.status === 'Pending').length;
    const underReview = referrals.filter(r => r.status === 'Under Review').length;
    const shortlisted = referrals.filter(r => r.status === 'Shortlisted').length;
    const interviewScheduled = referrals.filter(r => r.status === 'Interview Scheduled').length;
    const hired = referrals.filter(r => r.status === 'Hired').length;

    res.status(200).json({
      success: true,
      data: {
        referrals,
        summary: {
          totalReferrals,
          pendingReview,
          underReview,
          shortlisted,
          interviewScheduled,
          hired
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. HR Admin: Update Referral Status
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Hired', 'Converted', 'Rejected'];
    
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const referral = await Referral.findById(req.params.id);
    if (!referral) {
      return next(new AppError('Referral not found', 404));
    }

    referral.status = status;
    await referral.save();

    // Notify employee about the status change
    await sendNotification(
      referral.referredBy, 
      'Referral Status Updated', 
      `The status of your referral for ${referral.candidateName} has been updated to: ${status}`
    );

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (error) {
    next(error);
  }
};

// 5. HR Admin: Convert to Employee
export const convertToEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const referral = await Referral.findById(req.params.id);
    
    if (!referral) {
      return next(new AppError('Referral not found', 404));
    }

    if (referral.status !== 'Hired') {
      return next(new AppError('Only candidates with status "Hired" can be converted to an employee', 400));
    }

    if (referral.convertedToEmployee) {
      return next(new AppError('This referral has already been converted to an employee', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: referral.email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400));
    }

    // Generate Employee ID
    const employeeCode = 'EMP' + Math.floor(1000 + Math.random() * 9000); // Random EMP####

    // Name splitting (naive)
    const nameParts = referral.candidateName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Not Provided';

    // Validate Department, Designation, and Manager
    const dept = referral.departmentId 
      ? await Department.findById(referral.departmentId)
      : await Department.findOne({ departmentName: referral.department });
      
    const desig = await Designation.findOne({ designationName: referral.position });

    if (!dept || !desig || !dept.managerId) {
      return next(new AppError('Please assign a valid Department, Designation, and Manager before converting.', 400));
    }

    const newUser = new User({
      firstName,
      lastName,
      email: referral.email,
      phone: referral.phone,
      departmentId: dept._id,
      designationId: desig._id,
      managerId: dept.managerId,
      employeeCode,
      dateOfJoining: new Date()
    });

    const { emailSent } = await ConversionService.setupEmployeeCredentialsAndEmail(newUser as IUser);
    await newUser.save();

    // Update Referral record
    referral.convertedToEmployee = true;
    referral.status = 'Converted';
    referral.employeeId = newUser._id as mongoose.Types.ObjectId;
    await referral.save();

    // Notify referring employee
    await sendNotification(
      referral.referredBy,
      'Employee Account Created',
      `Your referred candidate ${referral.candidateName} is now an official employee!`
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      },
      emailSent
    });
  } catch (error) {
    next(error);
  }
};

// 6. HR Admin: Delete Referral
export const deleteReferral = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const referral = await Referral.findById(req.params.id);
    
    if (!referral) {
      return next(new AppError('Referral not found', 404));
    }

    if (referral.convertedToEmployee) {
      return next(new AppError('Cannot delete a referral that has been converted to an employee', 400));
    }

    await Referral.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Referral deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const resendWelcomeEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const referral = await Referral.findById(req.params.id);
    
    if (!referral) {
      return next(new AppError('Referral not found', 404));
    }

    if (!referral.convertedToEmployee || !referral.employeeId) {
      return next(new AppError('Referral has not been converted to an employee yet', 400));
    }

    const user = await User.findById(referral.employeeId);
    if (!user) {
      return next(new AppError('Employee account not found for this referral', 404));
    }

    const emailSent = await ConversionService.regeneratePasswordAndResendEmail(user as IUser);
    await user.save();

    if (!emailSent) {
      return next(new AppError('Failed to send welcome email', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Welcome email resent successfully'
    });
  } catch (error) {
    next(error);
  }
};
