import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  requestId: mongoose.Types.ObjectId;
  requestType: 'Complaint' | 'ServiceRequest';
  requesterId: mongoose.Types.ObjectId;
  serviceExecutiveId?: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'requestType',
    },
    requestType: {
      type: String,
      required: true,
      enum: ['Complaint', 'ServiceRequest'],
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceExecutiveId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate feedback
feedbackSchema.index({ requestId: 1, requestType: 1 }, { unique: true });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
