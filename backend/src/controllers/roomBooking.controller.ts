import { Request, Response, NextFunction } from 'express';
import { Room } from '../models/room.model';
import { RoomBooking } from '../models/roomBooking.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { Visitor } from '../models/visitor.model';
import { AppError } from '../utils/error';
import mongoose from 'mongoose';

// Helper to parse time string "HH:mm" to minutes since midnight for easy comparison
const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// 1. Get all rooms (and optionally their availability for a specific date)
export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const rooms = await Room.find({ status: 'Active' });

    if (!date) {
      return res.status(200).json({ success: true, data: rooms });
    }

    // If date is provided, find bookings for that date to check availability
    const queryDate = new Date(date as string);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(queryDate.getDate() + 1);

    const bookings = await RoomBooking.find({
      date: { $gte: queryDate, $lt: nextDay },
      status: { $ne: 'Cancelled' }
    });

    // We can return the rooms along with their bookings for that day, so frontend can compute availability or display blocks
    const roomsWithBookings = rooms.map(room => {
      const roomBookings = bookings.filter(b => b.roomId.toString() === room._id.toString());
      return {
        ...room.toObject(),
        bookings: roomBookings
      };
    });

    res.status(200).json({ success: true, data: roomsWithBookings });
  } catch (error) {
    next(error);
  }
};

