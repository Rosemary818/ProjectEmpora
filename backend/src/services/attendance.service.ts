import mongoose from 'mongoose';
import { LeaveRequest } from '../models/leave.model';

export class AttendanceService {
  /**
   * Helper to truncate date to midnight for accurate day comparison
   */
  static getMidnightDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Check if employee is on approved leave for the given date.
   * Returns true if on leave, false otherwise.
   */
  static async isOnLeave(employeeId: string | mongoose.Types.ObjectId, date: Date): Promise<boolean> {
    const midnight = this.getMidnightDate(date);
    const leave = await LeaveRequest.findOne({
      userId: employeeId,
      status: 'Approved',
      startDate: { $lte: midnight },
      endDate: { $gte: midnight }
    });
    return !!leave;
  }

  /**
   * Validate that employee can check in (not on leave)
   */
  static async validateCanCheckIn(employeeId: string | mongoose.Types.ObjectId, date: Date): Promise<void> {
    const onLeave = await this.isOnLeave(employeeId, date);
    if (onLeave) {
      throw new Error('Cannot check in on an approved leave day.');
    }
  }

  /**
   * Calculate status based on check-in time and shift start (09:00 AM + 15m grace)
   */
  static calculateStatus(checkIn: Date): { status: 'Present' | 'Late'; isLate: boolean } {
    const hours = checkIn.getHours();
    const minutes = checkIn.getMinutes();
    
    // Check-in after 09:15 AM
    if (hours > 9 || (hours === 9 && minutes > 15)) {
      return { status: 'Late', isLate: true };
    }
    
    return { status: 'Present', isLate: false };
  }

  /**
   * Calculate working hours and overtime
   */
  static calculateHours(checkIn: Date, checkOut: Date): { workingHours: number; overtimeHours: number } {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    const workingHours = parseFloat(diffHours.toFixed(2));
    const overtimeHours = parseFloat(Math.max(0, workingHours - 8).toFixed(2));
    
    return { workingHours, overtimeHours };
  }
}
