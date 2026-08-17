import mongoose, { Document, Schema } from 'mongoose';

export interface ITraining extends Document {
  title: string;
  description: string;
  category: string;
  trainer: string;
  duration: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  startDate?: Date;
  endDate?: Date;
  status: 'Active' | 'Inactive';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Technical', 'Soft Skills', 'Leadership', 'Compliance', 'Security', 'Communication', 'Other'],
    },
    trainer: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      enum: ['Online', 'Offline', 'Hybrid'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Training = mongoose.model<ITraining>('Training', trainingSchema);
