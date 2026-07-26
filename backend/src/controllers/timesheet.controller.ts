import { Request, Response, NextFunction } from 'express';
import { Timesheet } from '../models/timesheet.model';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { AppError } from '../utils/error';

export const createTimesheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, taskId, date, description, hoursWorked, status } = req.body;

    if (!projectId || !taskId || !date || !description || hoursWorked === undefined) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Verify task exists and is assigned to this employee
    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only log time for tasks assigned to you', 403));
    }
    
    if (task.projectId.toString() !== projectId) {
      return next(new AppError('Task does not belong to the selected project', 400));
    }

    const project = await Project.findById(projectId);
    if (!project || !project.teamMembers.includes(req.user._id)) {
      return next(new AppError('You are not a member of this project', 403));
    }

    const timesheet = await Timesheet.create({
      employeeId: req.user._id,
      projectId,
      taskId,
      date,
      description,
      hoursWorked,
      status: status || 'Draft',
    });

    await timesheet.populate('taskId', 'title');

    res.status(201).json({
      success: true,
      data: timesheet,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMyTimesheets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const timesheets = await Timesheet.find({ employeeId: req.user._id })
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: timesheets,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateTimesheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return next(new AppError('Timesheet not found', 404));
    }

    if (timesheet.employeeId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (timesheet.status === 'Approved' || timesheet.status === 'Submitted') {
      return next(new AppError('Cannot edit submitted or approved timesheets', 400));
    }

    const { projectId, taskId, date, description, hoursWorked } = req.body;

    if (projectId) timesheet.projectId = projectId;
    if (taskId) timesheet.taskId = taskId;
    if (date) timesheet.date = date;
    if (description) timesheet.description = description;
    if (hoursWorked !== undefined) timesheet.hoursWorked = hoursWorked;
    
    // Reset rejection reason if being edited after rejection
    if (timesheet.status === 'Rejected') {
      timesheet.status = 'Draft';
      timesheet.rejectionReason = undefined;
    }

    await timesheet.save();
    await timesheet.populate('taskId', 'title');

    res.status(200).json({
      success: true,
      data: timesheet,
    });
  } catch (error: any) {
    next(error);
  }
};

export const submitTimesheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return next(new AppError('Timesheet not found', 404));
    }

    if (timesheet.employeeId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (timesheet.status !== 'Draft' && timesheet.status !== 'Rejected') {
      return next(new AppError('Only Draft or Rejected timesheets can be submitted', 400));
    }

    timesheet.status = 'Submitted';
    await timesheet.save();
    await timesheet.populate('taskId', 'title');

    res.status(200).json({
      success: true,
      data: timesheet,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getTeamTimesheets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only show submitted, approved, or rejected timesheets (not Drafts)
    // To ensure manager only sees their team's tasks, we can populate task and filter, 
    // or we can find tasks assigned by this manager first.
    
    const managerProjects = await Project.find({ managerId: req.user._id }).select('_id');
    const projectIds = managerProjects.map(p => p._id);

    const timesheets = await Timesheet.find({
      projectId: { $in: projectIds },
      status: { $in: ['Submitted', 'Approved', 'Rejected'] }
    })
      .populate('employeeId', 'firstName lastName email profileImage')
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: timesheets,
    });
  } catch (error: any) {
    next(error);
  }
};

export const reviewTimesheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return next(new AppError('Status must be Approved or Rejected', 400));
    }

    if (status === 'Rejected' && !rejectionReason) {
      return next(new AppError('Rejection reason is required', 400));
    }

    const timesheet = await Timesheet.findById(req.params.id).populate('projectId');

    if (!timesheet) {
      return next(new AppError('Timesheet not found', 404));
    }

    // Verify manager is the one who manages the project
    const project: any = timesheet.projectId;
    if (project.managerId.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return next(new AppError('Not authorized to review this timesheet', 403));
    }

    timesheet.status = status;
    timesheet.reviewedBy = req.user._id;
    timesheet.reviewedAt = new Date();
    
    if (status === 'Rejected') {
      timesheet.rejectionReason = rejectionReason;
    }

    await timesheet.save();
    
    // re-populate
    const populated = await Timesheet.findById(timesheet._id)
      .populate('employeeId', 'firstName lastName email profileImage')
      .populate('projectId', 'name')
      .populate('taskId', 'title');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error: any) {
    next(error);
  }
};
