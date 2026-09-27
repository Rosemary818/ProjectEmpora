import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LeaveRequest } from '../src/models/leave.model';
import { User } from '../src/models/user.model';

dotenv.config();

const listLeaves = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const leaves = await LeaveRequest.find().lean();
    
    console.log(`Found ${leaves.length} leave requests.`);
    
    const users = await User.find({ _id: { $in: leaves.map(l => l.userId) } }).lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    leaves.forEach(leave => {
      const u: any = userMap.get(leave.userId.toString()) || {};
      console.log(`[${leave._id}] User: ${u.firstName} ${u.lastName} (${u.email}, Role: ${u.role}) - Type: ${leave.leaveType} - Reason: ${leave.reason}`);
    });

  } catch (error) {
    console.error('Error fetching records:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

listLeaves();
