import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveRequest extends Document {
  userId: mongoose.Types.ObjectId;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave' | 'Marriage Leave' | 'Bereavement Leave' | 'Work From Home' | 'Compensatory Off' | 'Other Leave';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  documentUrl?: string;
  relationship?: 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Spouse' | 'Son' | 'Daughter';
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Marriage Leave', 'Bereavement Leave', 'Work From Home', 'Compensatory Off', 'Other Leave'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: [0.5, 'Number of days must be at least 0.5'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
    },
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Son', 'Daughter'],
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
