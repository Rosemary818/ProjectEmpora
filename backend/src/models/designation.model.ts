import mongoose, { Document, Schema } from 'mongoose';

export interface IDesignation extends Document {
  designationName: string;
  designationCode: string;
  departmentId: mongoose.Types.ObjectId;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const designationSchema = new Schema<IDesignation>(
  {
    designationName: {
      type: String,
      required: [true, 'Designation name is required'],
      trim: true,
    },
    designationCode: {
      type: String,
      unique: true,
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate designation names within the same department
designationSchema.index({ designationName: 1, departmentId: 1 }, { unique: true });

designationSchema.pre('save', async function () {
  if (this.isNew && (!this.designationCode || this.designationCode.trim() === '')) {
    // Generate a unique designation code if not provided
    const namePrefix = this.designationName.substring(0, 3).toUpperCase();
    
    // Find highest code starting with this prefix
    const lastDesig = await mongoose.model<IDesignation>('Designation')
      .findOne({ designationCode: new RegExp(`^${namePrefix}`) })
      .sort({ designationCode: -1 });

    let nextNum = 1;
    if (lastDesig && lastDesig.designationCode) {
      const numPart = lastDesig.designationCode.replace(namePrefix, '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      }
    }

    this.designationCode = `${namePrefix}${nextNum.toString().padStart(3, '0')}`;
  }
});

export const Designation = mongoose.model<IDesignation>('Designation', designationSchema);
