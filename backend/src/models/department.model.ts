import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  departmentName: string;
  departmentCode: string;
  description: string;
  managerId?: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    departmentCode: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

departmentSchema.pre('save', async function () {
  if (this.isNew && (!this.departmentCode || this.departmentCode.trim() === '')) {
    // Generate a unique department code if not provided
    const namePrefix = this.departmentName.substring(0, 3).toUpperCase();
    
    // Find highest code starting with this prefix
    const lastDept = await mongoose.model<IDepartment>('Department')
      .findOne({ departmentCode: new RegExp(`^${namePrefix}`) })
      .sort({ departmentCode: -1 });

    let nextNum = 1;
    if (lastDept && lastDept.departmentCode) {
      const numPart = lastDept.departmentCode.replace(namePrefix, '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      }
    }

    this.departmentCode = `${namePrefix}${nextNum.toString().padStart(3, '0')}`;
  }
});

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
