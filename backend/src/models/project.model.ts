import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'Upcoming' | 'Active' | 'Completed' | 'On Hold';
  managerId: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  requiredSkills?: string[];
  experienceRequired?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed', 'On Hold'],
      default: 'Upcoming',
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    requiredSkills: [
      {
        type: String,
      }
    ],
    experienceRequired: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
