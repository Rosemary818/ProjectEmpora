import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Attendance } from '../models/attendance.model';
import { LeaveRequest } from '../models/leave.model';
import { Department } from '../models/department.model';
import { Project } from '../models/project.model';
import { EmployeeSkill } from '../models/skill.model';
import { Certification } from '../models/certification.model';

// Helper to get allowed user IDs for Manager, or null if Admin (all users)
const getScopeUserIds = async (user: any): Promise<string[] | null> => {
  if (user.role === 'SuperAdmin' || user.role === 'HRAdmin') {
    return null; // Null means no restriction
  }
  if (user.role === 'Manager') {
    const projects = await Project.find({ managerId: user.id });
    const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];
    return teamMemberIds;
  }
  return []; // Others get empty scope
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const scopeUserIds = await getScopeUserIds((req as any).user);
    
    // Employee query filter
    const empQuery: any = { role: { $in: ['Employee', 'Manager'] } };
    if (scopeUserIds) empQuery._id = { $in: scopeUserIds };
    
    const employees = await User.find(empQuery).populate('departmentId', 'departmentName');
    
    // Department Distribution
    const deptDistribution: any = {};
    employees.forEach(e => {
      const deptName = e.departmentId ? (e.departmentId as any).departmentName : 'Not Assigned';
      deptDistribution[deptName] = (deptDistribution[deptName] || 0) + 1;
    });

    // Attendance Trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const attQuery: any = { date: { $gte: sevenDaysAgo } };
    if (scopeUserIds) attQuery.employee = { $in: scopeUserIds };
    const attendance = await Attendance.find(attQuery);
    
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const lateCount = attendance.filter(a => a.status === 'Late' || a.isLate).length;

    // Leave Trends
    const leaveQuery: any = {};
    if (scopeUserIds) leaveQuery.userId = { $in: scopeUserIds };
    const leaves = await LeaveRequest.find(leaveQuery);
    
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

    // Projects Status
    let projQuery: any = {};
    if ((req as any).user.role === 'Manager') {
      projQuery.managerId = (req as any).user.id;
    }
    const projects = await Project.find(projQuery);
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    
    // Skills Distribution
    const skillQuery: any = {};
    if (scopeUserIds) skillQuery.userId = { $in: scopeUserIds };
    const skills = await EmployeeSkill.find(skillQuery).populate('skillId', 'name');
    
    const skillDist: any = {};
    skills.forEach(s => {
      if (s.skillId) {
        const name = (s.skillId as any).name;
        skillDist[name] = (skillDist[name] || 0) + 1;
      }
    });
    const sortedSkills = Object.entries(skillDist).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        departmentDistribution: Object.entries(deptDistribution).map(([name, value]) => ({ name, value })),
        attendanceSummary: [
          { name: 'Present', value: presentCount },
          { name: 'Absent', value: absentCount },
          { name: 'Late', value: lateCount }
        ],
        leaveSummary: [
          { name: 'Pending', value: pendingLeaves },
          { name: 'Approved', value: approvedLeaves },
          { name: 'Rejected', value: rejectedLeaves }
        ],
        projectSummary: [
          { name: 'Active', value: activeProjects },
          { name: 'Completed', value: completedProjects }
        ],
        topSkills: sortedSkills.map(([name, value]) => ({ name, value }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const scopeUserIds = await getScopeUserIds((req as any).user);
    const query: any = {};
    if (scopeUserIds) query.employee = { $in: scopeUserIds };
    
    // Optional date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeCode departmentId',
        populate: { path: 'departmentId', select: 'departmentName' }
      })
      .sort({ date: -1 })
      .lean();

    const mapped = attendance.map((a: any) => ({
      _id: a._id,
      date: a.date,
      employeeCode: a.employee?.employeeCode,
      employeeName: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Unknown',
      department: a.employee?.departmentId?.departmentName || 'Not Assigned',
      checkIn: a.checkIn,
      checkOut: a.checkOut,
      workingHours: a.workingHours || 0,
      status: a.status
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLeaveReport = async (req: Request, res: Response) => {
  try {
    const scopeUserIds = await getScopeUserIds((req as any).user);
    const query: any = {};
    if (scopeUserIds) query.userId = { $in: scopeUserIds };
    
    if (req.query.startDate && req.query.endDate) {
      query.startDate = { $gte: new Date(req.query.startDate as string) };
      query.endDate = { $lte: new Date(req.query.endDate as string) };
    }

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'userId',
        select: 'firstName lastName employeeCode departmentId',
        populate: { path: 'departmentId', select: 'departmentName' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = leaves.map((l: any) => ({
      _id: l._id,
      employeeName: l.userId ? `${l.userId.firstName} ${l.userId.lastName}` : 'Unknown',
      department: l.userId?.departmentId?.departmentName || 'Not Assigned',
      leaveType: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      numberOfDays: l.numberOfDays,
      status: l.status,
      reason: l.reason
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDepartmentReport = async (req: Request, res: Response) => {
  try {
    // Only Super/HR Admins usually see full dept reports. Managers might see their own.
    // For simplicity, we just return departments.
    const departments = await Department.find()
      .populate('managerId', 'firstName lastName')
      .lean();

    const employees = await User.find({ role: { $in: ['Employee', 'Manager'] } }).lean();

    const mapped = departments.map((d: any) => {
      const deptEmployees = employees.filter(e => e.departmentId?.toString() === d._id.toString());
      const activeCount = deptEmployees.filter(e => e.status === 'Active').length;
      return {
        _id: d._id,
        departmentName: d.departmentName,
        managerName: d.managerId ? `${d.managerId.firstName} ${d.managerId.lastName}` : 'Not Assigned',
        totalEmployees: deptEmployees.length,
        activeEmployees: activeCount,
        status: d.status
      };
    });

    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEmployeeReport = async (req: Request, res: Response) => {
  try {
    const scopeUserIds = await getScopeUserIds((req as any).user);
    const query: any = { role: { $in: ['Employee', 'Manager'] } };
    if (scopeUserIds) query._id = { $in: scopeUserIds };
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const employees = await User.find(query)
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName')
      .populate('managerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = employees.map((e: any) => ({
      _id: e._id,
      employeeCode: e.employeeCode,
      name: `${e.firstName} ${e.lastName}`,
      email: e.email,
      department: e.departmentId?.departmentName || 'Not Assigned',
      designation: e.designationId?.designationName || 'Not Set',
      manager: e.managerId ? `${e.managerId.firstName} ${e.managerId.lastName}` : 'Not Assigned',
      status: e.status,
      dateOfJoining: e.dateOfJoining
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProjectReport = async (req: Request, res: Response) => {
  try {
    let query: any = {};
    if ((req as any).user.role === 'Manager') {
      query.managerId = (req as any).user.id;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const projects = await Project.find(query)
      .populate('managerId', 'firstName lastName')
      .populate('teamMembers', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = projects.map((p: any) => ({
      _id: p._id,
      name: p.name,
      manager: p.managerId ? `${p.managerId.firstName} ${p.managerId.lastName}` : 'Unknown',
      teamSize: p.teamMembers?.length || 0,
      progress: p.progress || 0,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSkillsReport = async (req: Request, res: Response) => {
  try {
    const scopeUserIds = await getScopeUserIds((req as any).user);
    const query: any = {};
    if (scopeUserIds) query.userId = { $in: scopeUserIds };
    
    const skills = await EmployeeSkill.find(query)
      .populate('skillId', 'name category')
      .populate('userId', 'firstName lastName')
      .lean();

    // Group by skill
    const skillGroups: any = {};
    skills.forEach((s: any) => {
      if (!s.skillId) return;
      const skillName = s.skillId.name;
      if (!skillGroups[skillName]) {
        skillGroups[skillName] = { 
          name: skillName, 
          category: s.skillId.category, 
          count: 0, 
          levels: { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 } 
        };
      }
      skillGroups[skillName].count += 1;
      if (skillGroups[skillName].levels[s.level] !== undefined) {
        skillGroups[skillName].levels[s.level] += 1;
      }
    });

    const mapped = Object.values(skillGroups);
    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCertificationReport = async (req: Request, res: Response) => {
  try {
    const scopeUserIds = await getScopeUserIds((req as any).user);
    const query: any = {};
    if (scopeUserIds) query.userId = { $in: scopeUserIds };
    
    const certs = await Certification.find(query)
      .populate('userId', 'firstName lastName employeeCode')
      .sort({ expiryDate: 1 })
      .lean();

    const mapped = certs.map((c: any) => ({
      _id: c._id,
      employeeName: c.userId ? `${c.userId.firstName} ${c.userId.lastName}` : 'Unknown',
      certificate: c.name,
      issuingOrganization: c.issuingOrganization,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      status: c.status
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
