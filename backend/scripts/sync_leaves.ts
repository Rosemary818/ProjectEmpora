import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Attendance } from '../src/models/attendance.model';
import { LeaveRequest } from '../src/models/leave.model';

const syncLeaves = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Force some Absent records to become On Leave if none exist, so we have demo data
    const existingOnLeaveCount = await Attendance.countDocuments({ status: 'On Leave' });
    if (existingOnLeaveCount === 0) {
      console.log('No "On Leave" records found. Converting some "Absent" records to "On Leave" to fulfill the demo requirements...');
      const absentRecords = await Attendance.find({ status: 'Absent' });
      const convertedUsers = new Set();
      
      for (const record of absentRecords) {
        if (!convertedUsers.has(record.employee.toString())) {
          record.status = 'On Leave';
          await record.save();
          convertedUsers.add(record.employee.toString());
        }
      }
      console.log(`Converted ${convertedUsers.size} 'Absent' records to 'On Leave'.`);
    }

    // 2. Process all 'On Leave' attendance records
    const onLeaveAttendances = await Attendance.find({ status: 'On Leave' }).sort({ employee: 1, date: 1 });
    console.log(`Found ${onLeaveAttendances.length} 'On Leave' attendance records.`);

    let createdRequests = 0;
    let skippedRequests = 0;

    for (const attendance of onLeaveAttendances) {
      const attDate = new Date(attendance.date);
      attDate.setUTCHours(0, 0, 0, 0);

      // Check if a Leave Request already exists for this date and employee
      const existingLeaveReq = await LeaveRequest.findOne({
        userId: attendance.employee,
        startDate: { $lte: attDate },
        endDate: { $gte: attDate }
      });

      if (existingLeaveReq) {
        skippedRequests++;
        continue; // Do not duplicate
      }

      // Create a pending LeaveRequest
      await LeaveRequest.create({
        userId: attendance.employee,
        leaveType: 'Casual Leave',
        startDate: attDate,
        endDate: attDate,
        numberOfDays: 1,
        reason: 'Personal Leave',
        status: 'Pending'
      });
      createdRequests++;
    }

    console.log(`\nFinished processing!`);
    console.log(`Created Leave Requests: ${createdRequests}`);
    console.log(`Skipped (already existed): ${skippedRequests}`);

    process.exit(0);
  } catch (error) {
    console.error('Error syncing leave requests:', error);
    process.exit(1);
  }
};

syncLeaves();
