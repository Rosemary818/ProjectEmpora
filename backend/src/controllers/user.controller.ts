import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { Timesheet } from '../models/timesheet.model';
import { LeaveRequest } from '../models/leave.model';
import { Attendance } from '../models/attendance.model';
import { Referral } from '../models/referral.model';
import { Department } from '../models/department.model';
import { Holiday } from '../models/holiday.model';
import { AppError } from '../utils/error';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = await User.findById(req.user.id)
      .select('-password')
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName')
      .populate('managerId', 'firstName lastName employeeCode departmentId');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    let managerName = 'Not Assigned';
    let managerEmployeeId = null;

    if (user.managerId) {
      const managerUser = user.managerId as any;
      managerName = `${managerUser.firstName} ${managerUser.lastName}`;
      managerEmployeeId = managerUser.employeeCode;
      
      // Synchronize employee department if manager has one and employee doesn't
      if (!user.departmentId && managerUser.departmentId) {
        user.departmentId = managerUser.departmentId;
        await user.save();
        
        user = await User.findById(req.user.id)
          .select('-password')
          .populate('departmentId', 'departmentName')
          .populate('designationId', 'designationName')
          .populate('managerId', 'firstName lastName employeeCode departmentId');
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData: any = user.toObject();
    
    // Explicitly add requested fields
    userData.departmentName = userData.departmentId ? (userData.departmentId as any).departmentName : 'Not Assigned';
    userData.designationName = userData.designationId ? (userData.designationId as any).designationName : 'Not Set';
    userData.managerName = managerName;
    if (managerEmployeeId) {
      userData.managerEmployeeId = managerEmployeeId;
    }

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, departmentId, designationId, employeeCode, dateOfJoining, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update allowable fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone; // Allow clearing phone
    if (departmentId !== undefined) user.departmentId = departmentId;
    if (designationId !== undefined) user.designationId = designationId;
    if (employeeCode !== undefined) user.employeeCode = employeeCode;
    if (dateOfJoining) user.dateOfJoining = new Date(dateOfJoining);
    if (profileImage !== undefined) user.profileImage = profileImage; // Can be base64 string or empty to remove
    
    if (req.body.skills !== undefined) {
      const skillNames = req.body.skills.map((s: any) => s.name.toLowerCase().trim());
      const hasDuplicates = new Set(skillNames).size !== skillNames.length;
      if (hasDuplicates) {
        return res.status(400).json({ success: false, message: 'Duplicate skills are not allowed.' });
      }
      user.skills = req.body.skills;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Find projects where managerId is the current user
    const projects = await Project.find({ managerId: req.user.id });
    const projectIds = projects.map(p => p._id);
    
    // 2. Extract unique team member IDs
    const teamMemberIds = [...new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())))];

    // 3. Fetch User details for these members, filtering by role 'Employee'
    const teamMembers = await User.find({
      _id: { $in: teamMemberIds },
      role: 'Employee'
    })
      .select('-password')
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName');
    
    // 4. Fetch task statistics
    const tasks = await Task.find({
      projectId: { $in: projectIds },
      assignedTo: { $in: teamMemberIds }
    });
    
    // Map tasks to members
    const teamWithStats = teamMembers.map(member => {
      const memberTasks = tasks.filter(t => t.assignedTo.toString() === member._id.toString());
      
      const totalTasks = memberTasks.length;
      const pendingTasks = memberTasks.filter(t => t.status === 'To Do').length;
      const inProgressTasks = memberTasks.filter(t => t.status === 'In Progress').length;
      const completedTasks = memberTasks.filter(t => t.status === 'Completed').length;
      
      const memberProjects = projects
        .filter(p => p.teamMembers.map(id => id.toString()).includes(member._id.toString()))
        .map(p => ({ _id: p._id, name: p.name }));
        
      const memberObj: any = member.toObject();
      memberObj.departmentName = memberObj.departmentId ? memberObj.departmentId.departmentName : 'Not Assigned';
      memberObj.designationName = memberObj.designationId ? memberObj.designationId.designationName : 'Not Set';

      return {
        ...memberObj,
        stats: {
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks
        },
        projects: memberProjects,
        tasks: memberTasks
      };
    });
    
    res.status(200).json({
      success: true,
      data: teamWithStats
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = req.user.id;

    // 1. Projects
    const projects = await Project.find({ managerId });
    const projectIds = projects.map(p => p._id);
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const totalProjects = projects.length;

    // 2. Team Members
    const teamMemberIdsSet = new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())));
    const teamMemberIds = [...teamMemberIdsSet];
    const teamMembers = await User.find({ _id: { $in: teamMemberIds }, role: 'Employee' })
      .select('firstName lastName email profileImage status departmentId designationId')
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName')
      .lean();

    const mappedTeamMembers = teamMembers.map(m => ({
      ...m,
      departmentName: (m.departmentId as any)?.departmentName || 'Not Assigned',
      designationName: (m.designationId as any)?.designationName || 'Not Set'
    }));
    const totalTeamMembers = mappedTeamMembers.length;

    // 3. Tasks
    const tasks = await Task.find({ projectId: { $in: projectIds } }).populate('assignedTo', 'firstName lastName profileImage');
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    // 4. Timesheets
    const timesheets = await Timesheet.find({ projectId: { $in: projectIds } }).populate('employeeId', 'firstName lastName profileImage');
    const submittedTimesheets = timesheets.length;
    const pendingTimesheets = timesheets.filter(t => t.status === 'Submitted').length; // 'Submitted' means pending review

    // 5. Leave Requests
    const leaveRequests = await LeaveRequest.find({ userId: { $in: teamMemberIds } }).populate('userId', 'firstName lastName profileImage');
    const pendingLeaveRequests = leaveRequests.filter(l => l.status === 'Pending').length;

    // 5.5 Attendance Stats for Manager Dashboard
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayAttendance = await Attendance.find({ employee: { $in: teamMemberIds }, date: today });
    const todayLeaves = await LeaveRequest.find({
      userId: { $in: teamMemberIds },
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const teamPresent = todayAttendance.filter(a => a.status === 'Present').length;
    const teamAbsent = todayAttendance.filter(a => a.status === 'Absent').length;
    const teamLate = todayAttendance.filter(a => a.status === 'Late' || a.isLate).length;
    const teamOnLeave = todayLeaves.length;

    // 6. Recent Activities
    // Combine recent tasks and timesheets
    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(t => ({
        id: t._id,
        type: 'Task',
        action: `Task "${t.title}" was updated to ${t.status}`,
        user: (t.assignedTo as any) || { firstName: 'Someone', lastName: '' },
        date: t.updatedAt
      }));

    const recentTimesheets = timesheets
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(t => ({
        id: t._id,
        type: 'Timesheet',
        action: `submitted a timesheet for ${t.hoursWorked} hours`,
        user: (t.employeeId as any) || { firstName: 'Someone', lastName: '' },
        date: t.updatedAt
      }));
      
    const recentLeaves = leaveRequests
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(l => ({
        id: l._id,
        type: 'Leave',
        action: `requested ${l.numberOfDays} days of ${l.leaveType}`,
        user: (l.userId as any) || { firstName: 'Someone', lastName: '' },
        date: l.updatedAt
      }));

    const recentActivities = [...recentTasks, ...recentTimesheets, ...recentLeaves]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalTeamMembers,
        activeProjects,
        totalProjects,
        completedProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        pendingLeaveRequests,
        pendingTimesheets,
        submittedTimesheets,
        teamMembers: mappedTeamMembers,
        recentActivities,
        attendanceStats: {
          teamPresent,
          teamAbsent,
          teamLate,
          teamOnLeave
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user.id;

    // 1. Projects and Manager
    const projects = await Project.find({ teamMembers: employeeId }).populate('managerId', 'firstName lastName email profileImage role');
    const projectIds = projects.map(p => p._id);

    // 2. Team Members
    const teamMemberIdsSet = new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())));
    const teamMemberIds = [...teamMemberIdsSet];
    const teamMembers = await User.find({ _id: { $in: teamMemberIds }, role: 'Employee' })
      .select('firstName lastName email profileImage role status departmentId designationId')
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'designationName')
      .lean();

    const mappedTeamMembers = teamMembers.map(m => ({
      ...m,
      departmentName: (m.departmentId as any)?.departmentName || 'Not Assigned',
      designationName: (m.designationId as any)?.designationName || 'Not Set'
    }));

    // 3. Tasks
    const tasks = await Task.find({ assignedTo: employeeId }).populate('projectId', 'name');
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    // 4. Timesheets
    const timesheets = await Timesheet.find({ employeeId });
    const totalTimesheets = timesheets.length;
    const pendingTimesheets = timesheets.filter(t => t.status === 'Submitted').length;
    const approvedTimesheets = timesheets.filter(t => t.status === 'Approved').length;
    const rejectedTimesheets = timesheets.filter(t => t.status === 'Rejected').length;

    // 5. Leave Requests
    const leaveRequests = await LeaveRequest.find({ userId: employeeId });
    const totalLeaveRequests = leaveRequests.length;
    const pendingLeaveRequests = leaveRequests.filter(l => l.status === 'Pending').length;
    const approvedLeaveRequests = leaveRequests.filter(l => l.status === 'Approved').length;
    const rejectedLeaveRequests = leaveRequests.filter(l => l.status === 'Rejected').length;
    
    // Assume total allowance is 20 days. Subtract approved days.
    const approvedLeaveDays = leaveRequests
      .filter(l => l.status === 'Approved')
      .reduce((sum, l) => sum + (l.numberOfDays || 0), 0);
    const leaveBalance = 20 - approvedLeaveDays;

    // 6. Attendance
    const attendance = await Attendance.find({ employee: employeeId });
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;
    const lateDays = attendance.filter(a => a.status === 'Late' || a.isLate).length;

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayAttendance = await Attendance.findOne({ employee: employeeId, date: today });

    // 6.5 Referrals
    const referrals = await Referral.find({ referredBy: employeeId });
    const referralStats = {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'Pending').length,
      hired: referrals.filter(r => r.status === 'Hired').length,
    };

    // 7. Recent Activities (from Tasks, Leaves, Timesheets)
    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(t => ({
        id: t._id,
        type: 'Task',
        action: `Task "${t.title}" status changed to ${t.status}`,
        date: t.updatedAt
      }));

    const recentTimesheets = timesheets
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(t => ({
        id: t._id,
        type: 'Timesheet',
        action: `Timesheet status changed to ${t.status}`,
        date: t.updatedAt
      }));
      
    const recentLeaves = leaveRequests
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(l => ({
        id: l._id,
        type: 'Leave',
        action: `Leave request status changed to ${l.status}`,
        date: l.updatedAt
      }));

    const recentActivities = [...recentTasks, ...recentTimesheets, ...recentLeaves]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Get unique managers from the assigned projects
    const managers = Array.from(new Map(projects.filter(p => p.managerId).map(p => [p.managerId._id.toString(), p.managerId])).values());

    res.status(200).json({
      success: true,
      data: {
        projects,
        managers,
        teamMembers: mappedTeamMembers,
        tasks,
        taskStats: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks
        },
        timesheetStats: {
          total: totalTimesheets,
          pending: pendingTimesheets,
          approved: approvedTimesheets,
          rejected: rejectedTimesheets
        },
        leaveStats: {
          total: totalLeaveRequests,
          pending: pendingLeaveRequests,
          approved: approvedLeaveRequests,
          rejected: rejectedLeaveRequests,
          balance: leaveBalance
        },
        attendanceStats: {
          present: presentDays,
          absent: absentDays,
          late: lateDays
        },
        referralStats,
        todayAttendance,
        recentActivities
      }
    });
  } catch (error: any) {
    require('fs').appendFileSync('error.log', 'getEmployeeDashboard Error: ' + String(error) + '\\n' + (error.stack || '') + '\\n');
    next(error);
  }
};

