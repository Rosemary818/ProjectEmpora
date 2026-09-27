import mongoose, { Document, Schema } from 'mongoose';

export interface IInternalApplication extends Document {
  employeeId: mongoose.Types.ObjectId;
  opportunityId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  currentDepartmentId: mongoose.Types.ObjectId;
  currentDesignationId: mongoose.Types.ObjectId;
  targetDepartmentId?: mongoose.Types.ObjectId;
  targetDesignationId?: mongoose.Types.ObjectId;
  reason: string;
  relevantSkills: string;
  additionalComments?: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected' | 'Withdrawn' | 'Transfer Completed';
  managerRecommendation?: 'Pending' | 'Recommended' | 'Not Recommended' | 'Not Required';
  managerRemarks?: string;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  interviewId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const internalApplicationSchema = new Schema<IInternalApplication>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'InternalOpportunity',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    currentDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    currentDesignationId: {
      type: Schema.Types.ObjectId,
      ref: 'Designation',
      required: true,
    },
    targetDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    targetDesignationId: {
      type: Schema.Types.ObjectId,
      ref: 'Designation',
    },
    reason: {
      type: String,
      required: true,
    },
    relevantSkills: {
      type: String,
      required: true,
    },
    additionalComments: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn', 'Transfer Completed'],
      default: 'Applied',
    },
    managerRecommendation: {
      type: String,
      enum: ['Pending', 'Recommended', 'Not Recommended', 'Not Required'],
      default: 'Pending',
    },
    managerRemarks: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
    },
  },
  {
    timestamps: true,
  }
);

export const InternalApplication = mongoose.model<IInternalApplication>('InternalApplication', internalApplicationSchema);
