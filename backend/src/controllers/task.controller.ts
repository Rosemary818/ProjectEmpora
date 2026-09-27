import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { Notification } from '../models/notification.model';
import { AppError } from '../utils/error';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

    if (!title || !description || !projectId || !assignedTo || !dueDate) {
      return next(new AppError('Please provide all required fields', 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }
    
    if (project.managerId.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return next(new AppError('Not authorized to assign tasks for this project', 403));
    }
    
    if (!project.teamMembers.includes(assignedTo)) {
      return next(new AppError('Employee is not a member of this project team', 400));
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate,
      assignedBy: req.user._id,
      status: 'To Do',
      progressPercentage: 0,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getManagerTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Manager only sees tasks they created
    const tasks = await Task.find({ assignedBy: req.user._id })
      .populate('assignedTo', 'firstName lastName email profileImage')
      .populate('projectId', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Employee only sees tasks assigned to them
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedBy', 'firstName lastName email profileImage')
      .populate('projectId', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, blockedReason, managerComment } = req.body;

    if (!['To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    const isAssigner = task.assignedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'SuperAdmin';

    if (!isAssignee && !isAssigner && !isSuperAdmin) {
      return next(new AppError('Not authorized to update this task', 403));
    }

    // Role specific rules
    if (isAssignee && !isAssigner && !isSuperAdmin) {
      if (status === 'Completed') {
        return next(new AppError('Employees cannot mark tasks as Completed directly. Submit for review instead.', 403));
      }
    }

    // Logic for new statuses
    if (status === 'In Progress' && task.status === 'To Do') {
      task.startedAt = new Date();
    }
    
    if (status === 'Under Review') {
      task.progressPercentage = 100;
    }

    if (status === 'Completed') {
      if (task.status !== 'Under Review') {
        return next(new AppError('Task must be Under Review to be approved', 400));
      }
      task.progressPercentage = 100;
      task.completedAt = new Date();
      if (managerComment) {
        task.managerComment = managerComment;
      }
      
      if (!task.history) task.history = [];
      task.history.push({
        action: 'Task Approved & Completed',
        date: new Date(),
        by: req.user._id
      });
      
      // Notify employee
      await Notification.create({
        userId: task.assignedTo,
        type: 'Task',
        title: 'Task Approved',
        message: `Your task "${task.title}" has been approved and marked as Completed.`,
      });
    }

    if (status === 'Blocked') {
      if (!blockedReason && !task.blockedReason) {
        return next(new AppError('Blocked reason is required', 400));
      }
      if (blockedReason) task.blockedReason = blockedReason;
    }

    if (status === 'In Progress' && task.status === 'Under Review') {
      // Manager rejected
      if (managerComment) task.managerComment = managerComment;
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateTaskProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { progressPercentage } = req.body;

    if (progressPercentage === undefined || progressPercentage < 0 || progressPercentage > 100) {
      return next(new AppError('Invalid progress percentage. Must be between 0 and 100.', 400));
    }
    
    progressPercentage = Number(progressPercentage);

    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.assignedTo.toString() !== req.user._id.toString() && task.assignedBy.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return next(new AppError('Not authorized to update this task', 403));
    }

    if (task.status !== 'In Progress') {
      return next(new AppError('Progress can only be updated when task is In Progress', 400));
    }

    if (progressPercentage === 100) {
      task.status = 'Under Review';
    } else if (progressPercentage === 0) {
      task.status = 'To Do';
    }

    task.progressPercentage = progressPercentage;
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    next(error);
  }
};


export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Only assigner (manager) can edit details
    if (task.assignedBy.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return next(new AppError('Not authorized to edit this task', 403));
    }

    // We allow managers to edit tasks even if they are completed
    // to fix bad data or retroactively update details.
    
    const { title, description, projectId, assignedTo, priority, dueDate, reopenTask } = req.body;
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (projectId) updateData.projectId = projectId;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;
    if (dueDate) {
      updateData.dueDate = dueDate;
    }

    if (task.status === 'Completed' && reopenTask) {
      updateData.status = 'In Progress';
      
      updateData.history = task.history || [];
      updateData.history.push({
        action: 'Task reopened by Manager',
        date: new Date(),
        by: req.user._id
      });
      
      // Notify employee
      await Notification.create({
        userId: task.assignedTo,
        type: 'Task',
        title: 'Task Reopened',
        message: `Task "${title || task.title}" has been reopened by your manager.`,
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Only assigner can delete
    if (task.assignedBy.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return next(new AppError('Not authorized to delete this task', 403));
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    next(error);
  }
};
