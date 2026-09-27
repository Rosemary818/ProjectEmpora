import { Request, Response, NextFunction } from 'express';
import { Room } from '../models/room.model';
import { RoomBooking } from '../models/roomBooking.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { Visitor } from '../models/visitor.model';
import { SwapRequest } from '../models/swapRequest.model';
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
    const { title, meetingType, roomId, participants, clientName, clientContact, date, startTime, endTime, hasVisitor, visitorName, visitorCompany, visitorEmail, visitorPhone, preferredCapacity, preferredRoomId } = req.body;
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

    const room = await Room.findById(roomId);
    if (!room) return next(new AppError('Room not found', 404));

    let validParticipants = participants || [];
    const numAttendees = validParticipants.length + 1; // +1 for creator
    if (room.capacity < numAttendees) {
      return next(new AppError('Room capacity is insufficient for the number of attendees', 400));
    }

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
        return next(new AppError('This room is no longer available for the selected time.', 400));
      }
    }

    // Participant conflict validation
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
      preferredCapacity,
      preferredRoomId: preferredRoomId || undefined,
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

// 5. Get available alternatives for an existing booking
export const getAvailableAlternatives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await RoomBooking.findById(req.params.id).populate('roomId');
    if (!booking) return next(new AppError('Booking not found', 404));

    if (booking.status !== 'Upcoming') {
      return res.status(200).json({ success: true, data: null, message: 'Only upcoming bookings can be swapped' });
    }

    const currentRoom = booking.roomId as any;
    if (!currentRoom) return next(new AppError('Current room not found', 404));

    // Number of attendees = participants + creator
    const numAttendees = (booking.participants?.length || 0) + 1;

    // Minimum required capacity is preferredCapacity if specified, else numAttendees
    const minCapacity = booking.preferredCapacity || numAttendees;

    // Find all active rooms except the current one
    const activeRooms = await Room.find({ status: 'Active', _id: { $ne: currentRoom._id } });

    // Find all bookings for the same date and time that are not cancelled
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(bookingDate.getDate() + 1);

    const overlappingBookings = await RoomBooking.find({
      date: { $gte: bookingDate, $lt: nextDay },
      status: { $ne: 'Cancelled' },
      _id: { $ne: booking._id }
    });

    const startMins = timeToMinutes(booking.startTime);
    const endMins = timeToMinutes(booking.endTime);

    // Filter available rooms
    const availableRooms = activeRooms.filter(room => {
      // Must meet capacity requirement
      if (room.capacity < minCapacity) return false;

      // Check if it's booked during this time
      const roomBookings = overlappingBookings.filter(b => b.roomId.toString() === room._id.toString());
      for (const b of roomBookings) {
        const existingStart = timeToMinutes(b.startTime);
        const existingEnd = timeToMinutes(b.endTime);
        if (startMins < existingEnd && endMins > existingStart) {
          return false; // overlap found
        }
      }
      return true;
    });

    // Determine the best alternative
    let suggestedRoom = null;

    // 1. Check if preferredRoomId is available
    if (booking.preferredRoomId) {
      suggestedRoom = availableRooms.find(r => r._id.toString() === booking.preferredRoomId?.toString());
    }

    // 2. If no preferred room or not available, find a "Better Room" (smaller capacity but fits)
    if (!suggestedRoom) {
      const betterRooms = availableRooms.filter(r => r.capacity < currentRoom.capacity);
      if (betterRooms.length > 0) {
        // Sort by capacity ascending to get the smallest room that fits
        betterRooms.sort((a, b) => a.capacity - b.capacity);
        suggestedRoom = betterRooms[0];
      }
    }

    res.status(200).json({ success: true, data: suggestedRoom });
  } catch (error) {
    next(error);
  }
};

