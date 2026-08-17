import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);

export interface IEmployeeSkill extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt: Date;
  updatedAt: Date;
}

const employeeSkillSchema = new Schema<IEmployeeSkill>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent an employee from having the same skill multiple times
employeeSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

export const EmployeeSkill = mongoose.model<IEmployeeSkill>('EmployeeSkill', employeeSkillSchema);
