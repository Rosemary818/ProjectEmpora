import mongoose, { Document, Schema } from 'mongoose';

export interface ITravelRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  requesterRole: string;
  managerId?: mongoose.Types.ObjectId;
  approverId?: mongoose.Types.ObjectId;
  fromLocation: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  travelType: string;
  estimatedCost: number;
  notes?: string;
  status: 'Pending Manager Approval' | 'Pending HR Approval' | 'Manager Approved' | 'HR Approved' | 'Manager Rejected' | 'HR Rejected' | 'Cancelled' | 'Completed';
  rejectionReason?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const travelRequestSchema = new Schema<ITravelRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterRole: {
      type: String,
      required: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    fromLocation: {
      type: String,
      required: [true, 'From location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    travelType: {
      type: String,
      required: true,
      enum: ['Client Meeting', 'Business Conference', 'Training', 'Company Event', 'Other Business Purpose'],
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending Manager Approval', 'Pending HR Approval', 'Manager Approved', 'HR Approved', 'Manager Rejected', 'HR Rejected', 'Cancelled', 'Completed'],
      required: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const TravelRequest = mongoose.model<ITravelRequest>('TravelRequest', travelRequestSchema);
