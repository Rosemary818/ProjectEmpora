import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: Date;
  status: 'To Do' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked';
  progressPercentage: number;
  startedAt?: Date;
  completedAt?: Date;
  managerComment?: string;
  blockedReason?: string;
  history?: {
    action: string;
    date: Date;
    by: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked'],
      default: 'To Do',
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    managerComment: {
      type: String,
    },
    blockedReason: {
      type: String,
    },
    history: [
      {
        action: String,
        date: Date,
        by: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
