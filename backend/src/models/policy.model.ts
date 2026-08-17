import mongoose, { Document, Schema } from 'mongoose';

export interface IPolicy extends Document {
  title: string;
  category: string;
  description?: string;
  content: string;
  status: 'Active' | 'Inactive';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
  {
    title: {
      type: String,
      required: [true, 'Policy title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Policy category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Policy content is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster search
policySchema.index({ title: 'text', category: 'text', description: 'text', content: 'text' });
policySchema.index({ category: 1 });
policySchema.index({ status: 1 });

export const Policy = mongoose.model<IPolicy>('Policy', policySchema);
