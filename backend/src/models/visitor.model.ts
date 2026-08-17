import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  visitorName: string;
  companyName: string;
  email?: string;
  phone?: string;
  hostUserId: mongoose.Types.ObjectId;
  meetingId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  status: 'Expected' | 'Checked In' | 'Checked Out' | 'Cancelled';
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const visitorSchema = new Schema<IVisitor>(
  {
    visitorName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    hostUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'RoomBooking',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    status: {
      type: String,
      enum: ['Expected', 'Checked In', 'Checked Out', 'Cancelled'],
      default: 'Expected',
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Visitor = mongoose.model<IVisitor>('Visitor', visitorSchema);
