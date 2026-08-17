import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceRequest extends Document {
  requestId: string;
  employeeId: mongoose.Types.ObjectId;
  category: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  serviceExecutiveReply?: string;
  repliedBy?: mongoose.Types.ObjectId;
  repliedAt?: Date;
  employeeReply?: string;
  employeeRepliedAt?: Date;
  dueDate?: Date;
  overdueNotified?: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    requestId: {
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
        'Hardware',
        'Software',
        'Access & Account',
        'ID Card',
        'Office Facilities',
        'Other'
      ],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    serviceExecutiveReply: {
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
    dueDate: {
      type: Date,
    },
    overdueNotified: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

serviceRequestSchema.pre('save', async function () {
  if (this.isNew && !this.requestId) {
    const lastRequest = await mongoose
      .model<IServiceRequest>('ServiceRequest')
      .findOne()
      .sort({ createdAt: -1 });

    let nextNum = 1;
    if (lastRequest && lastRequest.requestId) {
      const numPart = lastRequest.requestId.replace('SRQ-', '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      }
    }

    this.requestId = `SRQ-${nextNum.toString().padStart(3, '0')}`;
  }

  // Set dueDate based on priority if not already set
  if (this.isNew || !this.dueDate) {
    const baseDate = this.createdAt ? new Date(this.createdAt) : new Date();
    const dueDate = new Date(baseDate);
    
    if (this.priority === 'Low') dueDate.setDate(dueDate.getDate() + 3);
    else if (this.priority === 'Medium') dueDate.setDate(dueDate.getDate() + 2);
    else if (this.priority === 'High') dueDate.setDate(dueDate.getDate() + 1);
    else if (this.priority === 'Urgent') dueDate.setHours(dueDate.getHours() + 8); // Same day roughly
    
    this.dueDate = dueDate;
  }
});

export const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);
