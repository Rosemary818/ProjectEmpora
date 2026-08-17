import mongoose, { Document, Schema } from 'mongoose';

export interface IExitRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  resignationDate: Date;
  proposedLastWorkingDate: Date;
  approvedLastWorkingDate?: Date;
  noticePeriodDays?: number;
  reason: string;
  comments?: string;
  status: 'Submitted' | 'Manager Review' | 'HR Review' | 'Notice Period' | 'Clearance Pending' | 'Exit Interview' | 'Completed' | 'Rejected' | 'Cancelled';
  managerReview?: {
    status: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    comments?: string;
  };
  hrReview?: {
    status: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    comments?: string;
  };
  clearance?: {
    assetClearance: 'Pending' | 'Completed';
    salaryClearance: 'Pending' | 'Completed';
    leaveClearance: 'Pending' | 'Completed';
    documentClearance: 'Pending' | 'Completed';
    managerClearance: 'Pending' | 'Completed';
  };
  exitInterview?: {
    scheduledDate?: Date;
    scheduledTime?: string;
    interviewerId?: mongoose.Types.ObjectId;
    status: 'Pending' | 'Completed';
    feedback?: string;
    comments?: string;
  };
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const exitRequestSchema = new Schema<IExitRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    resignationDate: {
      type: Date,
      required: true,
    },
    proposedLastWorkingDate: {
      type: Date,
      required: true,
    },
    approvedLastWorkingDate: {
      type: Date,
    },
    noticePeriodDays: {
      type: Number,
    },
    reason: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Manager Review',
        'HR Review',
        'Notice Period',
        'Clearance Pending',
        'Exit Interview',
        'Completed',
        'Rejected',
        'Cancelled'
      ],
      default: 'Submitted',
    },
    managerReview: {
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: {
        type: Date,
      },
      comments: {
        type: String,
      },
    },
    hrReview: {
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: {
        type: Date,
      },
      comments: {
        type: String,
      },
    },
    clearance: {
      assetClearance: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
      },
      salaryClearance: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
      },
      leaveClearance: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
      },
      documentClearance: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
      },
      managerClearance: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
      },
    },
    exitInterview: {
      scheduledDate: {
        type: Date,
      },
      scheduledTime: {
        type: String,
      },
      interviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
      },
      feedback: {
        type: String,
      },
      comments: {
        type: String,
      },
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const ExitRequest = mongoose.model<IExitRequest>('ExitRequest', exitRequestSchema);
