import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AppError } from '../utils/error';
import { Attendance } from '../models/attendance.model';
import { Task } from '../models/task.model';
import { ServiceRequest } from '../models/serviceRequest.model';
import { Project } from '../models/project.model';
import { RoomBooking } from '../models/roomBooking.model';
import { calculateLeaveBalances } from './leave.controller';

export const chatWithBot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!message) {
      return next(new AppError('Message string is required', 400));
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const lowerMessage = message.toLowerCase();
    let responseText = "I can currently help you with leave balance, attendance, projects, tasks, meetings, service requests and bench status.";

    if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
        responseText = `Hi ${user.firstName}! How can I help you today?`;
    } else if (lowerMessage.includes('leave')) {
        const { balances } = await calculateLeaveBalances(userId);
        responseText = `You currently have ${balances['Casual Leave'].remaining} Casual Leave, ${balances['Sick Leave'].remaining} Sick Leave, and ${balances['Earned Leave'].remaining} Earned Leave remaining.`;
    } else if (lowerMessage.includes('attendance')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ employee: userId, date: { $gte: today } });
        if (attendance) {
            responseText = `Today's attendance status is ${attendance.status}. ${attendance.checkIn ? `You checked in at ${attendance.checkIn.toLocaleTimeString()}.` : ''}`;
        } else {
            responseText = "No attendance recorded for today.";
        }
    } else if (lowerMessage.includes('bench status')) {
        const projects = await Project.find({ teamMembers: userId, status: { $in: ['Upcoming', 'Active'] } });
        if (projects.length > 0) {
            responseText = "You are currently Allocated to an active project.";
        } else {
            responseText = "You are currently On Bench.";
        }
    } else if (lowerMessage.includes('project')) {
        const projects = await Project.find({ teamMembers: userId, status: { $in: ['Upcoming', 'Active'] } });
        if (projects.length > 0) {
            const projectNames = projects.map(p => p.name).join(', ');
            responseText = `Your current active projects are: ${projectNames}.`;
        } else {
            responseText = "You are not assigned to any active projects.";
        }
    } else if (lowerMessage.includes('task')) {
        const tasks = await Task.find({ assignedTo: userId, status: { $nin: ['Completed'] } });
        if (tasks.length > 0) {
            const taskDetails = tasks.map(t => `${t.title} (${t.status})`).join(', ');
            responseText = `Your pending tasks are: ${taskDetails}.`;
        } else {
            responseText = "You have no pending tasks.";
        }
    } else if (lowerMessage.includes('meeting')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const meetings = await RoomBooking.find({ participants: userId, status: 'Upcoming', date: { $gte: today } });
        if (meetings.length > 0) {
            const meetingDetails = meetings.map(m => `${m.title} at ${m.startTime}`).join(', ');
            responseText = `Your upcoming meetings today are: ${meetingDetails}.`;
        } else {
            responseText = "You have no upcoming meetings today.";
        }
    } else if (lowerMessage.includes('service request')) {
        const sr = await ServiceRequest.find({ employeeId: userId, status: { $in: ['Open', 'In Progress'] } });
        if (sr.length > 0) {
            const srDetails = sr.map(s => `${s.title} (${s.status})`).join(', ');
            responseText = `Your open service requests are: ${srDetails}.`;
        } else {
            responseText = "You have no open service requests.";
        }
    }

    res.status(200).json({
      success: true,
      message: { content: responseText }
    });

  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    next(error);
  }
};
