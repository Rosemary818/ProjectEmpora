import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { LeaveRequest } from '../models/leave.model';
import { Task } from '../models/task.model';
import { TravelRequest } from '../models/travelRequest.model';
import { WFHRequest } from '../models/wfhRequest.model';
import { Promotion } from '../models/promotion.model';

export const getApprovalInbox = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { role, _id } = user as any;

    if (role !== 'Manager' && role !== 'HRAdmin' && role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Not authorized to view approval inbox' });
    }

    const approvals: any[] = [];

    let teamMemberIds: any[] = [];
    if (role === 'Manager') {
      const teamUsers = await User.find({ managerId: _id }).select('_id');
      const mongoose = require('mongoose');
      const projects = await mongoose.models.Project.find({ managerId: _id });
      
      const projectTeamMemberIds = projects.flatMap((p: any) => p.teamMembers || []).map((id: any) => id.toString());
      const directReportIds = teamUsers.map(m => m._id.toString());
      
      teamMemberIds = [...new Set([...projectTeamMemberIds, ...directReportIds])];
    }

    // 1. Leave Requests
    const leaveQuery: any = { status: 'Pending' };
    if (role === 'Manager') {
      leaveQuery.userId = { $in: teamMemberIds };
    }
    const leaves = await LeaveRequest.find(leaveQuery)
      .populate({
        path: 'userId',
        select: 'firstName lastName employeeCode department departmentId',
        populate: { path: 'departmentId', select: 'departmentName' }
      }).lean();
    
    leaves.forEach((l: any) => approvals.push({
      _id: l._id,
      category: 'Leave Requests',
      type: l.leaveType || 'Leave',
      employee: {
        _id: l.userId?._id,
        firstName: l.userId?.firstName,
        lastName: l.userId?.lastName,
        employeeCode: l.userId?.employeeCode,
        department: l.userId?.departmentId?.departmentName || l.userId?.department || 'Not Assigned'
      },
      date: l.createdAt,
      details: `${l.numberOfDays} days from ${new Date(l.startDate).toLocaleDateString()} to ${new Date(l.endDate).toLocaleDateString()}`,
      status: l.status,
      apiPath: `/api/leave/${l._id}/status`,
      method: 'PUT',
      payloadKey: 'status',
      approveValue: 'Approved',
      rejectValue: 'Rejected',
      reasonKey: 'rejectionReason'
    }));

    // 2. Task Reviews (Manager / SuperAdmin)
    if (role === 'Manager' || role === 'SuperAdmin') {
      const taskQuery: any = { status: 'Under Review' };
      if (role === 'Manager') {
        taskQuery.assignedBy = _id;
      }
      const tasks = await Task.find(taskQuery)
        .populate({
          path: 'assignedTo',
          select: 'firstName lastName employeeCode department departmentId',
          populate: { path: 'departmentId', select: 'departmentName' }
        }).lean();
      
      tasks.forEach((t: any) => approvals.push({
        _id: t._id,
        category: 'Task Reviews',
        type: 'Task Review',
        employee: {
          _id: t.assignedTo?._id,
          firstName: t.assignedTo?.firstName,
          lastName: t.assignedTo?.lastName,
          employeeCode: t.assignedTo?.employeeCode,
          department: t.assignedTo?.departmentId?.departmentName || t.assignedTo?.department || 'Not Assigned'
        },
        date: t.updatedAt,
        details: `Task: ${t.title}`,
        status: t.status,
        apiPath: `/api/tasks/${t._id}/status`,
        method: 'PATCH',
        payloadKey: 'status',
        approveValue: 'Completed',
        rejectValue: 'In Progress',
        reasonKey: 'managerComment'
      }));
    }

    // 3. Travel Requests
    const travelQuery: any = {};
    let shouldFetchTravel = false;
    if (role === 'Manager') {
      travelQuery.status = 'Pending Manager Approval';
      travelQuery.managerId = _id;
      travelQuery.requesterId = { $ne: _id };
      shouldFetchTravel = true;
    } else if (role === 'HRAdmin' || role === 'SuperAdmin') {
      travelQuery.status = 'Pending HR Approval';
      shouldFetchTravel = true;
    }
    
    if (shouldFetchTravel) {
      const travels = await TravelRequest.find(travelQuery)
        .populate({
          path: 'requesterId',
          select: 'firstName lastName employeeCode department departmentId',
          populate: { path: 'departmentId', select: 'departmentName' }
        }).lean();
      
      travels.forEach((t: any) => approvals.push({
        _id: t._id,
        category: 'Travel Requests',
        type: 'Travel',
        employee: {
          _id: t.requesterId?._id,
          firstName: t.requesterId?.firstName,
          lastName: t.requesterId?.lastName,
          employeeCode: t.requesterId?.employeeCode,
          department: t.requesterId?.departmentId?.departmentName || t.requesterId?.department || 'Not Assigned'
        },
        date: t.createdAt,
        details: `To ${t.destination} for ${t.purpose}`,
        status: t.status,
        apiPath: `/api/travel/${t._id}/process`,
        method: 'PATCH',
        payloadKey: 'action',
        approveValue: 'Approve',
        rejectValue: 'Reject',
        reasonKey: 'reason'
      }));
    }

    // 4. WFH Requests
    const wfhQuery: any = { status: 'Pending' };
    let shouldFetchWFH = false;
    if (role === 'Manager') {
      wfhQuery.$or = [
        { manager: _id },
        { employee: { $in: teamMemberIds } }
      ];
      shouldFetchWFH = true;
    } else if (role === 'HRAdmin' || role === 'SuperAdmin') {
      shouldFetchWFH = true;
    }

    if (shouldFetchWFH) {
      const wfhs = await WFHRequest.find(wfhQuery)
        .populate({
          path: 'employee',
          select: 'firstName lastName employeeCode department departmentId',
          populate: { path: 'departmentId', select: 'departmentName' }
        }).lean();
      
      wfhs.forEach((w: any) => approvals.push({
        _id: w._id,
        category: 'WFH Requests',
        type: 'WFH',
        employee: {
          _id: w.employee?._id,
          firstName: w.employee?.firstName,
          lastName: w.employee?.lastName,
          employeeCode: w.employee?.employeeCode,
          department: w.employee?.departmentId?.departmentName || w.employee?.department || 'Not Assigned'
        },
        date: w.createdAt,
        details: `From ${new Date(w.fromDate).toLocaleDateString()} to ${new Date(w.toDate).toLocaleDateString()} - ${w.reason}`,
        status: w.status,
        apiPath: `/api/wfh/${w._id}/status`,
        method: 'PATCH',
        payloadKey: 'status',
        approveValue: 'Approved',
        rejectValue: 'Rejected',
        reasonKey: 'managerComment'
      }));
    }

    // 5. Promotions (HR / SuperAdmin only)
    if (role === 'HRAdmin' || role === 'SuperAdmin') {
      const promoQuery: any = { status: 'Pending HR Review' };
      const promos = await Promotion.find(promoQuery)
        .populate({
          path: 'employeeId',
          select: 'firstName lastName employeeCode department departmentId',
          populate: { path: 'departmentId', select: 'departmentName' }
        }).lean();
      
      promos.forEach((p: any) => approvals.push({
        _id: p._id,
        category: 'Promotion Requests',
        type: 'Promotion',
        employee: {
          _id: p.employeeId?._id,
          firstName: p.employeeId?.firstName,
          lastName: p.employeeId?.lastName,
          employeeCode: p.employeeId?.employeeCode,
          department: p.employeeId?.departmentId?.departmentName || p.employeeId?.department || 'Not Assigned'
        },
        date: p.createdAt,
        details: p.reason ? `Reason: ${p.reason}` : 'Promotion Review',
        status: p.status,
        apiPath: `/api/promotions/${p._id}/status`,
        method: 'PATCH',
        payloadKey: 'status',
        approveValue: 'Approved',
        rejectValue: 'Rejected',
        reasonKey: 'hrRemarks',
        extraPayload: { effectiveDate: new Date().toISOString() }
      }));
    }

    res.status(200).json(approvals);
  } catch (error) {
    console.error('Error fetching approval inbox:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
