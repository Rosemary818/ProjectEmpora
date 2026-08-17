import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  departmentId: mongoose.Types.ObjectId;
  employmentType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  experienceRequired: string;
  vacancies: number;
  location: string;
  salaryRange?: string;
  requiredSkills: string[];
  description: string;
  responsibilities: string;
  qualifications: string;
  deadline: Date;
  status: 'Draft' | 'Published' | 'Closed';
  totalApplications: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      required: true,
    },
    experienceRequired: {
      type: String,
      required: true,
    },
    vacancies: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      required: true,
    },
    salaryRange: {
      type: String,
    },
    requiredSkills: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: String,
      required: true,
    },
    qualifications: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Closed'],
      default: 'Draft',
    },
    totalApplications: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model<IJob>('Job', jobSchema);
