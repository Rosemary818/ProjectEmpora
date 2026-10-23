/**
 * Utility to calculate dynamic meeting booking status based on current date & time.
 * 
 * Rules:
 * - Cancelled: Keep Cancelled status unchanged.
 * - Upcoming: Meeting has not started yet (current time < startDateTime).
 * - Ongoing: Current date and time are between the meeting start and end times (startDateTime <= current time < endDateTime).
 * - Completed: Meeting end date and time have passed (current time >= endDateTime).
 */

export interface BookingDateDetails {
  date: Date | string;
  startTime: string;
  endTime: string;
  status?: string;
}

export type BookingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export const calculateBookingStatus = (
  booking: BookingDateDetails,
  currentDate: Date = new Date()
): BookingStatus => {
  // Preserve existing Cancelled status unchanged
  if (booking.status === 'Cancelled') {
    return 'Cancelled';
  }

  if (!booking.date || !booking.startTime || !booking.endTime) {
    return (booking.status as BookingStatus) || 'Upcoming';
  }

  let year: number;
  let month: number;
  let day: number;

  if (typeof booking.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
    const [y, m, d] = booking.date.split('-').map(Number);
    year = y;
    month = m - 1;
    day = d;
  } else {
    const d = new Date(booking.date);
    if (isNaN(d.getTime())) {
      return (booking.status as BookingStatus) || 'Upcoming';
    }
    year = d.getFullYear();
    month = d.getMonth();
    day = d.getDate();
  }

  const [startH = 0, startM = 0] = (booking.startTime || '00:00').split(':').map(Number);
  const [endH = 0, endM = 0] = (booking.endTime || '00:00').split(':').map(Number);

  const startDateTime = new Date(year, month, day, startH, startM, 0, 0);
  const endDateTime = new Date(year, month, day, endH, endM, 0, 0);

  // Handle meetings spanning past midnight
  if (endDateTime < startDateTime) {
    endDateTime.setDate(endDateTime.getDate() + 1);
  }

  const now = currentDate.getTime();
  const start = startDateTime.getTime();
  const end = endDateTime.getTime();

  if (now < start) {
    return 'Upcoming';
  } else if (now >= end) {
    return 'Completed';
  } else {
    return 'Ongoing';
  }
};
