import cron from 'node-cron';
import { User } from '../models/user.model';
import { Attendance } from '../models/attendance.model';
import { AttendanceService } from '../services/attendance.service';

export const initAttendanceCronJobs = () => {
  // Run every day at 23:55 (11:55 PM)
  cron.schedule('55 23 * * *', async () => {
    console.log('Running daily attendance check...');
    try {
      const today = AttendanceService.getMidnightDate(new Date());

      // 1. Get all employees
      const employees = await User.find({ role: 'Employee', status: 'Active' });
      
      for (const emp of employees) {
        // 2. Check if they have an attendance record for today
        const existingRecord = await Attendance.findOne({
          employee: emp._id,
          date: today
        });

        if (!existingRecord) {
          // 3. Check if they are on leave
          const onLeave = await AttendanceService.isOnLeave(emp._id, today);
          
          const status = onLeave ? 'On Leave' : 'Absent';
          
          await Attendance.create({
            employee: emp._id,
            date: today,
            status,
            isLate: false
          });
          
          console.log(`Created auto-attendance record for ${emp.email} - Status: ${status}`);
        }
      }
      
      console.log('Daily attendance check completed.');
    } catch (error) {
      console.error('Error during daily attendance cron job:', error);
    }
  });
};
