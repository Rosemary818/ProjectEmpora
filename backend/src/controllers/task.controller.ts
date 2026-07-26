import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
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
    const { status } = req.body;

    if (!['To Do', 'In Progress', 'Completed'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Allow if user is assignee or assigner
    if (
      task.assignedTo.toString() !== req.user._id.toString() &&
      task.assignedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'SuperAdmin'
    ) {
      return next(new AppError('Not authorized to update this task', 403));
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

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
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
