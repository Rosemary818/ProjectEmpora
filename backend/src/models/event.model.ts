import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  targetAudience: 'All Employees' | 'Employees' | 'Managers' | 'HR Admins' | 'All Internal Users' | 'Specific Department';
  targetDepartment?: string;
  organizerId: mongoose.Types.ObjectId;
  imageUrl?: string;
  suggestedTalents?: string[];
  maxParticipants?: number;
  registrationDeadline?: Date;
  updatedBy?: mongoose.Types.ObjectId;
  hasInvitedParticipants: boolean;
  status: 'Upcoming' | 'Today' | 'Completed' | 'Postponed' | 'Cancelled';
  postponementHistory?: {
    previousDate: Date;
    reason?: string;
    postponedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Company Event', 'Meeting', 'Training', 'Workshop', 'Holiday', 'Birthday', 'Work Anniversary', 'Other'],
      default: 'Company Event',
    },
    eventDate: {
      type: Date,
      required: [true, 'Event Date is required'],
    },
    startTime: {
      type: String, // Stored as "HH:mm"
    },
    endTime: {
      type: String, // Stored as "HH:mm"
    },
    location: {
      type: String,
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      enum: ['All Employees', 'Employees', 'Managers', 'HR Admins', 'All Internal Users', 'Specific Department'],
      default: 'All Internal Users',
    },
    targetDepartment: {
      type: String,
      trim: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
    },
    suggestedTalents: [{
      type: String,
      trim: true,
    }],
    maxParticipants: {
      type: Number,
    },
    registrationDeadline: {
      type: Date,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    hasInvitedParticipants: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['Upcoming', 'Today', 'Completed', 'Postponed', 'Cancelled'],
      default: 'Upcoming',
    },
    postponementHistory: [
      {
        previousDate: { type: Date, required: true },
        reason: { type: String },
        postponedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);
