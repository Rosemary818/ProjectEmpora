import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  complaintId: string;
  employeeId: mongoose.Types.ObjectId;
  category: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Solved';
  hrReply?: string;
  repliedBy?: mongoose.Types.ObjectId;
  repliedAt?: Date;
  employeeReply?: string;
  employeeRepliedAt?: Date;
  solvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    complaintId: {
      type: String,
      unique: true,
      sparse: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Attendance',
        'Leave',
        'Salary & Payslip',
        'Documents',
        'Assets',
        'Employee Profile',
        'IT Support',
        'Workplace',
        'Other'
      ],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Solved'],
      default: 'Open',
    },
    hrReply: {
      type: String,
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    repliedAt: {
      type: Date,
    },
    employeeReply: {
      type: String,
    },
    employeeRepliedAt: {
      type: Date,
    },
    solvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.pre('save', async function () {
  if (this.isNew && !this.complaintId) {
    const lastComplaint = await mongoose
      .model<IComplaint>('Complaint')
      .findOne()
      .sort({ createdAt: -1 });

    let nextNum = 1;
    if (lastComplaint && lastComplaint.complaintId) {
      const numPart = lastComplaint.complaintId.replace('CMP-', '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      }
    }

    this.complaintId = `CMP-${nextNum.toString().padStart(3, '0')}`;
  }
});

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
