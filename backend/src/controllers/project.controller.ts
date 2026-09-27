import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/error';
import { calculateProjectStatus } from '../utils/project.helper';
import { syncBenchStatus } from '../utils/bench.helper';

// HRAdmin/SuperAdmin: Create Project
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, startDate, endDate, status, managerId } = req.body;

    if (!name || !description || !startDate || !endDate || !managerId) {
      return next(new AppError('Please provide all required fields', 400));
    }

    if (new Date(endDate) < new Date(startDate)) {
      return next(new AppError('End date cannot be before start date', 400));
    }

    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'Manager') {
      return next(new AppError('Invalid manager selected', 400));
    }

    const calculatedStatus = calculateProjectStatus(startDate, endDate, status);

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      status: calculatedStatus,
      managerId,
      createdBy: req.user._id,
      teamMembers: []
    });

    await project.populate('managerId', 'firstName lastName email profileImage');

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    next(error);
  }
};

// HRAdmin/SuperAdmin: Get all projects
export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await Project.find()
      .populate('managerId', 'firstName lastName email profileImage')
      .populate('teamMembers', 'firstName lastName email profileImage')
      .sort('-createdAt');

    const updatedProjects = projects.map(p => {
      const pObj = p.toObject();
      if (pObj.status !== 'On Hold') {
        pObj.status = calculateProjectStatus(pObj.startDate, pObj.endDate, pObj.status) as any;
      }
      return pObj;
    });

    res.status(200).json({
      success: true,
      data: updatedProjects,
    });
  } catch (error: any) {
    next(error);
  }
};

// HRAdmin/SuperAdmin: Update Project
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    const { name, description, startDate, endDate, status, managerId } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    
    if (new Date(project.endDate) < new Date(project.startDate)) {
      return next(new AppError('End date cannot be before start date', 400));
    }

    const previousStatus = project.status;
    project.status = calculateProjectStatus(project.startDate, project.endDate, status || previousStatus) as any;
    
    if (managerId && managerId !== project.managerId.toString()) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== 'Manager') {
        return next(new AppError('Invalid manager selected', 400));
      }
      project.managerId = managerId;
      
      if (project.teamMembers && project.teamMembers.length > 0) {
        if (manager.departmentId) {
          await User.updateMany(
            { _id: { $in: project.teamMembers } },
            { departmentId: manager.departmentId }
          );
        } else {
          await User.updateMany(
            { _id: { $in: project.teamMembers } },
            { $unset: { departmentId: 1 } }
          );
        }
      }
    }

    await project.save();
    await project.populate('managerId', 'firstName lastName email profileImage');

    if (previousStatus !== 'Completed' && project.status === 'Completed') {
      for (const empId of project.teamMembers) {
        await syncBenchStatus(empId);
      }
    } else if (previousStatus !== project.status || startDate || endDate) {
      // If status changed or dates changed, re-sync all members
      for (const empId of project.teamMembers) {
        await syncBenchStatus(empId);
      }
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    next(error);
  }
};

// Manager: Get My Projects
export const getMyProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await Project.find({ managerId: req.user._id })
      .populate('managerId', 'firstName lastName email profileImage')
      .populate('teamMembers', 'firstName lastName email profileImage')
      .sort('-createdAt');

    const updatedProjects = projects.map(p => {
      const pObj = p.toObject();
      if (pObj.status !== 'On Hold') {
        pObj.status = calculateProjectStatus(pObj.startDate, pObj.endDate, pObj.status) as any;
      }
      return pObj;
    });

    res.status(200).json({
      success: true,
      data: updatedProjects,
    });
  } catch (error: any) {
    next(error);
  }
};

// Employee: Get Assigned Projects
export const getAssignedProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await Project.find({ teamMembers: req.user._id })
      .populate('managerId', 'firstName lastName email profileImage')
      .populate('teamMembers', 'firstName lastName email profileImage')
      .sort('-createdAt');

    const updatedProjects = projects.map(p => {
      const pObj = p.toObject();
      if (pObj.status !== 'On Hold') {
        pObj.status = calculateProjectStatus(pObj.startDate, pObj.endDate, pObj.status) as any;
      }
      return pObj;
    });

    res.status(200).json({
      success: true,
      data: updatedProjects,
    });
  } catch (error: any) {
    next(error);
  }
};

// Manager: Add Team Member
export const addTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (project.managerId.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return next(new AppError('Not authorized to modify this project', 403));
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'Employee') {
      return next(new AppError('Only users with role Employee can be added to the team', 400));
    }

    if (project.teamMembers.includes(employeeId)) {
      return next(new AppError('Employee is already in the project team', 400));
    }

    if (project.status === 'Completed') {
      return next(new AppError('Cannot add team members to a completed project', 400));
    }

    project.teamMembers.push(employeeId);
    await project.save();

    const manager = await User.findById(project.managerId);
    if (manager && manager.departmentId) {
      employee.departmentId = manager.departmentId;
      await employee.save();
    }

    await syncBenchStatus(employeeId);

    await project.populate('managerId', 'firstName lastName email profileImage');
    await project.populate('teamMembers', 'firstName lastName email profileImage');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    next(error);
  }
};

// Manager: Remove Team Member
export const removeTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (project.managerId.toString() !== req.user._id.toString() && req.user.role !== 'SuperAdmin') {
      return next(new AppError('Not authorized to modify this project', 403));
    }

    project.teamMembers = project.teamMembers.filter(id => id.toString() !== employeeId);
    await project.save();

    const employee = await User.findById(employeeId);
    if (employee) {
      employee.departmentId = undefined;
      await employee.save();
      await syncBenchStatus(employeeId);
    }

    await project.populate('managerId', 'firstName lastName email profileImage');
    await project.populate('teamMembers', 'firstName lastName email profileImage');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    next(error);
  }
};

// Manager: Get Available Employees (Active Employees not in this project, or just all Active Employees)
export const getAvailableEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.query.projectId as string;
    
    // Find employees
    let query: any = { role: 'Employee', status: 'Active' };
    
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        query._id = { $nin: project.teamMembers };
      }
    }

    const employees = await User.find(query).select('firstName lastName email profileImage');

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error: any) {
    next(error);
  }
};
