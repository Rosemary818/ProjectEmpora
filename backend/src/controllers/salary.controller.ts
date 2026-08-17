import { Request, Response } from 'express';
import { Salary } from '../models/salary.model';
import { User } from '../models/user.model';

// @desc    Get all active salaries
// @route   GET /api/salaries
// @access  HRAdmin, SuperAdmin
export const getSalaries = async (req: Request, res: Response) => {
  try {
    const salaries = await Salary.find({ status: 'Active' })
      .populate('employeeId', 'firstName lastName email employeeCode department designationId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: salaries.length, data: salaries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single salary (current active) by employeeId
// @route   GET /api/salaries/:employeeId
// @access  Private (Self, HRAdmin, SuperAdmin)
export const getSalaryByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Authorization check: Self or Admin
    if (!['HRAdmin', 'SuperAdmin'].includes(req.user?.role) && req.user?._id.toString() !== employeeId) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this salary' });
    }

    const salary = await Salary.findOne({ employeeId, status: 'Active' })
      .populate('employeeId', 'firstName lastName email employeeCode department designationId');

    if (!salary) {
      return res.status(404).json({ success: false, message: 'No active salary found for this employee' });
    }

    res.status(200).json({ success: true, data: salary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get salary history by employeeId
// @route   GET /api/salaries/:employeeId/history
// @access  HRAdmin, SuperAdmin
export const getSalaryHistory = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const salaries = await Salary.find({ employeeId })
      .sort({ effectiveFrom: -1 })
      .populate('createdBy', 'firstName lastName');

    res.status(200).json({ success: true, count: salaries.length, data: salaries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new salary (and deactivate current active)
// @route   POST /api/salaries
// @access  HRAdmin, SuperAdmin
export const createSalary = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      basicSalary,
      allowances,
      deductions,
      effectiveFrom,
      paymentFrequency,
    } = req.body;

    // Check if employee exists and is not a candidate
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    if (employee.role !== 'Employee' && employee.role !== 'Manager') {
      return res.status(400).json({ success: false, message: 'Salary can only be assigned to Employees or Managers' });
    }

    // Deactivate any existing active salary for this employee
    await Salary.updateMany(
      { employeeId, status: 'Active' },
      { $set: { status: 'Inactive' } }
    );

    // Create the new active salary
    const salary = await Salary.create({
      employeeId,
      employeeRole: employee.role,
      basicSalary,
      allowances,
      deductions,
      effectiveFrom,
      paymentFrequency,
      status: 'Active',
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, data: salary });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
