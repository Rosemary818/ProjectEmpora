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
  candidateId?: string;
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
  benchStatus?: 'On Bench' | 'Allocated' | 'Not Applicable' | 'Allocation Requested';
  benchStartDate?: Date;
  benchEndDate?: Date;
  benchReason?: string;
  requestedProjectId?: mongoose.Types.ObjectId;
  benchHistory?: {
    startDate: Date;
    endDate?: Date;
    reason?: string;
    projectId?: mongoose.Types.ObjectId;
  }[];
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
      validate: [
        {
          validator: function(v: string) {
            if (!v) return true; 
            return /^[6-9]\d{9}$/.test(v);
          },
          message: 'Please enter a valid 10-digit Indian mobile number.'
        },
        {
          validator: function(v: string) {
            if (!v) return true;
            return !/^(.)\1{9}$/.test(v);
          },
          message: 'Please enter a valid mobile number.'
        }
      ]
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
    candidateId: {
      type: String,
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
    benchStatus: {
      type: String,
      enum: ['On Bench', 'Allocated', 'Not Applicable', 'Allocation Requested'],
      default: 'Not Applicable',
    },
    benchStartDate: {
      type: Date,
    },
    benchEndDate: {
      type: Date,
    },
    benchReason: {
      type: String,
    },
    requestedProjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    benchHistory: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        reason: { type: String },
        projectId: { type: Schema.Types.ObjectId, ref: 'Project' }
      }
    ],
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
  if ((this.isNew && !this.employeeCode) || (this.isModified('role') && !this.employeeCode)) {
    let prefix = 'EMP';
    if (this.role === 'Manager') prefix = 'MGR';
    else if (this.role === 'HRAdmin') prefix = 'HR';
    else if (this.role === 'SuperAdmin') prefix = 'SA';
    else if (this.role === 'Candidate') prefix = 'CAN';
    else if (this.role === 'ServiceExecutive') prefix = 'SE';

    // Find all users with this prefix to find the smallest available gap
    const users = await mongoose.model<IUser>('User')
      .find({ employeeCode: new RegExp(`^${prefix}`) }, 'employeeCode')
      .lean();

    const usedNumbers = users
      .map(u => u.employeeCode ? parseInt(u.employeeCode.replace(prefix, ''), 10) : NaN)
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    let nextNum = 1;
    for (const num of usedNumbers) {
      if (num === nextNum) {
        nextNum++;
      } else if (num > nextNum) {
        break; // Found a gap
      }
    }

    this.employeeCode = `${prefix}${nextNum.toString().padStart(3, '0')}`;
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
