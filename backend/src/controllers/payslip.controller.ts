import { Request, Response } from 'express';
import { Payslip } from '../models/payslip.model';
import { Salary } from '../models/salary.model';
import { User } from '../models/user.model';

// @desc    Get all payslips with filters
// @route   GET /api/payslips
// @access  HRAdmin, SuperAdmin
export const getPayslips = async (req: Request, res: Response) => {
  try {
    const { month, year, paymentStatus, employeeId } = req.query;

    const query: any = {};
    if (month) query.month = parseInt(month as string);
    if (year) query.year = parseInt(year as string);
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (employeeId) query.employeeId = employeeId;

    const payslips = await Payslip.find(query)
      .populate('employeeId', 'firstName lastName email employeeCode department designationId')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: payslips.length, data: payslips });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single payslip
// @route   GET /api/payslips/:id
// @access  Private (Self, HRAdmin, SuperAdmin)
export const getPayslip = async (req: Request, res: Response) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employeeId', 'firstName lastName email employeeCode department designationId')
      .populate('generatedBy', 'firstName lastName');

    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    // Authorization check
    if (!['HRAdmin', 'SuperAdmin'].includes(req.user?.role) && payslip.employeeId._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payslip' });
    }

    res.status(200).json({ success: true, data: payslip });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payslips for an employee
// @route   GET /api/payslips/employee/:employeeId
// @access  Private (Self, HRAdmin, SuperAdmin)
export const getPayslipsByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Authorization check
    if (!['HRAdmin', 'SuperAdmin'].includes(req.user?.role) && req.user?._id.toString() !== employeeId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these payslips' });
    }

    const payslips = await Payslip.find({ employeeId })
      .populate('employeeId', 'firstName lastName email employeeCode department designationId')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: payslips.length, data: payslips });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate a payslip
// @route   POST /api/payslips
// @access  HRAdmin, SuperAdmin
export const generatePayslip = async (req: Request, res: Response) => {
  try {
    const { employeeId, month, year, remarks } = req.body;

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if duplicate payslip exists
    const existingPayslip = await Payslip.findOne({ employeeId, month, year });
    if (existingPayslip) {
      return res.status(400).json({ success: false, message: 'Payslip for this month and year already exists' });
    }

    // Get active salary for the employee
    const activeSalary = await Salary.findOne({ employeeId, status: 'Active' });
    if (!activeSalary) {
      return res.status(404).json({ success: false, message: 'No active salary found for this employee to generate a payslip' });
    }

    // Create payslip
    const payslip = await Payslip.create({
      employeeId,
      salaryId: activeSalary._id,
      month,
      year,
      basicSalary: activeSalary.basicSalary,
      allowances: activeSalary.allowances,
      deductions: activeSalary.deductions,
      grossSalary: activeSalary.grossSalary,
      netSalary: activeSalary.netSalary,
      remarks,
      generatedBy: req.user?._id,
    });

    res.status(201).json({ success: true, data: payslip });
  } catch (error: any) {
    // Handle mongoose duplicate key error if index catches it first
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Payslip already exists for this period' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update payslip payment status
// @route   PUT /api/payslips/:id/status
// @access  HRAdmin, SuperAdmin
export const updatePayslipStatus = async (req: Request, res: Response) => {
  try {
    const { paymentStatus } = req.body;

    if (!['Pending', 'Paid'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    payslip.paymentStatus = paymentStatus;
    if (paymentStatus === 'Paid' && !payslip.paymentDate) {
      payslip.paymentDate = new Date();
    }
    await payslip.save();

    res.status(200).json({ success: true, data: payslip });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
