import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  shiftStart: string;
  shiftEnd: string;
  checkIn: Date;
  checkOut?: Date;
  workingHours?: number;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  isLate: boolean;
  overtimeHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    shiftStart: {
      type: String,
      default: '09:00 AM',
    },
    shiftEnd: {
      type: String,
      default: '06:00 PM',
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    workingHours: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'On Leave'],
      default: 'Present',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// Ensure an employee can only have one attendance record per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