// 6. Swap room for an existing booking
export const swapRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newRoomId } = req.body;
    if (!newRoomId) return next(new AppError('New room ID is required', 400));

    const booking = await RoomBooking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    const userId = req.user.id;
    const userRole = req.user.role;

    if (booking.createdBy.toString() !== userId && userRole !== 'SuperAdmin' && userRole !== 'HRAdmin') {
      return next(new AppError('Not authorized to modify this booking', 403));
    }

    if (booking.status !== 'Upcoming') {
      return next(new AppError('Only upcoming bookings can be swapped', 400));
    }

    // Check if new room exists and is active
    const newRoom = await Room.findById(newRoomId);
    if (!newRoom || newRoom.status !== 'Active') {
      return next(new AppError('New room is not available or inactive', 400));
    }

    const numAttendees = (booking.participants?.length || 0) + 1;
    if (newRoom.capacity < numAttendees) {
      return next(new AppError('New room capacity is insufficient for the number of attendees', 400));
    }

    // Verify new room availability
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(bookingDate.getDate() + 1);

    const overlappingRoomBookings = await RoomBooking.find({
      roomId: newRoomId,
      date: { $gte: bookingDate, $lt: nextDay },
      status: { $ne: 'Cancelled' }
    });

    const startMins = timeToMinutes(booking.startTime);
    const endMins = timeToMinutes(booking.endTime);

    for (const b of overlappingRoomBookings) {
      const existingStart = timeToMinutes(b.startTime);
      const existingEnd = timeToMinutes(b.endTime);
      if (startMins < existingEnd && endMins > existingStart) {
        return next(new AppError('Sorry, this room is no longer available.', 400));
      }
    }

    // Perform swap
    booking.roomId = newRoomId;
    await booking.save();

    res.status(200).json({ success: true, message: `Room successfully swapped to ${newRoom.name}.`, data: booking });
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

// ----------------------------------------------------------------------
// ROOM SWAP REQUEST ENDPOINTS
// ----------------------------------------------------------------------

// 10. Get swappable bookings
export const getSwappableBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await RoomBooking.findById(req.params.id).populate('roomId');
    if (!booking) return next(new AppError('Booking not found', 404));

    if (booking.status !== 'Upcoming') {
      return res.status(200).json({ success: true, data: [] });
    }

    const currentRoom = booking.roomId as any;
    if (!currentRoom) return next(new AppError('Current room not found', 404));

    const numAttendees = (booking.participants?.length || 0) + 1;

    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(bookingDate.getDate() + 1);

    const sameDateBookings = await RoomBooking.find({
      date: { $gte: bookingDate, $lt: nextDay },
      status: 'Upcoming',
      _id: { $ne: booking._id },
      createdBy: { $ne: req.user.id }
    }).populate('roomId').populate('createdBy', 'firstName lastName email');

    const startMins = timeToMinutes(booking.startTime);
    const endMins = timeToMinutes(booking.endTime);

    const swappable = sameDateBookings.filter(otherBooking => {
      const otherRoom = otherBooking.roomId as any;
      if (!otherRoom || otherRoom.status !== 'Active') return false;

      const otherStartMins = timeToMinutes(otherBooking.startTime);
      const otherEndMins = timeToMinutes(otherBooking.endTime);

      if (startMins >= otherEndMins || endMins <= otherStartMins) return false;

      const otherNumAttendees = (otherBooking.participants?.length || 0) + 1;
      if (otherRoom.capacity < numAttendees) return false;
      if (currentRoom.capacity < otherNumAttendees) return false;

      return true;
    });

    res.status(200).json({ success: true, data: swappable });
  } catch (error) {
    next(error);
  }
};

// 11. Get Swap Requests
export const getSwapRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const requests = await SwapRequest.find({
      $or: [{ requester: userId }, { receiver: userId }]
    })
      .populate({ path: 'requester', select: 'firstName lastName email' })
      .populate({ path: 'receiver', select: 'firstName lastName email' })
      .populate({ path: 'requesterBooking', populate: { path: 'roomId' } })
      .populate({ path: 'receiverBooking', populate: { path: 'roomId' } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// 12. Create Swap Request
export const createSwapRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requesterBookingId, receiverBookingId } = req.body;
    const userId = req.user.id;

    if (!requesterBookingId || !receiverBookingId) {
      return next(new AppError('Both booking IDs are required', 400));
    }

    const requesterBooking = await RoomBooking.findById(requesterBookingId);
    const receiverBooking = await RoomBooking.findById(receiverBookingId);

    if (!requesterBooking || !receiverBooking) {
      return next(new AppError('One or both bookings not found', 404));
    }

    if (requesterBooking.createdBy.toString() !== userId) {
      return next(new AppError('You can only request swaps for your own bookings', 403));
    }

    if (requesterBooking.status !== 'Upcoming' || receiverBooking.status !== 'Upcoming') {
      return next(new AppError('Both bookings must be upcoming', 400));
    }

    const existing = await SwapRequest.findOne({
      requesterBooking: requesterBookingId,
      receiverBooking: receiverBookingId,
      status: 'Pending'
    });

    if (existing) {
      return next(new AppError('A swap request is already pending for these bookings', 400));
    }

    const swapReq = await SwapRequest.create({
      requester: userId,
      receiver: receiverBooking.createdBy,
      requesterBooking: requesterBookingId,
      receiverBooking: receiverBookingId,
      date: requesterBooking.date,
      status: 'Pending'
    });

    await Notification.create({
      userId: receiverBooking.createdBy,
      type: 'Meeting',
      title: '🔄 Room Swap Request',
      message: `You have received a room swap request for your meeting "${receiverBooking.title}".`
    });

    res.status(201).json({ success: true, data: swapReq });
  } catch (error) {
    next(error);
  }
};

