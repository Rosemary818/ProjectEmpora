import mongoose, { Document, Schema } from 'mongoose';

export interface IPayslip extends Document {
  employeeId: mongoose.Types.ObjectId;
  salaryId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  allowances: {
    hra: number;
    travel: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    pf: number;
    insurance: number;
    other: number;
  };
  grossSalary: number;
  netSalary: number;
  paymentStatus: 'Pending' | 'Paid';
  paymentDate?: Date;
  remarks?: string;
  generatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const payslipSchema = new Schema<IPayslip>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
    salaryId: {
      type: Schema.Types.ObjectId,
      ref: 'Salary',
      required: [true, 'Salary ID is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      hra: { type: Number, default: 0, min: 0 },
      travel: { type: Number, default: 0, min: 0 },
      medical: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0, min: 0 },
      pf: { type: Number, default: 0, min: 0 },
      insurance: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate payslips for same employee, month, year
payslipSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export const Payslip = mongoose.model<IPayslip>('Payslip', payslipSchema);
