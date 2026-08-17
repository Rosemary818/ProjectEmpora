import { Request, Response } from 'express';
import { Goal } from '../models/goal.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';

// Create a new goal (Manager only)
export const createGoal = async (req: Request, res: Response) => {
  try {
    const { title, description, assignedTo, targetDate, priority } = req.body;
    const assignedBy = req.user?._id;

    if (!title || !description || !assignedTo || !targetDate) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // Verify employee exists and belongs to the manager's team
    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const managerProjects = await Project.find({ managerId: assignedBy });
    const teamMemberIds = managerProjects.flatMap(p => p.teamMembers.map(id => id.toString()));

    if (String(employee.managerId) !== String(assignedBy) && !teamMemberIds.includes(String(assignedTo))) {
      return res.status(403).json({ success: false, error: 'You can only assign goals to your own team members' });
    }

    const goal = await Goal.create({
      title,
      description,
      assignedTo,
      assignedBy,
      targetDate,
      priority: priority || 'Medium',
    });

    // Notify employee
    await Notification.create({
      userId: assignedTo,
      type: 'Goal',
      title: 'New Goal Assigned',
      message: `Your manager assigned you a new goal: "${title}"`,
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get manager's team goals
export const getManagerGoals = async (req: Request, res: Response) => {
  try {
    const managerId = req.user?._id;
    
    // First, find all team members (direct reports and project members)
    const directReports = await User.find({ managerId }).select('_id');
    const directReportIds = directReports.map(member => member._id.toString());

    const managerProjects = await Project.find({ managerId });
    const projectTeamMemberIds = managerProjects.flatMap(p => p.teamMembers.map(id => id.toString()));

    const teamMemberIds = [...new Set([...directReportIds, ...projectTeamMemberIds])];

    // Build filter
    const filter: any = { assignedTo: { $in: teamMemberIds } };
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.employeeId && req.query.employeeId !== 'All') {
      filter.assignedTo = req.query.employeeId;
    }

    const goals = await Goal.find(filter)
      .populate('assignedTo', 'firstName lastName profileImage')
      .populate('assignedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: goals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get employee's own goals
export const getEmployeeGoals = async (req: Request, res: Response) => {
  try {
    const employeeId = req.user?._id;
    
    const filter: any = { assignedTo: employeeId };
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    const goals = await Goal.find(filter)
      .populate('assignedBy', 'firstName lastName profileImage')
      .sort({ targetDate: 1 });

    res.status(200).json({ success: true, data: goals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update goal progress (Employee only)
export const updateGoalProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const employeeId = req.user?._id;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, error: 'Progress must be between 0 and 100' });
    }

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    if (String(goal.assignedTo) !== String(employeeId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this goal' });
    }

    const previousStatus = goal.status;
    goal.progress = progress;
    await goal.save(); // pre-save hook handles status change

    // Notify manager if completed
    if (goal.status === 'Completed' && previousStatus !== 'Completed') {
      await Notification.create({
        userId: goal.assignedBy,
        type: 'Goal',
        title: 'Goal Completed',
        message: `Employee completed the goal: "${goal.title}"`,
      });
    }

    res.status(200).json({ success: true, data: goal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update goal (Manager only) - edit details or add feedback
export const updateGoalManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, description, targetDate, priority, status, managerFeedback,
      overallRating, technicalSkillsRating, communicationRating, teamworkRating, 
      productivityRating, strengths, areasForImprovement, reviewPeriod, reviewDate
    } = req.body;
    const managerId = req.user?._id;

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    // Verify it belongs to one of their team members
    const employee = await User.findById(goal.assignedTo);
    const managerProjects = await Project.find({ managerId });
    const teamMemberIds = managerProjects.flatMap(p => p.teamMembers.map(id => id.toString()));

    if (String(employee?.managerId) !== String(managerId) && !teamMemberIds.includes(String(goal.assignedTo)) && String(goal.assignedBy) !== String(managerId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this goal' });
    }

    // Identify if feedback changed to notify employee
    const feedbackChanged = managerFeedback !== undefined && managerFeedback !== goal.managerFeedback;
    const ratingAdded = overallRating !== undefined && overallRating !== goal.overallRating;

    if (title) goal.title = title;
    if (description) goal.description = description;
    if (targetDate) goal.targetDate = targetDate;
    if (priority) goal.priority = priority;
    if (status) goal.status = status;
    if (managerFeedback !== undefined) goal.managerFeedback = managerFeedback;
    if (overallRating !== undefined) goal.overallRating = overallRating;
    if (technicalSkillsRating !== undefined) goal.technicalSkillsRating = technicalSkillsRating;
    if (communicationRating !== undefined) goal.communicationRating = communicationRating;
    if (teamworkRating !== undefined) goal.teamworkRating = teamworkRating;
    if (productivityRating !== undefined) goal.productivityRating = productivityRating;
    if (strengths !== undefined) goal.strengths = strengths;
    if (areasForImprovement !== undefined) goal.areasForImprovement = areasForImprovement;
    if (reviewPeriod !== undefined) goal.reviewPeriod = reviewPeriod;
    if (reviewDate !== undefined) goal.reviewDate = reviewDate;

    await goal.save();

    if ((feedbackChanged && managerFeedback) || ratingAdded) {
      await Notification.create({
        userId: goal.assignedTo,
        type: 'Goal',
        title: 'New Performance Review',
        message: `Your manager has submitted a performance review for your goal: "${goal.title}"`,
      });
    }

    res.status(200).json({ success: true, data: goal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
