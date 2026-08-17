import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetAssignmentHistory extends Document {
  assetId: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId;
  action: 'ASSIGNED' | 'RETURNED' | 'TRANSFERRED' | 'MAINTENANCE' | 'RETIRED';
  assignedDate?: Date;
  returnedDate?: Date;
  conditionAtAssignment?: string;
  conditionAtReturn?: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetAssignmentHistorySchema = new Schema<IAssetAssignmentHistory>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      enum: ['ASSIGNED', 'RETURNED', 'TRANSFERRED', 'MAINTENANCE', 'RETIRED'],
      required: true,
    },
    assignedDate: {
      type: Date,
    },
    returnedDate: {
      type: Date,
    },
    conditionAtAssignment: {
      type: String,
    },
    conditionAtReturn: {
      type: String,
    },
    notes: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AssetAssignmentHistory = mongoose.model<IAssetAssignmentHistory>('AssetAssignmentHistory', assetAssignmentHistorySchema);
