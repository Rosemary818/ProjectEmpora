import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Interview Completed' | 'Selected' | 'Rejected' | 'Offer Sent' | 'Offer Accepted' | 'Converted to Employee' | 'Withdrawn';
  resume: string;
  coverLetter?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  statusHistory: Array<{
    status: string;
    date: Date;
  }>;
  skills?: string[];
  education?: string[];
  projects?: string[];
  certifications?: string[];
  offerLetterUrl?: string;
  appliedAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Rejected', 'Offer Sent', 'Offer Accepted', 'Converted to Employee', 'Withdrawn'],
      default: 'Applied',
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    github: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    skills: [{ type: String }],
    education: [{ type: String }],
    projects: [{ type: String }],
    certifications: [{ type: String }],
    offerLetterUrl: { type: String },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple applications to the same job by the same candidate
jobApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);
