import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'SuperAdmin' | 'HRAdmin' | 'Manager' | 'Employee' | 'Candidate';
  profileImage?: string;
  jobTitle?: string;
  department?: string;
  employeeCode?: string;
  dateOfJoining?: Date;
  isVerified: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee', 'Candidate'],
      default: 'Employee',
    },
    profileImage: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'Active',
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    employeeCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    dateOfJoining: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (this.isNew && !this.employeeCode) {
    let prefix = 'EMP';
    if (this.role === 'Manager') prefix = 'MGR';
    else if (this.role === 'HRAdmin') prefix = 'HR';
    else if (this.role === 'SuperAdmin') prefix = 'SA';
    else if (this.role === 'Candidate') prefix = 'CAN';

    // Find the user with the highest code for this prefix
    const lastUser = await mongoose.model<IUser>('User')
      .findOne({ employeeCode: new RegExp(`^${prefix}`) })
      .sort({ employeeCode: -1 });

    let nextNum = 1;
    if (lastUser && lastUser.employeeCode) {
      const numPart = lastUser.employeeCode.replace(prefix, '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      }
    }

    this.employeeCode = `${prefix}${nextNum.toString().padStart(3, '0')}`;
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
