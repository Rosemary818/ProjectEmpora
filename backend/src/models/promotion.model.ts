import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  employeeId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  currentDesignationId: mongoose.Types.ObjectId;
  proposedDesignationId: mongoose.Types.ObjectId;
  reason: string;
  managerRemarks?: string;
  hrRemarks?: string;
  effectiveDate?: Date;
  status: 'Draft' | 'Pending HR Review' | 'Approved' | 'Rejected' | 'Effective' | 'Cancelled';
  proposedBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required']
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required']
    },
    currentDesignationId: {
      type: Schema.Types.ObjectId,
      ref: 'Designation',
      required: [true, 'Current Designation is required']
    },
    proposedDesignationId: {
      type: Schema.Types.ObjectId,
      ref: 'Designation',
      required: [true, 'Proposed Designation is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason for promotion is required'],
      trim: true
    },
    managerRemarks: {
      type: String,
      trim: true
    },
    hrRemarks: {
      type: String,
      trim: true
    },
    effectiveDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending HR Review', 'Approved', 'Rejected', 'Effective', 'Cancelled'],
      default: 'Pending HR Review'
    },
    proposedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Proposer is required']
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    },
    rejectedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
