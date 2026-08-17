import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { LeaveRequest } from '../models/leave.model';
import { Complaint } from '../models/complaint.model';
import { ServiceRequest } from '../models/serviceRequest.model';
import { DocumentModel } from '../models/document.model';
import { TrainingEnrollment } from '../models/trainingEnrollment.model';
import { Project } from '../models/project.model';
import { Payslip } from '../models/payslip.model';

export const getRecentActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // Assuming role is available on req.user
    const filter = (req.query.filter as string) || 'all';
    const limitParam = parseInt(req.query.limit as string);
    const limit = isNaN(limitParam) ? 0 : limitParam; // 0 means no limit

    let targetUserIds: string[] = [userId];

    if (userRole === 'Manager' || userRole === 'HRAdmin' || userRole === 'SuperAdmin') {
      if (filter === 'team' || filter === 'all') {
        const teamMembers = await User.find({ managerId: userId }).select('_id');
        const teamMemberIds = teamMembers.map(m => m._id.toString());
        
        if (filter === 'all') {
          targetUserIds = [userId, ...teamMemberIds];
        } else if (filter === 'team') {
          targetUserIds = teamMemberIds;
        }
      }
    } else {
      // Employees can only see their own activities
      targetUserIds = [userId];
    }

    const promises = [];

    // 1. Leave Requests
    promises.push(
      LeaveRequest.find({ userId: { $in: targetUserIds } })
        .populate('userId', 'firstName lastName profileImage')
        .lean()
        .then(leaves => leaves.map(l => ({
          id: l._id.toString(),
          type: 'Leave',
          action: `Leave ${l.status}`,
          description: `${l.leaveType} (${l.numberOfDays} days)`,
          date: l.updatedAt || l.createdAt,
          module: 'Leave',
          user: l.userId,
          status: l.status,
          iconColor: l.status === 'Approved' ? '🟣' : (l.status === 'Rejected' ? '🔴' : '🟡')
        })))
    );

    // 2. Complaints
    promises.push(
      Complaint.find({ employeeId: { $in: targetUserIds } })
        .populate('employeeId', 'firstName lastName profileImage')
        .lean()
        .then(complaints => complaints.map(c => ({
          id: c._id.toString(),
          type: 'Complaint',
          action: `Complaint ${c.status}`,
          description: `${c.complaintId} — ${c.subject}`,
          date: c.updatedAt || c.createdAt,
          module: 'Complaint',
          user: c.employeeId,
          status: c.status,
          iconColor: c.status === 'Solved' ? '🟢' : '🟠'
        })))
    );

    // 3. Service Requests
    promises.push(
      ServiceRequest.find({ employeeId: { $in: targetUserIds } })
        .populate('employeeId', 'firstName lastName profileImage')
        .lean()
        .then(requests => requests.map(s => ({
          id: s._id.toString(),
          type: 'Service Request',
          action: `Service Request ${s.status}`,
          description: `${s.requestId} — ${s.title}`,
          date: s.updatedAt || s.createdAt,
          module: 'Service Request',
          user: s.employeeId,
          status: s.status,
          iconColor: s.status === 'Resolved' || s.status === 'Closed' ? '🔵' : '🟠'
        })))
    );

    // 4. Documents / Certificates
    promises.push(
      DocumentModel.find({ uploadedBy: { $in: targetUserIds } })
        .populate('uploadedBy', 'firstName lastName profileImage')
        .lean()
        .then(docs => docs.map(d => ({
          id: d._id.toString(),
          type: 'Document',
          action: d.category === 'Certificate' || d.category === 'Certifications' ? 'Certificate Added' : 'Document Added',
          description: d.name,
          date: d.createdAt,
          module: 'Documents',
          user: d.uploadedBy,
          status: 'Active',
          iconColor: '🟢'
        })))
    );

    // 5. Training Enrollments
    promises.push(
      TrainingEnrollment.find({ employeeId: { $in: targetUserIds } })
        .populate('employeeId', 'firstName lastName profileImage')
        .populate('trainingId', 'title')
        .lean()
        .then(trainings => trainings.map(t => ({
          id: t._id.toString(),
          type: 'Training',
          action: `Training ${t.status}`,
          description: (t.trainingId as any)?.title || 'Training Program',
          date: t.completedAt || t.updatedAt || t.createdAt,
          module: 'Training',
          user: t.employeeId,
          status: t.status,
          iconColor: t.status === 'Completed' ? '🟢' : '🟡'
        })))
    );

    // 6. Payslips
    promises.push(
      Payslip.find({ employeeId: { $in: targetUserIds } })
        .populate('employeeId', 'firstName lastName profileImage')
        .lean()
        .then(payslips => payslips.map(p => ({
          id: p._id.toString(),
          type: 'Payslip',
          action: 'Payslip Available',
          description: `Payslip for ${new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          date: p.createdAt,
          module: 'Payslip',
          user: p.employeeId,
          status: p.paymentStatus,
          iconColor: '🟣'
        })))
    );

    // 7. Projects
    promises.push(
      Project.find({ teamMembers: { $in: targetUserIds } })
        .lean()
        .then(async projects => {
          const activities: any[] = [];
          for (const p of projects) {
            const usersInProject = p.teamMembers.map(tm => tm.toString()).filter(id => targetUserIds.includes(id));
            if (usersInProject.length > 0) {
              const usersInfo = await User.find({ _id: { $in: usersInProject } }).select('firstName lastName profileImage').lean();
              usersInfo.forEach(u => {
                activities.push({
                  id: p._id.toString() + '_' + u._id.toString(),
                  type: 'Project',
                  action: `Project ${p.status}`,
                  description: p.name,
                  date: p.updatedAt || p.createdAt,
                  module: 'Projects',
                  user: u,
                  status: p.status,
                  iconColor: '🔵'
                });
              });
            }
          }
          return activities;
        })
    );

    const results = await Promise.all(promises);
    
    // Flatten arrays
    const allActivities = results.flat();
    
    // Sort descending by date
    allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply limit if specified
    const finalActivities = limit > 0 ? allActivities.slice(0, limit) : allActivities;

    res.status(200).json({
      success: true,
      data: finalActivities
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    next(error);
  }
};
