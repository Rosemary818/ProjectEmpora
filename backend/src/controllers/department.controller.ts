import { Request, Response } from 'express';
import { Department } from '../models/department.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';

export const getAllDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Department.find()
      .populate('managerId', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 });

    // Get employee counts for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await User.countDocuments({ departmentId: dept._id, status: 'Active' });
        return {
          ...dept.toObject(),
          employeeCount,
        };
      })
    );

    res.status(200).json({ success: true, data: departmentsWithCounts });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentName, departmentCode, description, managerId, status } = req.body;

    const existingName = await Department.findOne({ departmentName });
    if (existingName) {
      res.status(400).json({ success: false, message: 'Department name already exists' });
      return;
    }

    if (departmentCode) {
      const existingCode = await Department.findOne({ departmentCode });
      if (existingCode) {
        res.status(400).json({ success: false, message: 'Department code already exists' });
        return;
      }
    }

    const newDept = new Department({
      departmentName,
      departmentCode,
      description,
      managerId: managerId || undefined,
      status: status || 'Active',
    });

    await newDept.save();

    if (newDept.managerId) {
      await User.findByIdAndUpdate(newDept.managerId, { departmentId: newDept._id });

      const projects = await Project.find({ managerId: newDept.managerId });
      const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers))];
      if (teamMemberIds.length > 0) {
        await User.updateMany({ _id: { $in: teamMemberIds } }, { departmentId: newDept._id });
      }
    }

    res.status(201).json({ success: true, data: newDept, message: 'Department created successfully' });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { departmentName, departmentCode, description, managerId, status } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    if (departmentName && departmentName !== department.departmentName) {
      const existingName = await Department.findOne({ departmentName });
      if (existingName) {
        res.status(400).json({ success: false, message: 'Department name already exists' });
        return;
      }
      department.departmentName = departmentName;
    }

    if (departmentCode && departmentCode !== department.departmentCode) {
      const existingCode = await Department.findOne({ departmentCode });
      if (existingCode) {
        res.status(400).json({ success: false, message: 'Department code already exists' });
        return;
      }
      department.departmentCode = departmentCode;
    }

    if (description !== undefined) department.description = description;

    if (managerId !== undefined) {
      const oldManagerStr = department.managerId ? department.managerId.toString() : '';
      const newManagerStr = managerId ? managerId.toString() : '';

      if (oldManagerStr !== newManagerStr) {
        if (oldManagerStr) {
          await User.findByIdAndUpdate(oldManagerStr, { $unset: { departmentId: 1 } });
        }
        if (managerId) {
          await User.findByIdAndUpdate(managerId, { departmentId: department._id });

          const projects = await Project.find({ managerId });
          const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers))];
          if (teamMemberIds.length > 0) {
            await User.updateMany({ _id: { $in: teamMemberIds } }, { departmentId: department._id });
          }
        }
      }
      department.managerId = managerId || undefined;
    }

    if (status !== undefined) department.status = status;

    await department.save();

    res.status(200).json({ success: true, data: department, message: 'Department updated successfully' });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateDepartmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    if (status === 'Inactive') {
      const activeEmployees = await User.countDocuments({ departmentId: id, status: 'Active' });
      if (activeEmployees > 0) {
        res.status(400).json({ success: false, message: 'Cannot deactivate department with active employees' });
        return;
      }

      const activeProjects = await Project.countDocuments({ departmentId: id, status: { $in: ['Planning', 'Active'] } });
      if (activeProjects > 0) {
        res.status(400).json({ success: false, message: 'Cannot deactivate department with active projects' });
        return;
      }
    }

    department.status = status;
    await department.save();

    res.status(200).json({ success: true, message: `Department marked as ${status}` });
  } catch (error) {
    console.error('Error updating department status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getDepartmentDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate('managerId', 'firstName lastName email profileImage');

    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    const employees = await User.find({ departmentId: id }).select('firstName lastName email profileImage jobTitle status role');
    const projects = await Project.find({ departmentId: id }).select('name status startDate endDate');

    res.status(200).json({
      success: true,
      data: {
        department,
        employees,
        projects
      }
    });
  } catch (error) {
    console.error('Error fetching department details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