// 2. Get bookings based on role
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let query: any = {};

    if (userRole === 'SuperAdmin' || userRole === 'HRAdmin') {
      // see all
    } else if (userRole === 'Manager') {
      // Manager can see bookings they created, or are a participant in.
      // They also need to see "Team Meetings" they created.
      query.$or = [
        { createdBy: userId },
        { participants: userId }
      ];
    } else {
      // Employee sees bookings they created, or are a participant in.
      query.$or = [
        { createdBy: userId },
        { participants: userId }
      ];
    }

    const bookings = await RoomBooking.find(query)
      .populate('roomId', 'name type location capacity')
      .populate('participants', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('visitorId')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// 3. Create booking
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, meetingType, roomId, participants, clientName, clientContact, date, startTime, endTime, hasVisitor, visitorName, visitorCompany, visitorEmail, visitorPhone } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Role-based validation
    if (meetingType === 'Team Meeting' && userRole !== 'Manager' && userRole !== 'HRAdmin' && userRole !== 'SuperAdmin') {
      return next(new AppError('Only Managers or Admins can create Team Meetings', 403));
    }

    // Basic time validation
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    if (startMins >= endMins) {
      return next(new AppError('End time must be after start time', 400));
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(bookingDate.getDate() + 1);

    // Overlapping room validation
    const overlappingRoomBookings = await RoomBooking.find({
      roomId,
      date: { $gte: bookingDate, $lt: nextDay },
      status: { $ne: 'Cancelled' }
    });

    for (const booking of overlappingRoomBookings) {
      const existingStart = timeToMinutes(booking.startTime);
      const existingEnd = timeToMinutes(booking.endTime);
      
      // Check for overlap: start < existingEnd AND end > existingStart
      if (startMins < existingEnd && endMins > existingStart) {
        return next(new AppError('Room is already booked during this time', 400));
      }
    }

    // Participant conflict validation
    let validParticipants = participants || [];
    if (validParticipants.length > 0) {
      const overlappingParticipantBookings = await RoomBooking.find({
        participants: { $in: validParticipants },
        date: { $gte: bookingDate, $lt: nextDay },
        status: { $ne: 'Cancelled' }
      });

      for (const booking of overlappingParticipantBookings) {
        const existingStart = timeToMinutes(booking.startTime);
        const existingEnd = timeToMinutes(booking.endTime);
        
        if (startMins < existingEnd && endMins > existingStart) {
          return next(new AppError('One or more participants are already booked during this time', 400));
        }
      }
    }

    // Team meeting specific rules
    if (meetingType === 'Team Meeting') {
      // Validate all participants are in manager's team
      const teamMembers = await User.find({ managerId: userId }).select('_id');
      const teamIds = teamMembers.map(u => u._id.toString());
      
      for (const p of validParticipants) {
        if (!teamIds.includes(p.toString()) && p.toString() !== userId.toString()) {
          return next(new AppError('For Team Meetings, participants must be from your own team', 400));
        }
      }
    }

    // Create booking
    const booking = new RoomBooking({
      title,
      meetingType,
      roomId,
      createdBy: userId,
      participants: validParticipants,
      clientName,
      clientContact,
      date: bookingDate,
      startTime,
      endTime,
      status: 'Upcoming'
    });

    // Handle Visitor Creation
    if (meetingType === 'Client Meeting' && hasVisitor) {
      if (!visitorName || !visitorCompany) {
        return next(new AppError('Visitor name and company are required', 400));
      }

      const visitor = await Visitor.create({
        visitorName,
        companyName: visitorCompany,
        email: visitorEmail,
        phone: visitorPhone,
        hostUserId: userId,
        meetingId: booking._id,
        roomId: roomId,
        status: 'Expected'
      });

      booking.visitorId = visitor._id;
    }

    await booking.save();

    const room = await Room.findById(roomId);

    // Create notifications for participants
    if (validParticipants.length > 0) {
      const notifications = validParticipants.filter((p: string) => p.toString() !== userId.toString()).map((p: string) => ({
        userId: p,
        type: 'Meeting',
        title: `🗓️ New Meeting: ${title}`,
        message: `${title} has been scheduled for ${bookingDate.toLocaleDateString()} at ${startTime} in ${room?.name || 'Meeting Room'}.`
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// 4. Cancel booking
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    if (booking.createdBy.toString() !== userId && userRole !== 'SuperAdmin' && userRole !== 'HRAdmin') {
      return next(new AppError('Not authorized to cancel this booking', 403));
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Cancel visitor if exists
    if (booking.visitorId) {
      await Visitor.findByIdAndUpdate(booking.visitorId, { status: 'Cancelled' });
    }

    // Notify participants
    if (booking.participants && booking.participants.length > 0) {
      const notifications = booking.participants.filter(p => p.toString() !== userId.toString()).map(p => ({
        userId: p,
        type: 'Meeting',
        title: `🚫 Meeting Cancelled: ${booking.title}`,
        message: `The meeting "${booking.title}" scheduled for ${new Date(booking.date).toLocaleDateString()} has been cancelled.`
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------------------------
// HR ADMIN / SUPER ADMIN ROOM MANAGEMENT ENDPOINTS
// ----------------------------------------------------------------------

// 5. Get ALL rooms for Admin (including Inactive)
export const getAllRoomsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

// 6. Create Room
export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, capacity, location, status } = req.body;

    if (!name) return next(new AppError('Room name is required', 400));
    if (capacity <= 0) return next(new AppError('Capacity must be greater than 0', 400));

    // Check for duplicate name
    const existing = await Room.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (existing) {
      return next(new AppError('A room with this name already exists', 400));
    }

    const room = await Room.create({
      name,
      type,
      capacity,
      location,
      status: status || 'Active'
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// 7. Update Room
export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, capacity, location, status } = req.body;
    
    if (name) {
      const existing = await Room.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') }, _id: { $ne: req.params.id } });
      if (existing) return next(new AppError('A room with this name already exists', 400));
    }
    
    if (capacity !== undefined && capacity <= 0) {
      return next(new AppError('Capacity must be greater than 0', 400));
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { name, type, capacity, location, status },
      { new: true, runValidators: true }
    );

    if (!room) return next(new AppError('Room not found', 404));

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// 8. Update Room Status (Activate/Deactivate)
export const updateRoomStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    if (!['Active', 'Inactive'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!room) return next(new AppError('Room not found', 404));

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// 9. Delete Room
export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if room has bookings
    const bookings = await RoomBooking.countDocuments({ roomId: req.params.id });
    if (bookings > 0) {
      return next(new AppError('Cannot delete room because it has existing bookings. Please deactivate it instead.', 400));
    }

    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return next(new AppError('Room not found', 404));

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

