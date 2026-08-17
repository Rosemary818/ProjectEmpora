import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  assetName: string;
  assetId: string;
  category: string;
  brand?: string;
  deviceModel?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  condition: 'New' | 'Good' | 'Fair' | 'Damaged';
  status: 'Available' | 'Assigned' | 'Under Maintenance' | 'Retired';
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    assetName: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    assetId: {
      type: String,
      required: [true, 'Asset ID is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    deviceModel: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    warrantyExpiry: {
      type: Date,
    },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Damaged'],
      default: 'Good',
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'Under Maintenance', 'Retired'],
      default: 'Available',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
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

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
