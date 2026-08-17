import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/event.model';
import { Holiday } from '../models/holiday.model';
import { LeaveRequest } from '../models/leave.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { AppError } from '../utils/error';

export const getCalendarData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    // 1. Fetch Events
    let eventQuery: any = {};
    if (userRole === 'SuperAdmin' || userRole === 'HRAdmin') {
      // Admins see all events
    } else {
      const audienceConditions: any[] = [];
      audienceConditions.push({ targetAudience: 'All Internal Users' });
      audienceConditions.push({ targetAudience: 'All Employees' });

      if (userRole === 'Employee') {
        audienceConditions.push({ targetAudience: 'Employees' });
      } else if (userRole === 'Manager') {
        audienceConditions.push({ targetAudience: 'Managers' });
      }

      const user = await User.findById(userId).select('department');
      if (user?.department) {
        audienceConditions.push({
          targetAudience: 'Specific Department',
          targetDepartment: user.department
        });
      }

      eventQuery.$or = audienceConditions;
    }
    const events = await Event.find(eventQuery).populate('organizerId', 'firstName lastName');

    // 2. Fetch Holidays
    const holidays = await Holiday.find();

    // 3. Fetch Leaves
    let leaveQuery: any = { status: 'Approved' };
    if (userRole === 'Employee') {
      leaveQuery.userId = userId;
    } else if (userRole === 'Manager') {
      const projects = await Project.find({ managerId: userId });
      const teamMemberIdsSet = new Set(projects.flatMap(p => p.teamMembers.map(id => id.toString())));
      const teamMemberIds = [...teamMemberIdsSet];
      
      // Manager sees their own leaves + team leaves
      leaveQuery.userId = { $in: [userId, ...teamMemberIds] };
    }
    // HRAdmin/SuperAdmin sees all approved leaves
    
    const leaves = await LeaveRequest.find(leaveQuery).populate('userId', 'firstName lastName profileImage');

    // 4. Fetch Birthdays and Work Anniversaries
    // active employees only
    const activeUsers = await User.find({ status: 'Active' }).select('firstName lastName dateOfBirth dateOfJoining profileImage');
    
    const birthdays = activeUsers
      .filter(u => u.dateOfBirth)
      .map(u => ({
        _id: `bday-${u._id}`,
        type: 'Birthday',
        title: `${u.firstName} ${u.lastName}'s Birthday`,
        date: u.dateOfBirth,
        user: u
      }));
      
    const workAnniversaries = activeUsers
      .filter(u => u.dateOfJoining)
      .map(u => ({
        _id: `workanniv-${u._id}`,
        type: 'WorkAnniversary',
        title: `${u.firstName} ${u.lastName}'s Work Anniversary`,
        date: u.dateOfJoining,
        user: u
      }));

    res.status(200).json({
      success: true,
      data: {
        events,
        holidays,
        leaves,
        birthdays,
        workAnniversaries
      }
    });

  } catch (error) {
    next(error);
  }
};
