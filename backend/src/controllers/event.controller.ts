import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/event.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/error';

const determineEventStatus = (event: any) => {
  if (event.status === 'Cancelled' || event.status === 'Postponed') {
    return event.status;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const eventStart = new Date(event.eventDate);
  eventStart.setHours(0, 0, 0, 0);

  if (eventStart.getTime() > now.getTime()) {
    return 'Upcoming';
  } else if (eventStart.getTime() === now.getTime()) {
    return 'Today';
  } else {
    return 'Completed';
  }
};

// Helper to calculate target users for notifications
const getTargetUserIds = async (event: any): Promise<string[]> => {
  let userQuery: any = { status: 'Active' };
  
  switch (event.targetAudience) {
    case 'All Internal Users':
    case 'All Employees':
      userQuery.role = { $in: ['Employee', 'Manager', 'HRAdmin', 'SuperAdmin'] };
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
      if (event.targetDepartment) {
        userQuery.departmentId = event.targetDepartment;
      }
      break;
    default:
      return [];
  }
  
  const users = await User.find(userQuery).select('_id');
  return users.map(u => u._id.toString());
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const publishEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    if (event.status === 'Cancelled') {
      return next(new AppError('Cannot publish a cancelled event', 400));
    }

    const targetUserIds = await getTargetUserIds(event);
    const notifications = targetUserIds.map(userId => ({
      userId,
      type: 'Event',
      title: `📢 New Event: ${event.title}`,
      message: `📅 Date: ${new Date(event.eventDate).toLocaleDateString()}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      
      event.hasInvitedParticipants = true;
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'Event published and notifications sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user.role;
    let query: any = {};

    if (userRole === 'SuperAdmin' || userRole === 'HRAdmin') {
      // Admins see all events
    } else {
      // Employees / Managers see only events targeting them
      const audienceConditions: any[] = [];
      audienceConditions.push({ targetAudience: 'All Internal Users' });
      audienceConditions.push({ targetAudience: 'All Employees' });

      if (userRole === 'Employee') {
        audienceConditions.push({ targetAudience: 'Employees' });
      } else if (userRole === 'Manager') {
        audienceConditions.push({ targetAudience: 'Managers' });
      }

      // Department matching
      const user = await User.findById(req.user.id).select('departmentId');
      if (user?.departmentId) {
        audienceConditions.push({
          targetAudience: 'Specific Department',
          targetDepartment: user.departmentId.toString()
        });
      }

      query.$or = audienceConditions;
    }

    // Apply optional category or status filters passed via query params
    if (req.query.category) query.category = req.query.category;
    
    // Notice: if client asks for a specific status, we won't strictly enforce it at the DB level 
    // if we are dynamically calculating it, but for 'Cancelled', we can query it directly.
    if (req.query.status === 'Cancelled') {
      query.status = 'Cancelled';
    } else if (req.query.status) {
      // We will filter in memory for dynamic statuses
    }

    let events = await Event.find(query)
      .populate('organizerId', 'firstName lastName profileImage')
      .sort({ eventDate: 1 });

    // Format output with dynamically calculated statuses
    const formattedEvents = events.map(evt => {
      const eObj = evt.toObject();
      eObj.status = determineEventStatus(eObj);
      return eObj;
    });

    // If client requested a specific dynamic status, filter in memory
    let filteredEvents = formattedEvents;
    if (req.query.status && req.query.status !== 'Cancelled') {
      filteredEvents = formattedEvents.filter(e => e.status === req.query.status);
    }

    res.status(200).json({
      success: true,
      count: filteredEvents.length,
      data: filteredEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'firstName lastName profileImage');

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    const eventObj = event.toObject();
    eventObj.status = determineEventStatus(eventObj);

    res.status(200).json({
      success: true,
      data: eventObj,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notifyParticipants, ...updateData } = req.body;
    updateData.updatedBy = req.user.id;
    
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return next(new AppError('Event not found', 404));
    }

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    if (notifyParticipants) {
      const targetUserIds = await getTargetUserIds(event);
      const notifications = targetUserIds.map(userId => ({
        userId,
        type: 'Event',
        title: `🔄 Event Updated: ${event.title}`,
        message: `An event you are invited to has been updated. 📅 Date: ${new Date(event.eventDate).toLocaleDateString()}`,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const postponeEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newDate, reason } = req.body;
    
    if (!newDate) {
      return next(new AppError('New date is required to postpone an event', 400));
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Save history
    if (!event.postponementHistory) {
      event.postponementHistory = [];
    }
    
    event.postponementHistory.push({
      previousDate: event.eventDate,
      reason: reason || '',
      postponedAt: new Date()
    });

    event.eventDate = new Date(newDate);
    event.status = 'Postponed';

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteToEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError('Please provide an array of userIds to invite', 400));
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    const notifications = userIds.map(userId => ({
      userId,
      type: 'Event',
      title: `🎟️ You're Invited: ${event.title}`,
      message: `You've been specially invited to participate! 📅 Date: ${new Date(event.eventDate).toLocaleDateString()}`,
    }));

    await Notification.insertMany(notifications);
    
    event.hasInvitedParticipants = true;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Successfully invited ${userIds.length} employees`,
    });
  } catch (error) {
    next(error);
  }
};
