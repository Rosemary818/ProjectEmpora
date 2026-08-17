import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { LeaveRequest } from '../models/leave.model';
import { Attendance } from '../models/attendance.model';
import { Task } from '../models/task.model';
import { Timesheet } from '../models/timesheet.model';
import { Referral } from '../models/referral.model';
import { Department } from '../models/department.model';
import { Designation } from '../models/designation.model';
import { Project } from '../models/project.model';
import { EmployeeSkill } from '../models/skill.model';
import { Certification } from '../models/certification.model';
import { DocumentModel } from '../models/document.model';
import { AppError } from '../utils/error';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ConversionService } from '../services/conversion.service';
// HR Admin / SuperAdmin: Get all employees and managers
export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await User.find({ role: { $in: ['Employee', 'Manager'] } })
      .select('-password')
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName')
      .sort('-createdAt')
      .lean();

    const mappedEmployees = employees.map(emp => ({
      ...emp,
      departmentName: emp.departmentId ? (emp.departmentId as any).departmentName : (emp.department || 'Not Assigned'),
      designationName: emp.designationId ? (emp.designationId as any).designationName : (emp.jobTitle || 'Not Set')
    }));

    res.status(200).json({
      success: true,
      data: mappedEmployees,
    });
  } catch (error: any) {
    next(error);
  }
};

// SuperAdmin: Get ALL users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    next(error);
  }
};

// HR Admin / SuperAdmin: Get single user details with stats
export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Only allow HRAdmin to view Employee/Manager, SuperAdmin can view all
    if (req.user.role === 'HRAdmin' && !['Employee', 'Manager'].includes(user.role)) {
      return next(new AppError('HR Admins can only view Employees and Managers', 403));
    }

    // Fetch related stats
    const totalLeaves = await LeaveRequest.countDocuments({ userId: user._id });
    const pendingLeaves = await LeaveRequest.countDocuments({ userId: user._id, status: 'Pending' });
    const totalAttendance = await Attendance.countDocuments({ userId: user._id });
    const assignedTasks = await Task.countDocuments({ assignedTo: user._id });
    const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Completed' });
    const submittedTimesheets = await Timesheet.countDocuments({ employeeId: user._id, status: 'Submitted' });
    const approvedTimesheets = await Timesheet.countDocuments({ employeeId: user._id, status: 'Approved' });

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalLeaves,
          pendingLeaves,
          totalAttendance,
          assignedTasks,
          completedTasks,
          submittedTimesheets,
          approvedTimesheets
        }
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update permitted user profile fields (HRAdmin/SuperAdmin)
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (req.user.role === 'HRAdmin' && !['Employee', 'Manager'].includes(user.role)) {
      return next(new AppError('HR Admins can only modify Employees and Managers', 403));
    }

    const { departmentId, designationId, status } = req.body;

    if (departmentId !== undefined) user.departmentId = departmentId || undefined;
    if (designationId !== undefined) user.designationId = designationId || undefined;
    if (status !== undefined) {
      if (!['Active', 'Inactive'].includes(status)) {
        return next(new AppError('Invalid status', 400));
      }
      user.status = status;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

// Update user status (Activate/Deactivate)
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return next(new AppError('Status must be Active or Inactive', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (req.user.role === 'HRAdmin' && !['Employee', 'Manager'].includes(user.role)) {
      return next(new AppError('HR Admins can only change status of Employees and Managers', 403));
    }
    
    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot change your own status', 400));
    }

    // Prevent deactivating the last active HR Admin
    if (user.role === 'HRAdmin' && status === 'Inactive') {
      const activeHrAdminsCount = await User.countDocuments({ role: 'HRAdmin', status: 'Active' });
      if (activeHrAdminsCount <= 1) {
        return next(new AppError('Cannot deactivate the last active HR Admin', 400));
      }
    }

    // Check if manager has active team members before deactivating
    if (user.role === 'Manager' && status === 'Inactive' && req.body.forceDeactivate !== true) {
      const activeTeamMembers = await User.countDocuments({ managerId: user._id, status: 'Active' });
      if (activeTeamMembers > 0) {
        return res.status(400).json({
          success: false,
          requiresConfirmation: true,
          message: `This manager has ${activeTeamMembers} active team members. Are you sure you want to deactivate them?`
        });
      }
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

// Create a new HR Admin (SuperAdmin only)
export const createHRAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let hrDepartment = await Department.findOne({ departmentName: 'Human Resources' });
    if (!hrDepartment) {
      hrDepartment = await Department.create({ departmentName: 'Human Resources', departmentCode: 'HR', status: 'Active' });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      departmentId: hrDepartment._id,
      password: hashedPassword,
      role: 'HRAdmin',
      status: 'Active',
      isVerified: true
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: userObj,
    });
  } catch (error: any) {
    next(error);
  }
};

