import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  summary: string;
  content: string;
  category: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetAudience: 'All Employees' | 'Employees' | 'Managers' | 'HR Admins' | 'Specific Department' | 'Specific Project Team';
  targetDepartment?: string;
  targetProjectId?: mongoose.Types.ObjectId;
  publishedBy: mongoose.Types.ObjectId;
  status: 'Draft' | 'Published' | 'Archived';
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['General', 'HR', 'Policy', 'Leave', 'Attendance', 'Payroll', 'Events', 'Important', 'Other'],
      default: 'General',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['Normal', 'Important', 'Urgent'],
      default: 'Normal',
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      enum: ['All Employees', 'Employees', 'Managers', 'HR Admins', 'Specific Department', 'Specific Project Team'],
    },
    targetDepartment: {
      type: String,
      trim: true,
    },
    targetProjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
