import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { Timesheet } from '../models/timesheet.model';
import { Goal } from '../models/goal.model';
import mongoose from 'mongoose';

// Helper function to calculate workload status based on metrics
const calculateWorkloadStatus = (projects: number, tasks: number, hours: number) => {
  if (projects >= 4 || tasks >= 10 || hours > 45) {
    return 'High';
  } else if (projects >= 2 || tasks >= 5 || hours >= 35) {
    return 'Moderate';
  } else {
    return 'Balanced';
  }
};

// Helper function to fetch workload metrics for a specific user ID
const fetchUserWorkloadMetrics = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // 1. Active Projects
  const activeProjects = await Project.countDocuments({
    teamMembers: userObjectId,
    status: 'Active'
  });

  // 2. Pending Tasks
  const pendingTasks = await Task.countDocuments({
    assigneeId: userObjectId,
    status: { $in: ['To Do', 'In Progress'] }
  });

  // 3. Weekly Working Hours (from Timesheets)
  // Get start and end of current week (assuming week starts on Monday)
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const timesheetData = await Timesheet.aggregate([
    {
      $match: {
        employeeId: userObjectId,
        date: { $gte: startOfWeek, $lte: endOfWeek },
        status: { $in: ['Submitted', 'Approved'] }
      }
    },
    {
      $group: {
        _id: null,
        totalHours: { $sum: '$hoursWorked' }
      }
    }
  ]);
  const weeklyHours = timesheetData.length > 0 ? timesheetData[0].totalHours : 0;

  // 4. Goal Progress
  const goalsData = await Goal.aggregate([
    {
      $match: {
        assignedTo: userObjectId,
        status: { $in: ['Not Started', 'In Progress'] }
      }
    },
    {
      $group: {
        _id: null,
        avgProgress: { $avg: '$progress' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const goalProgress = goalsData.length > 0 ? Math.round(goalsData[0].avgProgress) : 0;
  const activeGoals = goalsData.length > 0 ? goalsData[0].count : 0;

  return {
    activeProjects,
    pendingTasks,
    weeklyHours,
    goalProgress,
    activeGoals,
    workloadStatus: calculateWorkloadStatus(activeProjects, pendingTasks, weeklyHours)
  };
};

export const getMyWorkload = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const metrics = await fetchUserWorkloadMetrics(userId);
    const user = await User.findById(userId).select('wellbeingStatus wellbeingLastUpdated');

    res.status(200).json({
      success: true,
      data: {
        ...metrics,
        wellbeingStatus: user?.wellbeingStatus || null,
        wellbeingLastUpdated: user?.wellbeingLastUpdated || null
      }
    });
  } catch (error: any) {
    console.error('Get my workload error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getTeamWorkload = async (req: Request, res: Response) => {
  try {
    const managerId = req.user?._id;
    if (!managerId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Identify team members: Direct reports + team members of projects led by manager
    const directReports = await User.find({ managerId }).select('_id firstName lastName profileImage');
    
    const managerProjects = await Project.find({ managerId }).select('teamMembers');
    const projectTeamMemberIds = managerProjects.flatMap(p => p.teamMembers.map(id => id.toString()));

    const allTeamMembersMap = new Map();
    
    // Add direct reports
    directReports.forEach(member => {
      allTeamMembersMap.set(member._id.toString(), member);
    });

    // We only need to fetch users from project team members if they aren't already in the map
    const missingMemberIds = projectTeamMemberIds.filter(id => !allTeamMembersMap.has(id));
    
    if (missingMemberIds.length > 0) {
      const additionalMembers = await User.find({ _id: { $in: missingMemberIds } })
        .select('_id firstName lastName profileImage');
      additionalMembers.forEach(member => {
        allTeamMembersMap.set(member._id.toString(), member);
      });
    }

    const teamMembersList = Array.from(allTeamMembersMap.values());

    // Calculate workload for each team member
    const teamWorkload = await Promise.all(
      teamMembersList.map(async (member) => {
        const metrics = await fetchUserWorkloadMetrics(member._id.toString());
        return {
          employee: {
            _id: member._id,
            firstName: member.firstName,
            lastName: member.lastName,
            profileImage: member.profileImage
          },
          ...metrics
        };
      })
    );

    res.status(200).json({
      success: true,
      data: teamWorkload
    });

  } catch (error: any) {
    console.error('Get team workload error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const updateWellbeing = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { status } = req.body;

    if (!['Good', 'Okay', 'Stressed', 'Overloaded'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid wellbeing status' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        wellbeingStatus: status,
        wellbeingLastUpdated: new Date()
      },
      { new: true }
    ).select('wellbeingStatus wellbeingLastUpdated');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Update wellbeing error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
