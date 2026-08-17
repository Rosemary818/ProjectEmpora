import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Training } from '../models/training.model';
import { Complaint } from '../models/complaint.model';
import { Asset } from '../models/asset.model';
import { Announcement } from '../models/announcement.model';
import { Project } from '../models/project.model';
import { LeaveRequest as Leave } from '../models/leave.model';
import { DocumentModel as Document } from '../models/document.model';
import { Job } from '../models/job.model';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp(q, 'i');
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;

    // We will build a list of results categorised.
    const results: any[] = [];

    // Helper to format results
    const addResults = (category: string, items: any[], type: string) => {
      if (items.length > 0) {
        results.push({
          category,
          type,
          items
        });
      }
    };

    // --- SHARED GLOBALS (For all employees) ---
    // 1. Announcements (Published)
    const announcements = await Announcement.find({
      title: regex,
      status: 'Published'
    }).limit(5).lean();
    addResults('Announcements', announcements, 'announcement');

    // 2. Active Trainings
    const trainings = await Training.find({
      $or: [{ title: regex }, { category: regex }],
      status: 'Active'
    }).limit(5).lean();
    addResults('Trainings', trainings, 'training');

    // 3. Employee Directory (Basic info only unless HR/SuperAdmin)
    const userSearchFilter: any = {
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { employeeCode: regex }
      ],
      role: { $in: ['Employee', 'Manager', 'HRAdmin', 'SuperAdmin'] }
    };
    
    // Select specific safe fields for non-admin
    const userSelect = userRole === 'HRAdmin' || userRole === 'SuperAdmin'
      ? '-password'
      : 'firstName lastName email profileImage designationName departmentName employeeCode role status';

    const users = await User.find(userSearchFilter).select(userSelect).limit(5).lean();
    addResults('Employees', users, 'employee');

    // --- ROLE-SPECIFIC FETCHES ---
    if (userRole === 'SuperAdmin') {
      // SuperAdmin can search Departments (if we had a string model), Jobs, Candidates
      const candidates = await User.find({
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        role: 'Candidate'
      }).select('-password').limit(5).lean();
      addResults('Candidates', candidates, 'candidate');

      const jobs = await Job.find({
        $or: [{ title: regex }, { department: regex }]
      }).limit(5).lean();
      addResults('Jobs', jobs, 'job');

    } else if (userRole === 'HRAdmin') {
      // HR Admin can search everything basically
      const candidates = await User.find({
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        role: 'Candidate'
      }).select('-password').limit(5).lean();
      addResults('Candidates', candidates, 'candidate');

      const jobs = await Job.find({
        $or: [{ title: regex }, { department: regex }]
      }).limit(5).lean();
      addResults('Jobs', jobs, 'job');

      const complaints = await Complaint.find({
        $or: [{ subject: regex }, { complaintId: regex }]
      }).populate('employeeId', 'firstName lastName employeeCode').limit(5).lean();
      addResults('Complaints', complaints, 'complaint');

      const assets = await Asset.find({
        $or: [{ assetName: regex }, { assetId: regex }]
      }).populate('assignedTo', 'firstName lastName').limit(5).lean();
      addResults('Assets', assets, 'asset');

    } else if (userRole === 'Manager') {
      // Manager can search their own data + their team's data
      // Find team members
      const projects = await Project.find({ managerId: userId }).select('teamMembers');
      let teamMemberIds = new Set<string>();
      projects.forEach(p => p.teamMembers.forEach(m => teamMemberIds.add(m.toString())));
      const teamArray = Array.from(teamMemberIds);

      // Complaints (Own + Team)
      const complaints = await Complaint.find({
        $and: [
          { $or: [{ subject: regex }, { complaintId: regex }] },
          { $or: [{ employeeId: userId }, { employeeId: { $in: teamArray } }] }
        ]
      }).populate('employeeId', 'firstName lastName').limit(5).lean();
      addResults('Complaints', complaints, 'complaint');

      // Assets (Own + Team)
      const assets = await Asset.find({
        $and: [
          { $or: [{ assetName: regex }, { assetId: regex }] },
          { $or: [{ assignedTo: userId }, { assignedTo: { $in: teamArray } }] }
        ]
      }).populate('assignedTo', 'firstName lastName').limit(5).lean();
      addResults('Assets', assets, 'asset');

      // Leaves (Own)
      const leaves = await Leave.find({
        $or: [{ reason: regex }, { leaveType: regex }],
        employeeId: userId
      }).limit(5).lean();
      addResults('My Leaves', leaves, 'leave');

      // Documents (Own)
      const docs = await Document.find({
        name: regex,
        employeeId: userId
      }).limit(5).lean();
      addResults('My Documents', docs, 'document');

    } else if (userRole === 'Employee') {
      // Employee searches own data
      const complaints = await Complaint.find({
        $or: [{ subject: regex }, { complaintId: regex }],
        employeeId: userId
      }).limit(5).lean();
      addResults('My Complaints', complaints, 'complaint');

      const assets = await Asset.find({
        $or: [{ assetName: regex }, { assetId: regex }],
        assignedTo: userId
      }).limit(5).lean();
      addResults('My Assets', assets, 'asset');

      const leaves = await Leave.find({
        $or: [{ reason: regex }, { leaveType: regex }],
        employeeId: userId
      }).limit(5).lean();
      addResults('My Leaves', leaves, 'leave');

      const docs = await Document.find({
        name: regex,
        employeeId: userId
      }).limit(5).lean();
      addResults('My Documents', docs, 'document');
    }

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error during search' });
  }
};
