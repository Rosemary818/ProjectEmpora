import mongoose, { Document, Schema } from 'mongoose';

export interface ISalary extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeRole: 'Employee' | 'Manager';
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
  effectiveFrom: Date;
  paymentFrequency: 'Monthly' | 'Yearly';
  status: 'Active' | 'Inactive';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const salarySchema = new Schema<ISalary>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
    employeeRole: {
      type: String,
      enum: ['Employee', 'Manager'],
      required: [true, 'Employee Role is required'],
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic Salary is required'],
      min: [0, 'Basic Salary cannot be negative'],
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
    effectiveFrom: {
      type: Date,
      required: [true, 'Effective Date is required'],
    },
    paymentFrequency: {
      type: String,
      enum: ['Monthly', 'Yearly'],
      default: 'Monthly',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate gross and net salary before save
salarySchema.pre('validate', function () {
  const allow = this.allowances;
  const ded = this.deductions;
  
  const totalAllowances = (allow.hra || 0) + (allow.travel || 0) + (allow.medical || 0) + (allow.other || 0);
  const totalDeductions = (ded.tax || 0) + (ded.pf || 0) + (ded.insurance || 0) + (ded.other || 0);

  this.grossSalary = this.basicSalary + totalAllowances;
  this.netSalary = this.grossSalary - totalDeductions;
  
  if (this.netSalary < 0) {
    this.invalidate('netSalary', 'Net Salary cannot be negative');
  }
});

export const Salary = mongoose.model<ISalary>('Salary', salarySchema);
