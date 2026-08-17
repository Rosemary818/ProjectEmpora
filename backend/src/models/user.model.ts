import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'SuperAdmin' | 'HRAdmin' | 'Manager' | 'Employee' | 'Candidate' | 'ServiceExecutive';
  profileImage?: string;
  jobTitle?: string;
  department?: string;
  departmentId?: mongoose.Types.ObjectId;
  designationId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  employeeCode?: string;
  dateOfJoining?: Date;
  dateOfBirth?: Date;
  provider: 'local' | 'google';
  googleId?: string;
  isVerified: boolean;
  status: string;
  mustChangePassword?: boolean;
  wellbeingStatus?: string;
  wellbeingLastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
  skills?: {
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  }[];
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
      enum: ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee', 'Candidate', 'ServiceExecutive'],
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
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    wellbeingStatus: {
      type: String,
      enum: ['Good', 'Okay', 'Stressed', 'Overloaded'],
    },
    wellbeingLastUpdated: {
      type: Date,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    designationId: {
      type: Schema.Types.ObjectId,
      ref: 'Designation',
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    dateOfBirth: {
      type: Date,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    skills: [
      {
        name: { type: String, required: true, trim: true },
        proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true }
      }
    ]
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
    else if (this.role === 'ServiceExecutive') prefix = 'SE';

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
