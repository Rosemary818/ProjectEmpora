import { Request, Response, NextFunction } from 'express';
import { Announcement } from '../models/announcement.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { AppError } from '../utils/error';

// Helper to determine target users based on audience
const getTargetUserIds = async (announcement: any): Promise<string[]> => {
  let userQuery: any = { status: 'Active' };
  
  switch (announcement.targetAudience) {
    case 'All Employees':
      userQuery.role = { $in: ['Employee', 'Manager', 'HRAdmin'] };
      break;
    case 'Employees':
      userQuery.role = 'Employee';
      break;
    case 'Managers':
      userQuery.role = 'Manager';
      break;
    case 'HR Admins':
      userQuery.role = 'HRAdmin';
      break;
    case 'Specific Department':
      userQuery.role = { $in: ['Employee', 'Manager'] };
      if (announcement.targetDepartment) {
        userQuery.department = announcement.targetDepartment;
      }
      break;
    case 'Specific Project Team':
      if (announcement.targetProjectId) {
        const project = await Project.findById(announcement.targetProjectId);
        if (project) {
          const teamMemberIds = project.teamMembers.map(id => id.toString());
          if (project.managerId) {
            teamMemberIds.push(project.managerId.toString());
          }
          userQuery._id = { $in: teamMemberIds };
        } else {
          return [];
        }
      }
      break;
    default:
      return [];
  }
  
  const users = await User.find(userQuery).select('_id');
  return users.map(u => u._id.toString());
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, summary, content, category, priority, targetAudience, targetDepartment, targetProjectId, status, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      summary,
      content,
      category,
      priority,
      targetAudience,
      targetDepartment,
      targetProjectId,
      status: status || 'Draft',
      publishedBy: req.user.id,
      publishedAt: status === 'Published' ? new Date() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    // If immediately published, generate notifications
    if (announcement.status === 'Published') {
      const targetUserIds = await getTargetUserIds(announcement);
      const notifications = targetUserIds.map(userId => ({
        userId,
        type: 'Announcement',
        title: `New Announcement: ${title}`,
        message: summary,
        relatedAnnouncementId: announcement._id,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const publishAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    if (announcement.status === 'Published') {
      return next(new AppError('Announcement is already published', 400));
    }

    announcement.status = 'Published';
    announcement.publishedAt = new Date();
    await announcement.save();

    const targetUserIds = await getTargetUserIds(announcement);
    const notifications = targetUserIds.map(userId => ({
      userId,
      type: 'Announcement',
      title: `New Announcement: ${announcement.title}`,
      message: announcement.summary,
      relatedAnnouncementId: announcement._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user.role;
    let query: any = {};

    // Base filtering: don't show expired to non-admins
    const now = new Date();
    const expiryFilter = {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    };

    if (userRole === 'SuperAdmin' || userRole === 'HRAdmin') {
      // HR/SuperAdmin can see all, but perhaps apply filters from query
      if (req.query.status) query.status = req.query.status;
      if (req.query.category) query.category = req.query.category;
      if (req.query.priority) query.priority = req.query.priority;
    } else {
      // Employees and Managers can only see Published, non-expired announcements that target them
      query.status = 'Published';
      query = { ...query, ...expiryFilter };

      // Determine audience conditions
      const audienceConditions: any[] = [];
      audienceConditions.push({ targetAudience: 'All Employees' });

      if (userRole === 'Employee') {
        audienceConditions.push({ targetAudience: 'Employees' });
      } else if (userRole === 'Manager') {
        audienceConditions.push({ targetAudience: 'Managers' });
      }

      // Department matching
      const user = await User.findById(req.user.id).select('department');
      if (user?.department) {
        audienceConditions.push({
          targetAudience: 'Specific Department',
          targetDepartment: user.department
        });
      }

      // Project matching
      const userProjects = await Project.find({
        $or: [{ teamMembers: req.user.id }, { managerId: req.user.id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      if (projectIds.length > 0) {
        audienceConditions.push({
          targetAudience: 'Specific Project Team',
          targetProjectId: { $in: projectIds }
        });
      }

      query.$or = audienceConditions;
      
      if (req.query.category) query.category = req.query.category;
      if (req.query.priority) query.priority = req.query.priority;
    }

    const announcements = await Announcement.find(query)
      .populate('publishedBy', 'firstName lastName')
      .populate('targetProjectId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('publishedBy', 'firstName lastName')
      .populate('targetProjectId', 'name');

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    // Optionally delete related notifications
    await Notification.deleteMany({ relatedAnnouncementId: req.params.id });

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const archiveAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, { status: 'Archived' }, { new: true });

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};
