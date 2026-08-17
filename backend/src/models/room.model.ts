import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  type: 'Team / Conference' | 'Client' | 'General';
  capacity: number;
  location?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Team / Conference', 'Client', 'General'],
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    }
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model<IRoom>('Room', roomSchema);
