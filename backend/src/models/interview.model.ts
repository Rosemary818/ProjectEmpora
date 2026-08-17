import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  applicationModel?: 'JobApplication' | 'InternalApplication';
  applicationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  opportunityId?: mongoose.Types.ObjectId;
  category: 'Job Interview' | 'Internal Mobility';
  round: 'HR Round' | 'Technical Round' | 'Managerial Round' | 'Final HR Round';
  interviewType: 'Online' | 'Offline';
  date: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  interviewer: string;
  interviewerId: mongoose.Types.ObjectId;
  meetingLink?: string;
  venue?: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  cancellationReason?: string;
  feedback?: {
    technicalRating: number;
    communicationRating: number;
    problemSolvingRating: number;
    recommendation: 'Strong Hire' | 'Hire' | 'Consider' | 'Reject';
    comments: string;
    submittedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    applicationModel: {
      type: String,
      enum: ['JobApplication', 'InternalApplication'],
      default: 'JobApplication',
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      refPath: 'applicationModel',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'InternalOpportunity',
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      index: true,
    },
    category: {
      type: String,
      enum: ['Job Interview', 'Internal Mobility'],
      default: 'Job Interview',
    },
    round: {
      type: String,
      enum: ['HR Round', 'Technical Round', 'Managerial Round', 'Final HR Round'],
      required: true,
    },
    interviewType: {
      type: String,
      enum: ['Online', 'Offline'],
      required: true,
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
    interviewer: {
      type: String,
      required: true,
    },
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    meetingLink: {
      type: String,
    },
    venue: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
    cancellationReason: {
      type: String,
    },
    feedback: {
      technicalRating: { type: Number, min: 1, max: 5 },
      communicationRating: { type: Number, min: 1, max: 5 },
      problemSolvingRating: { type: Number, min: 1, max: 5 },
      recommendation: { type: String, enum: ['Strong Hire', 'Hire', 'Consider', 'Reject'] },
      comments: { type: String },
      submittedAt: { type: Date }
    }
  },
  {
    timestamps: true,
  }
);

// Basic validation before saving
interviewSchema.pre('save', function () {
  if (this.interviewType === 'Online' && !this.meetingLink) {
    throw new Error('Meeting Link is required for Online interviews.');
  }
  if (this.interviewType === 'Offline' && !this.venue) {
    throw new Error('Venue is required for Offline interviews.');
  }
});

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
