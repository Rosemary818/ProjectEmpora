import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainingEnrollment extends Document {
  employeeId: mongoose.Types.ObjectId;
  trainingId: mongoose.Types.ObjectId;
  status: 'Enrolled' | 'In Progress' | 'Completed';
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const trainingEnrollmentSchema = new Schema<ITrainingEnrollment>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    trainingId: {
      type: Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Enrolled', 'In Progress', 'Completed'],
      default: 'Enrolled',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot enroll in the same training multiple times concurrently
trainingEnrollmentSchema.index({ employeeId: 1, trainingId: 1 }, { unique: true });

export const TrainingEnrollment = mongoose.model<ITrainingEnrollment>('TrainingEnrollment', trainingEnrollmentSchema);
