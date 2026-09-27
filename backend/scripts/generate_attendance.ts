import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { User } from '../src/models/user.model';
import { Attendance } from '../src/models/attendance.model';
import { LeaveRequest } from '../src/models/leave.model';

const generateAttendance = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const startDate = new Date('2026-09-01T00:00:00.000Z');
    const endDate = new Date('2026-09-25T00:00:00.000Z');

    // Get all users (Employees and Managers)
    const users = await User.find({ status: 'Active' });
    console.log(`Found ${users.length} active users.`);

    // Helper to generate a random time between min and max (inclusive)
    const randomTime = (date: Date, minHour: number, minMinute: number, maxHour: number, maxMinute: number) => {
      const result = new Date(date);
      const minTotalMinutes = minHour * 60 + minMinute;
      const maxTotalMinutes = maxHour * 60 + maxMinute;
      const randomTotalMinutes = Math.floor(Math.random() * (maxTotalMinutes - minTotalMinutes + 1)) + minTotalMinutes;
      
      const hour = Math.floor(randomTotalMinutes / 60);
      const minute = randomTotalMinutes % 60;
      
      result.setUTCHours(hour, minute, 0, 0);
      return result;
    };

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const user of users) {
      console.log(`Processing user: ${user.firstName} ${user.lastName}`);
      
      // Get approved leaves for this user in the date range
      const approvedLeaves = await LeaveRequest.find({
        userId: user._id,
        status: 'Approved',
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      });

      // Loop through each day
      for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        const dayOfWeek = d.getUTCDay();
        // Skip Weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Normalize date to midnight UTC
        const currentDate = new Date(d);
        currentDate.setUTCHours(0, 0, 0, 0);

        // Check if an attendance record already exists for this user and date
        const existingAttendance = await Attendance.findOne({ employee: user._id, date: currentDate });
        if (existingAttendance) {
          totalSkipped++;
          continue; // Skip if already exists to prevent duplicates or modifying existing data
        }

        // Check if user is on leave on this date
        let isOnLeave = false;
        for (const leave of approvedLeaves) {
          const lStart = new Date(leave.startDate);
          lStart.setUTCHours(0, 0, 0, 0);
          const lEnd = new Date(leave.endDate);
          lEnd.setUTCHours(0, 0, 0, 0);
          
          if (currentDate >= lStart && currentDate <= lEnd) {
            isOnLeave = true;
            break;
          }
        }

        if (isOnLeave) {
          // Create 'On Leave' record
          await Attendance.create({
            employee: user._id,
            date: currentDate,
            status: 'On Leave',
            isLate: false
          });
          totalInserted++;
          continue;
        }

        // Randomly determine status: 85% Present, 10% Late, 5% Absent
        const rand = Math.random();
        let status = 'Present';
        let isLate = false;

        if (rand > 0.95) {
          status = 'Absent';
        } else if (rand > 0.85) {
          status = 'Late';
          isLate = true;
        }

        if (status === 'Absent') {
          await Attendance.create({
            employee: user._id,
            date: currentDate,
            status: 'Absent',
            isLate: false
          });
          totalInserted++;
        } else {
          // Generate Check-In Time
          let checkInHourMin = [8, 50]; // Default Present
          let checkInHourMax = [9, 15]; // Present cutoff is 9:15
          
          if (isLate) {
            checkInHourMin = [9, 16];
            checkInHourMax = [9, 45];
          }

          const checkInTime = randomTime(currentDate, checkInHourMin[0], checkInHourMin[1], checkInHourMax[0], checkInHourMax[1]);
          
          // Generate Check-Out Time (17:15 to 18:00)
          const checkOutTime = randomTime(currentDate, 17, 15, 18, 0);

          const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

          await Attendance.create({
            employee: user._id,
            date: currentDate,
            status: status,
            isLate: isLate,
            checkIn: checkInTime,
            checkOut: checkOutTime,
            workingHours: Number(workingHours.toFixed(2))
          });
          totalInserted++;
        }
      }
    }

    console.log(`\nFinished generating data!`);
    console.log(`Inserted: ${totalInserted} records.`);
    console.log(`Skipped (already existed): ${totalSkipped} records.`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating attendance data:', error);
    process.exit(1);
  }
};

generateAttendance();
