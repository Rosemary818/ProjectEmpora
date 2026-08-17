import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  targetDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  managerFeedback?: string;
  overallRating?: number;
  technicalSkillsRating?: number;
  communicationRating?: number;
  teamworkRating?: number;
  productivityRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  reviewPeriod?: string;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Goal description is required'],
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Overdue'],
      default: 'Not Started',
    },
    managerFeedback: {
      type: String,
      trim: true,
    },
    overallRating: { type: Number, min: 1, max: 5 },
    technicalSkillsRating: { type: Number, min: 1, max: 5 },
    communicationRating: { type: Number, min: 1, max: 5 },
    teamworkRating: { type: Number, min: 1, max: 5 },
    productivityRating: { type: Number, min: 1, max: 5 },
    strengths: { type: String, trim: true },
    areasForImprovement: { type: String, trim: true },
    reviewPeriod: { type: String, trim: true },
    reviewDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-update status based on progress
goalSchema.pre('save', function () {
  if (this.isModified('progress')) {
    if (this.progress === 100) {
      this.status = 'Completed';
    } else if (this.progress > 0 && this.status === 'Not Started') {
      this.status = 'In Progress';
    } else if (this.progress === 0 && this.status === 'In Progress') {
      this.status = 'Not Started';
    }
  }
});

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