// Update HR Admin (SuperAdmin only)
export const updateHRAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'HRAdmin') {
      return next(new AppError('HR Admin not found', 404));
    }

    const { firstName, lastName, phone, departmentId, designationId } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (departmentId !== undefined) user.departmentId = departmentId || undefined;
    if (designationId !== undefined) user.designationId = designationId || undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

// Reset HR Admin Password (SuperAdmin only)
export const resetHRAdminPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'HRAdmin') {
      return next(new AppError('HR Admin not found', 404));
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters long', 400));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

// --- MANAGERS MANAGEMENT (SuperAdmin only) ---

export const getManagers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managers = await User.find({ role: 'Manager' })
      .populate('departmentId', 'departmentName')
      .select('-password')
      .lean()
      .sort('-createdAt');
      
    const managersWithCount = await Promise.all(managers.map(async (manager: any) => {
      const projects = await Project.find({ managerId: manager._id });
      const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];

      const teamMembersCount = await User.countDocuments({ 
        _id: { $in: teamMemberIds },
        status: 'Active',
        role: 'Employee'
      });
      
      const departmentName = manager.departmentId?.departmentName;
      
      return { 
        ...manager, 
        departmentName: departmentName || 'Not Assigned',
        teamMembersCount 
      };
    }));

    res.status(200).json({
      success: true,
      data: managersWithCount,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getManagerTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = req.params.id;
    const manager = await User.findById(managerId);
    
    if (!manager || manager.role !== 'Manager') {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    const projects = await Project.find({ managerId: manager._id });
    const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];

    const team = await User.find({
      _id: { $in: teamMemberIds },
      status: 'Active',
      role: 'Employee'
    })
    .populate('departmentId', 'departmentName')
    .populate('designationId', 'designationName')
    .select('-password')
    .lean()
    .sort('-createdAt');

    const mappedTeam = team.map((member: any) => ({
      ...member,
      departmentName: member.departmentId?.departmentName || 'Not Assigned',
      designationName: member.designationId?.designationName || 'Not Set'
    }));

    res.status(200).json({
      success: true,
      data: mappedTeam,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phone, departmentId, password } = req.body;

    if (!departmentId) {
      return next(new AppError('Department is required', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      departmentId,
      password: hashedPassword,
      role: 'Manager',
      status: 'Active',
      isVerified: true
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: userObj,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Manager') {
      return next(new AppError('Manager not found', 404));
    }

    const { firstName, lastName, phone, departmentId } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (departmentId !== undefined) user.departmentId = departmentId || undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

export const resetManagerPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Manager') {
      return next(new AppError('Manager not found', 404));
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters long', 400));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

// Get HRAdmin Dashboard dynamic data
export const getHRAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Employee metrics
    const rolesToCount: any[] = ['Employee', 'Manager', 'HRAdmin'];
    const totalEmployees = await User.countDocuments({ role: { $in: rolesToCount } });
    
    // 2. New Employees This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newEmployeesThisMonth = await User.countDocuments({
      role: { $in: rolesToCount },
      createdAt: { $gte: startOfMonth }
    });

    // 3. Pending Leaves
    const pendingLeaveRequests = await LeaveRequest.countDocuments({ status: 'Pending' });

    // 4. Pending Timesheets
    const pendingTimesheets = await Timesheet.countDocuments({ status: 'Submitted' });

    // 4.5 Referral Stats
    const totalReferrals = await Referral.countDocuments();
    const pendingReferrals = await Referral.countDocuments({ status: 'Pending' });
    const interviewsScheduled = await Referral.countDocuments({ status: 'Interview Scheduled' });
    const hiredReferrals = await Referral.countDocuments({ status: 'Hired' });
    const referralStats = {
      total: totalReferrals,
      pending: pendingReferrals,
      interviews: interviewsScheduled,
      hired: hiredReferrals
    };

    // 5. Employee Overview (Active vs Inactive)
    const activeEmployees = await User.countDocuments({ role: { $in: rolesToCount }, status: 'Active' });
    const inactiveEmployees = await User.countDocuments({ role: { $in: rolesToCount }, status: { $ne: 'Active' } });

    // 6. Department Overview
    const departmentData = await Department.find({ status: 'Active' }).select('departmentName _id');
    const deptCounts = await User.aggregate([
      { $match: { role: { $in: rolesToCount } } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } }
    ]);

    const departmentOverview = departmentData.map(dept => {
      const match = deptCounts.find(d => String(d._id) === String(dept._id));
      return {
        name: dept.departmentName,
        value: match ? match.count : 0
      };
    });
    
    // Unassigned counts
    const unassignedCount = deptCounts.find(d => !d._id);
    if (unassignedCount && unassignedCount.count > 0) {
      departmentOverview.push({ name: 'Unassigned', value: unassignedCount.count });
    }

    // 6.5 Designation Overview
    const totalDesignations = await Designation.countDocuments();
    const activeDesignations = await Designation.countDocuments({ status: 'Active' });
    
    const desigCounts = await User.aggregate([
      { $match: { role: { $in: rolesToCount } } },
      { $group: { _id: '$designationId', count: { $sum: 1 } } }
    ]);
    const designationData = await Designation.find({ status: 'Active' }).select('designationName _id');
    const employeesByDesignation = designationData.map(desig => {
      const match = desigCounts.find(d => String(d._id) === String(desig._id));
      return {
        name: desig.designationName,
        value: match ? match.count : 0
      };
    });

    const managerDesigCounts = await User.aggregate([
      { $match: { role: 'Manager' } },
      { $group: { _id: '$designationId', count: { $sum: 1 } } }
    ]);
    const managersByDesignation = designationData.map(desig => {
      const match = managerDesigCounts.find(d => String(d._id) === String(desig._id));
      return {
        name: desig.designationName,
        value: match ? match.count : 0
      };
    });

    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({ status: 'Active' });
    const totalManagers = await User.countDocuments({ role: 'Manager', status: 'Active' });

    // Ensure formatting is what chart expects (e.g., name, value)

    // 7. Recent Activities (Leaves, Users, Timesheets)
    const recentLeaves = await LeaveRequest.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName');
      
    const recentUsers = await User.find({ role: { $in: rolesToCount } })
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentTimesheets = await Timesheet.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('employeeId', 'firstName lastName');

    let recentActivities: any[] = [];

    recentLeaves.forEach((l: any) => {
      if (l.userId) {
        recentActivities.push({
          id: `leave-${l._id}`,
          action: `${l.userId.firstName} ${l.userId.lastName} requested ${l.leaveType} leave`,
          date: l.updatedAt
        });
      }
    });

    recentUsers.forEach(u => {
      recentActivities.push({
        id: `user-${u._id}`,
        action: `${u.firstName} ${u.lastName} joined the company`,
        date: u.createdAt
      });
    });

    recentTimesheets.forEach((t: any) => {
      if (t.employeeId) {
        recentActivities.push({
          id: `ts-${t._id}`,
          action: `${t.employeeId.firstName} ${t.employeeId.lastName} submitted a timesheet`,
          date: t.updatedAt
        });
      }
    });

    // Sort combined activities and pick top 5
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentActivities = recentActivities.slice(0, 5);

    // 8. Upcoming Events (Work Anniversaries)
    // Finding closest dateOfJoining anniversaries
    const usersWithJoiningDate = await User.find({ 
      dateOfJoining: { $exists: true, $ne: null },
      role: { $in: rolesToCount },
      status: 'Active'
    }).select('firstName lastName dateOfJoining');

    const upcomingEvents: any[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    usersWithJoiningDate.forEach(u => {
      if (!u.dateOfJoining) return;
      const joiningDate = new Date(u.dateOfJoining);
      const currentYearAnniversary = new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
      
      let diffDays = Math.ceil((currentYearAnniversary.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      // If passed this year, check next year
      let years = today.getFullYear() - joiningDate.getFullYear();
      if (diffDays < 0) {
        currentYearAnniversary.setFullYear(today.getFullYear() + 1);
        diffDays = Math.ceil((currentYearAnniversary.getTime() - today.getTime()) / (1000 * 3600 * 24));
        years += 1;
      }
      
      // If within 30 days and years > 0
      if (diffDays >= 0 && diffDays <= 30 && years > 0) {
        let dateString = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : currentYearAnniversary.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        upcomingEvents.push({
          id: `anniv-${u._id}`,
          title: `${u.firstName} ${u.lastName}`,
          description: `${years} Year Work Anniversary - ${dateString}`,
          date: currentYearAnniversary,
          daysUntil: diffDays,
          icon: '⭐'
        });
      }
    });

    upcomingEvents.sort((a, b) => a.daysUntil - b.daysUntil);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        newEmployeesThisMonth,
        pendingLeaveRequests,
        pendingTimesheets,
        activeEmployees,
        inactiveEmployees,
        departmentOverview,
        totalDepartments,
        activeDepartments,
        totalDesignations,
        activeDesignations,
        employeesByDesignation,
        managersByDesignation,
        totalManagers,
        referralStats,
        recentActivities,
        upcomingEvents: upcomingEvents.slice(0, 5) // max 5
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// Get SuperAdmin Dashboard dynamic data
export const getSuperAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rolesToCount = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee', 'Candidate', 'ServiceExecutive'];
    
    // 1. Total Users
    const totalUsers = await User.countDocuments();
    
    // 2. Role Counts
    const roleCountsArray = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const roleCounts = {
      superAdmins: 0,
      hrAdmins: 0,
      managers: 0,
      employees: 0,
      candidates: 0,
      serviceExecutives: 0
    };
    
    const roleDistribution: any[] = [];
    
    roleCountsArray.forEach((r: any) => {
      roleDistribution.push({ name: r._id || 'Unknown', value: r.count });
      if (r._id === 'SuperAdmin') roleCounts.superAdmins = r.count;
      if (r._id === 'HRAdmin') roleCounts.hrAdmins = r.count;
      if (r._id === 'Manager') roleCounts.managers = r.count;
      if (r._id === 'Employee') roleCounts.employees = r.count;
      if (r._id === 'Candidate') roleCounts.candidates = r.count;
      if (r._id === 'ServiceExecutive') roleCounts.serviceExecutives = r.count;
    });

    // 3. Active Users
    const activeUsers = await User.countDocuments({ status: 'Active' });
    
    // 4. Inactive / Suspended Users
    const inactiveUsers = await User.countDocuments({ status: { $ne: 'Active' } });

    // 5. Recently Registered Users (This Week)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const recentlyRegisteredUsers = await User.countDocuments({ createdAt: { $gte: startOfWeek } });

    // 6. Recently Added Employees (Today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newEmployees = await User.countDocuments({ role: 'Employee', createdAt: { $gte: today } });

    // 7. Recently Added HR Admins / Managers (This Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newHrAdmins = await User.countDocuments({ role: 'HRAdmin', createdAt: { $gte: startOfMonth } });
    const newManagers = await User.countDocuments({ role: 'Manager', createdAt: { $gte: startOfMonth } });

    // 8. Recently Registered Candidates (This Month)
    const newCandidates = await User.countDocuments({ role: 'Candidate', createdAt: { $gte: startOfMonth } });

    // 9. Pending User Actions (using isVerified flag)
    const pendingUserActions = await User.countDocuments({ isVerified: false });

    // 10. User Overview Arrays (Recently Registered specific users)
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName role profileImage createdAt');

    // 11. Recent System Activities
    const recentLeaves = await LeaveRequest.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate('userId', 'firstName lastName role');
      
    const recentTimesheets = await Timesheet.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate('employeeId', 'firstName lastName role');

    let recentActivities: any[] = [];
    recentUsers.forEach(u => {
      recentActivities.push({
        id: `user-${u._id}`,
        action: `System: ${u.role} profile created for ${u.firstName} ${u.lastName}`,
        date: u.createdAt
      });
    });

    recentLeaves.forEach((l: any) => {
      if (l.userId) {
        recentActivities.push({
          id: `leave-${l._id}`,
          action: `${l.userId.role || 'User'}: ${l.userId.firstName} ${l.userId.lastName} requested ${l.leaveType} leave`,
          date: l.updatedAt
        });
      }
    });

    recentTimesheets.forEach((t: any) => {
      if (t.employeeId) {
        recentActivities.push({
          id: `ts-${t._id}`,
          action: `${t.employeeId.role || 'User'}: ${t.employeeId.firstName} ${t.employeeId.lastName} submitted a timesheet`,
          date: t.updatedAt
        });
      }
    });

    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentActivities = recentActivities.slice(0, 5);

    // 12. System Status
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const systemStatus = {
      database: dbStatus,
      backend: 'Online',
      authentication: 'Operational'
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        roleCounts,
        activeUsers,
        inactiveUsers,
        recentlyRegisteredUsers,
        newEmployees,
        newHrAdmins,
        newManagers,
        newCandidates,
        pendingUserActions,
        roleDistribution,
        recentUsers,
        recentActivities,
        systemStatus
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// --- SERVICE EXECUTIVE MANAGEMENT (SuperAdmin only) ---

export const getServiceExecutives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceExecutives = await User.find({ role: 'ServiceExecutive' })
      .select('-password')
      .lean()
      .sort('-createdAt');
      
    res.status(200).json({
      success: true,
      data: serviceExecutives,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createServiceExecutive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    // Enforce only ONE Service Executive
    const existingExecutive = await User.findOne({ role: 'ServiceExecutive', status: 'Active' });
    if (existingExecutive) {
      return next(new AppError('An active Service Executive already exists. Only one is allowed.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400));
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      isVerified: true
    });

    // Use existing ConversionService for password generation and email dispatch
    await ConversionService.setupEmployeeCredentialsAndEmail(newUser);
    
    // Explicitly set the role to ServiceExecutive after the service sets it to Employee
    newUser.role = 'ServiceExecutive';

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: userObj,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateServiceExecutive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ServiceExecutive') {
      return next(new AppError('Service Executive not found', 404));
    }

    const { firstName, lastName, phone } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

export const resetServiceExecutivePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ServiceExecutive') {
      return next(new AppError('Service Executive not found', 404));
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters long', 400));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

export const resendServiceExecutiveInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ServiceExecutive') {
      return next(new AppError('Service Executive not found', 404));
    }

    const emailSent = await ConversionService.regeneratePasswordAndResendEmail(user);
    if (!emailSent) {
      return next(new AppError('Failed to send email. Please check the email service.', 500));
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully.'
    });
  } catch (error: any) {
    next(error);
  }
};
// --- Super Admin Employee Management ---

export const getSuperAdminEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await User.find({ role: { $in: ['Employee', 'Manager'] } })
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName')
      .populate('managerId', 'firstName lastName employeeCode')
      .select('-password')
      .lean()
      .sort('-createdAt');

    const mappedEmployees = employees.map((emp: any) => ({
      ...emp,
      departmentName: emp.departmentId?.departmentName || 'Not Assigned',
      designationName: emp.designationId?.designationName || 'Not Set',
      managerName: emp.managerId ? `${emp.managerId.firstName} ${emp.managerId.lastName}` : 'Not Assigned'
    }));

    res.status(200).json({
      success: true,
      data: mappedEmployees,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getSuperAdminEmployeeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName')
      .populate('managerId', 'firstName lastName email')
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const mappedUser = {
      ...user,
      departmentName: (user.departmentId as any)?.departmentName || 'Not Assigned',
      designationName: (user.designationId as any)?.designationName || 'Not Set',
      managerName: user.managerId ? `${(user.managerId as any).firstName} ${(user.managerId as any).lastName}` : 'Not Assigned'
    };

    const userIdStr = userId as string;
    
    const [
      skills,
      certifications,
      attendanceStats,
      leaves,
      projects,
      documents
    ] = await Promise.all([
      EmployeeSkill.find({ userId: userIdStr }).populate('skillId', 'name category').lean(),
      Certification.find({ userId: userIdStr }).lean(),
      Attendance.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userIdStr) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      LeaveRequest.find({ userId: userIdStr }).sort('-createdAt').limit(10).lean(),
      Project.find({ teamMembers: userIdStr }).select('name status startDate endDate').lean(),
      DocumentModel.find({ ownerId: userIdStr }).select('name category status createdAt').lean()
    ]);

    const attendanceSummary = attendanceStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        user: mappedUser,
        skills,
        certifications,
        attendanceSummary,
        leaves,
        projects,
        documents
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const bulkUpdateEmployeeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeIds, status } = req.body;
    
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Employee IDs array is required' });
    }
    
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await User.updateMany(
      { _id: { $in: employeeIds } },
      { $set: { status } }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${employeeIds.length} employees to ${status}`
    });
  } catch (error: any) {
    next(error);
  }
};

// --- Super Admin Candidates Management ---

export const getSuperAdminCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await User.find({ role: 'Candidate' }).select('-password').lean();
    
    const { JobApplication } = await import('../models/jobApplication.model');
    const applications = await JobApplication.find()
      .populate({
        path: 'jobId',
        select: 'title departmentId',
        populate: { path: 'departmentId', select: 'departmentName' }
      })
      .lean();

    const mappedCandidates = candidates.map((cand: any) => {
      const candApps = applications.filter((app: any) => String(app.candidateId) === String(cand._id));
      return {
        ...cand,
        applications: candApps
      };
    });

    res.status(200).json({
      success: true,
      data: mappedCandidates
    });
  } catch (error: any) {
    next(error);
  }
};
