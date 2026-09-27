export const calculateProjectStatus = (startDate: Date | string, endDate: Date | string, currentStatus?: string) => {
  if (currentStatus === 'On Hold') return 'On Hold';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (now < start) {
    return 'Upcoming';
  } else if (now >= start && now <= end) {
    return 'Active';
  } else {
    return 'Completed';
  }
};