// 13. Accept Swap Request
export const acceptSwapRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const swapReq = await SwapRequest.findById(req.params.id);
    if (!swapReq) return next(new AppError('Swap request not found', 404));

    if (swapReq.status !== 'Pending') {
      return next(new AppError('Swap request is not pending', 400));
    }

    const userId = req.user.id;
    if (swapReq.receiver.toString() !== userId) {
      return next(new AppError('Not authorized to accept this request', 403));
    }

    const reqBooking = await RoomBooking.findById(swapReq.requesterBooking).populate('roomId');
    const recBooking = await RoomBooking.findById(swapReq.receiverBooking).populate('roomId');

    if (!reqBooking || !recBooking || reqBooking.status !== 'Upcoming' || recBooking.status !== 'Upcoming') {
      swapReq.status = 'Cancelled';
      await swapReq.save();
      return next(new AppError('One or both bookings are no longer active/upcoming. Request cancelled.', 400));
    }

    const reqRoom = reqBooking.roomId as any;
    const recRoom = recBooking.roomId as any;

    const reqAttendees = (reqBooking.participants?.length || 0) + 1;
    const recAttendees = (recBooking.participants?.length || 0) + 1;

    if (recRoom.capacity < reqAttendees || reqRoom.capacity < recAttendees) {
      return next(new AppError('Room capacity is no longer sufficient for the swap', 400));
    }

    const tempRoomId = reqBooking.roomId;
    reqBooking.roomId = recBooking.roomId;
    recBooking.roomId = tempRoomId;

    await reqBooking.save();
    await recBooking.save();

    swapReq.status = 'Accepted';
    await swapReq.save();

    await Notification.create({
      userId: swapReq.requester,
      type: 'Meeting',
      title: '✅ Room Swap Accepted',
      message: `Your room swap request for "${reqBooking.title}" was accepted.`
    });

    res.status(200).json({ success: true, message: 'Room swap completed successfully.', data: swapReq });
  } catch (error) {
    next(error);
  }
};

// 14. Reject Swap Request
export const rejectSwapRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const swapReq = await SwapRequest.findById(req.params.id);
    if (!swapReq) return next(new AppError('Swap request not found', 404));

    const userId = req.user.id;
    if (swapReq.receiver.toString() !== userId) {
      return next(new AppError('Not authorized', 403));
    }

    if (swapReq.status !== 'Pending') {
      return next(new AppError('Swap request is not pending', 400));
    }

    swapReq.status = 'Rejected';
    await swapReq.save();

    await Notification.create({
      userId: swapReq.requester,
      type: 'Meeting',
      title: '❌ Room Swap Rejected',
      message: `Your room swap request was rejected.`
    });

    res.status(200).json({ success: true, message: 'Swap request rejected', data: swapReq });
  } catch (error) {
    next(error);
  }
};

// 15. Cancel Swap Request
export const cancelSwapRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const swapReq = await SwapRequest.findById(req.params.id);
    if (!swapReq) return next(new AppError('Swap request not found', 404));

    const userId = req.user.id;
    if (swapReq.requester.toString() !== userId) {
      return next(new AppError('Not authorized', 403));
    }

    if (swapReq.status !== 'Pending') {
      return next(new AppError('Swap request is not pending', 400));
    }

    swapReq.status = 'Cancelled';
    await swapReq.save();

    res.status(200).json({ success: true, message: 'Swap request cancelled', data: swapReq });
  } catch (error) {
    next(error);
  }
};

