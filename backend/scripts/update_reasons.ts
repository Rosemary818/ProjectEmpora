import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LeaveRequest } from '../src/models/leave.model';

dotenv.config();

const updateReasons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const result = await LeaveRequest.updateMany(
      { reason: 'Personal reason (Auto-generated from Attendance)' },
      { $set: { reason: 'Personal Leave' } }
    );

    console.log(`Successfully updated ${result.modifiedCount} records.`);

  } catch (error) {
    console.error('Error updating records:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateReasons();
