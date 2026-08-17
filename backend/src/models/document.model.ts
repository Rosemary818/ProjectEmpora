import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  name: string;
  description?: string;
  category: string;
  fileUrl?: string; // The path on the server where the file is stored
  fileName?: string; // Original filename
  fileType?: string; // Mime type
  fileSize?: number; // Size in bytes
  certificateMetadata?: {
    certificateName: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateUrl: string;
    credentialId?: string;
  };
  uploadedBy: mongoose.Types.ObjectId;
  ownerId?: mongoose.Types.ObjectId; // null/undefined for company documents
  visibility: 'Private' | 'Company' | 'Team';
  status: 'Active' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Document category is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    certificateMetadata: {
      certificateName: { type: String },
      issuingOrganization: { type: String },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      certificateUrl: { type: String },
      credentialId: { type: String },
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    visibility: {
      type: String,
      enum: ['Private', 'Company', 'Team'],
      default: 'Private',
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
