import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomBooking extends Document {
  title: string;
  meetingType: 'Team Meeting' | 'Client Meeting' | 'Individual Meeting';
  roomId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  clientName?: string;
  clientContact?: string;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  visitorId?: mongoose.Types.ObjectId;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const roomBookingSchema = new Schema<IRoomBooking>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    meetingType: {
      type: String,
      required: true,
      enum: ['Team Meeting', 'Client Meeting', 'Individual Meeting'],
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    clientName: {
      type: String,
      trim: true,
    },
    clientContact: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    visitorId: {
      type: Schema.Types.ObjectId,
      ref: 'Visitor',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    }
  },
  {
    timestamps: true,
  }
);

export const RoomBooking = mongoose.model<IRoomBooking>('RoomBooking', roomBookingSchema);
