import mongoose, { Document, Schema } from 'mongoose';

export interface IWFHRequest extends Document {
  employee: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  managerComment?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const wfhRequestSchema = new Schema<IWFHRequest>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    managerComment: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const WFHRequest = mongoose.model<IWFHRequest>('WFHRequest', wfhRequestSchema);
