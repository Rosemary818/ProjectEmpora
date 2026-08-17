import { Request, Response, NextFunction } from 'express';
import { Training } from '../models/training.model';
import { TrainingEnrollment } from '../models/trainingEnrollment.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Notification } from '../models/notification.model';
import { AppError } from '../utils/error';

// HR Admin: Create a new training
export const createTraining = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainingData = {
      ...req.body,
      createdBy: req.user.id
    };

    const training = await Training.create(trainingData);

    res.status(201).json({
      success: true,
      data: training
    });
  } catch (error) {
    next(error);
  }
};

// HR Admin: Update a training
export const updateTraining = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!training) {
      return next(new AppError('Training not found', 404));
    }

    res.status(200).json({
      success: true,
      data: training
    });
  } catch (error) {
    next(error);
  }
};

// All: Get available trainings
export const getAvailableTrainings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainings = await Training.find({ status: 'Active' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    next(error);
  }
};

// Employee/Manager: Enroll in a training
export const enrollTraining = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainingId = req.params.id;
    const employeeId = req.user.id;

    const training = await Training.findById(trainingId);
    if (!training || training.status !== 'Active') {
      return next(new AppError('Training is not available for enrollment', 400));
    }

    const existingEnrollment = await TrainingEnrollment.findOne({ employeeId, trainingId });
    if (existingEnrollment) {
      return next(new AppError('You are already enrolled in this training', 400));
    }

    const enrollment = await TrainingEnrollment.create({
      employeeId: employeeId as string,
      trainingId: trainingId as string,
      status: 'Enrolled'
    });

    // Notify employee
    await Notification.create({
      userId: employeeId,
      type: 'System',
      title: 'Training Enrollment',
      message: `You have successfully enrolled in the training: ${training.title}`
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// Employee/Manager: Update training status
export const updateEnrollmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    if (!['In Progress', 'Completed'].includes(status)) {
      return next(new AppError('Invalid status update', 400));
    }

    const enrollment = await TrainingEnrollment.findOne({ 
      _id: req.params.id,
      employeeId: req.user.id
    }).populate('trainingId', 'title');

    if (!enrollment) {
      return next(new AppError('Enrollment record not found', 404));
    }

    enrollment.status = status;
    if (status === 'In Progress' && !enrollment.startedAt) {
      enrollment.startedAt = new Date();
    }
    if (status === 'Completed' && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      
      // Notify HR Admins optionally
      const hrAdmins = await User.find({ role: 'HRAdmin' });
      const hrNotifications = hrAdmins.map(hr => ({
        userId: hr._id,
        type: 'System',
        title: 'Training Completed',
        message: `Employee ${req.user.firstName} ${req.user.lastName} has completed the training: ${(enrollment.trainingId as any).title}`
      }));
      if (hrNotifications.length > 0) {
        await Notification.insertMany(hrNotifications);
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// Employee/Manager: Get my enrolled trainings
export const getMyTrainings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments = await TrainingEnrollment.find({ employeeId: req.user.id })
      .populate('trainingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Manager: Get direct team's trainings
export const getTeamTrainings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Determine team members based on Project assignments (mirroring Empora's logic)
    const projects = await Project.find({ managerId: req.user.id });
    const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];

    const enrollments = await TrainingEnrollment.find({ employeeId: { $in: teamMemberIds } })
      .populate('employeeId', 'firstName lastName employeeCode')
      .populate('trainingId', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// HR Admin: Get enrollments and summary for a specific training
export const getTrainingEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainingId = req.params.id;
    
    const enrollments = await TrainingEnrollment.find({ trainingId })
      .populate({
        path: 'employeeId',
        select: 'firstName lastName departmentId',
        populate: { path: 'departmentId', select: 'departmentName' }
      })
      .sort({ createdAt: -1 });

    let inProgress = 0;
    let completed = 0;

    enrollments.forEach(en => {
      if (en.status === 'In Progress') inProgress++;
      if (en.status === 'Completed') completed++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalEnrolled: enrollments.length,
        inProgress,
        completed,
        enrollments
      }
    });
  } catch (error) {
    next(error);
  }
};

// HR Admin: Get all trainings (including Inactive)
export const getAllTrainings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    next(error);
  }
};
