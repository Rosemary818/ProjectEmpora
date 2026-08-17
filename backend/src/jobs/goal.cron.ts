import cron from 'node-cron';
import { Goal } from '../models/goal.model';
import { Notification } from '../models/notification.model';

export const initGoalCronJobs = () => {
  // Run every day at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Running daily goal check job...');

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      const next1Day = new Date(now);
      next1Day.setDate(now.getDate() + 1);

      const next7Days = new Date(now);
      next7Days.setDate(now.getDate() + 7);

      const activeGoals = await Goal.find({ status: { $nin: ['Completed'] } });

      for (const goal of activeGoals) {
        const targetDate = new Date(goal.targetDate);
        targetDate.setHours(0, 0, 0, 0);

        // 7 Days reminder
        if (targetDate.getTime() === next7Days.getTime()) {
          await Notification.create({
            userId: goal.assignedTo,
            type: 'Goal',
            title: 'Goal Deadline Approaching',
            message: `Your goal "${goal.title}" is due in 7 days.`,
          });
        }
        
        // 1 Day reminder
        else if (targetDate.getTime() === next1Day.getTime()) {
          await Notification.create({
            userId: goal.assignedTo,
            type: 'Goal',
            title: 'Goal Due Tomorrow',
            message: `Your goal "${goal.title}" is due tomorrow.`,
          });
        }
        
        // Overdue check
        else if (targetDate.getTime() < now.getTime()) {
          if (goal.status !== 'Overdue') {
            goal.status = 'Overdue';
            await goal.save();

            // Notify Employee
            await Notification.create({
              userId: goal.assignedTo,
              type: 'Goal',
              title: 'Goal Overdue',
              message: `Your goal "${goal.title}" is overdue.`,
            });

            // Notify Manager
            await Notification.create({
              userId: goal.assignedBy,
              type: 'Goal',
              title: 'Team Goal Overdue',
              message: `The goal "${goal.title}" assigned to your team member is overdue.`,
            });
          }
        }
      }

      console.log('Daily goal check job completed.');
    } catch (error) {
      console.error('Error in goal cron job:', error);
    }
  });
};
