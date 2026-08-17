import mongoose, { Document, Schema } from 'mongoose';

export interface IInternalOpportunity extends Document {
  title: string;
  departmentId: mongoose.Types.ObjectId;
  designationId: mongoose.Types.ObjectId;
  employmentType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  vacancies: number;
  experienceRequired: string;
  requiredSkills: string[];
  description: string;
  responsibilities: string;
  qualifications: string;
  deadline: Date;
  status: 'Draft' | 'Published' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const internalOpportunitySchema = new Schema<IInternalOpportunity>(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designationId: {
      type: Schema.Types.ObjectId,
      ref: 'Designation',
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      required: true,
    },
    vacancies: {
      type: Number,
      required: true,
      min: 1,
    },
    experienceRequired: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

export const InternalOpportunity = mongoose.model<IInternalOpportunity>('InternalOpportunity', internalOpportunitySchema);
