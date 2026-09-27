import mongoose, { Document, Schema } from 'mongoose';

export interface ISwapRequest extends Document {
  requester: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  requesterBooking: mongoose.Types.ObjectId;
  receiverBooking: mongoose.Types.ObjectId;
  date: Date;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const swapRequestSchema = new Schema<ISwapRequest>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterBooking: {
      type: Schema.Types.ObjectId,
      ref: 'RoomBooking',
      required: true,
    },
    receiverBooking: {
      type: Schema.Types.ObjectId,
      ref: 'RoomBooking',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const SwapRequest = mongoose.model<ISwapRequest>('SwapRequest', swapRequestSchema);
