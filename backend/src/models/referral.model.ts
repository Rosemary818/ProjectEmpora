import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  candidateName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  departmentId: mongoose.Types.ObjectId;
  experience: number;
  currentCompany?: string;
  expectedCTC?: string;
  resume: string;
  linkedIn?: string;
  notes?: string;
  referredBy: mongoose.Types.ObjectId;
  status: 'Pending' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Hired' | 'Converted' | 'Rejected';
  convertedToEmployee: boolean;
  employeeId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    candidateName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    expectedCTC: {
      type: String,
      trim: true,
    },
    resume: {
      type: String,
      required: [true, 'Resume file path is required'],
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Hired', 'Converted', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    convertedToEmployee: {
      type: Boolean,
      default: false,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate referrals for the same email and position
referralSchema.index({ email: 1, position: 1 }, { unique: true });

export const Referral = mongoose.model<IReferral>('Referral', referralSchema);
