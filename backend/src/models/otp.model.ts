import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string; // Stored hashed
  purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD';
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['VERIFY_EMAIL', 'RESET_PASSWORD'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically delete document when this date is reached
    },
  },
  {
    timestamps: true,
  }
);

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