export const getManagers = async (req: Request, res: Response) => {
  try {
    const managers = await User.find({ role: 'Manager', status: 'Active' })
      .select('firstName lastName employeeCode department jobTitle designationId')
      .populate('designationId', 'designationName');

    return res.status(200).json({
      success: true,
      data: managers
    });
  } catch (error: any) {
    console.error('Error fetching managers:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTeamAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = req.user.id;
    const dateQuery = req.query.date as string;
    
    // Parse the requested date or use today
    const targetDate = dateQuery ? new Date(dateQuery) : new Date();
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    // Set start and end of the day for querying
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Get the manager's team
    const teamMembers = await User.find({ managerId, status: 'Active' })
      .select('firstName lastName employeeCode profileImage designationId')
      .populate('designationId', 'designationName')
      .lean();

    if (!teamMembers || teamMembers.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: { available: 0, onLeave: 0, absent: 0, holiday: 0 },
          team: []
        }
      });
    }

    const teamMemberIds = teamMembers.map(m => m._id);

    // 2. Fetch existing holidays
    // Need to dynamically import Holiday or we can just fetch if the model is available.
    // Assuming Holiday is imported. Wait, Holiday is not imported in user.controller.ts yet.
    // I need to add the import at the top. Let's do it via another replace.
    
    // For now, I'll fetch Leaves and Attendance
    const leaves = await LeaveRequest.find({
      userId: { $in: teamMemberIds },
      status: 'Approved',
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay }
    }).lean();

    const attendances = await Attendance.find({
      employee: { $in: teamMemberIds },
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    // Fetch existing holiday
    const holiday = await Holiday.findOne({
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    const isHoliday = !!holiday;

    // Calculate Availability
    let summary = { available: 0, onLeave: 0, absent: 0, holiday: 0 };
    const teamAvailability = teamMembers.map((member: any) => {
      const memberId = member._id.toString();
      
      const onLeave = leaves.find(l => l.userId.toString() === memberId);
      const attendance = attendances.find(a => a.employee.toString() === memberId);

      let status = '🟠 Absent';
      let rawStatus = 'Absent';

      if (onLeave) {
        status = '🔴 On Leave';
        rawStatus = 'On Leave';
      } else if (isHoliday) {
        status = '🟡 Holiday';
        rawStatus = 'Holiday';
      } else if (attendance && attendance.status !== 'Absent') {
        status = '🟢 Available';
        rawStatus = 'Available';
      }

      // Update summary
      if (rawStatus === 'Available') summary.available++;
      else if (rawStatus === 'On Leave') summary.onLeave++;
      else if (rawStatus === 'Absent') summary.absent++;
      else if (rawStatus === 'Holiday') summary.holiday++;

      return {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        employeeCode: member.employeeCode,
        profileImage: member.profileImage,
        designationName: member.designationId?.designationName || 'Not Set',
        status,
        rawStatus
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary,
        team: teamAvailability,
        date: startOfDay.toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
};
