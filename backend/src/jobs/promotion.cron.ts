import cron from 'node-cron';
import { Promotion } from '../models/promotion.model';
import { User } from '../models/user.model';
import { Designation } from '../models/designation.model';
import { Notification } from '../models/notification.model';

export const initPromotionCronJobs = () => {
  // Run daily at midnight: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily promotion effective date check...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all approved promotions where the effective date has arrived or passed
      const duePromotions = await Promotion.find({
        status: 'Approved',
        effectiveDate: { $lte: today }
      });

      for (const promotion of duePromotions) {
        // 1. Update User Profile
        const designation = await Designation.findById(promotion.proposedDesignationId);
        
        if (designation) {
          await User.findByIdAndUpdate(promotion.employeeId, {
            designationId: promotion.proposedDesignationId,
            jobTitle: designation.designationName
          });
        }

        // 2. Mark Promotion as Effective
        promotion.status = 'Effective';
        await promotion.save();

        // 3. Notify Employee
        await Notification.create({
          userId: promotion.employeeId,
          type: 'Promotion',
          title: 'Promotion Now Effective',
          message: `Your promotion to ${designation?.designationName || 'new role'} is now effective!`
        });
      }

      if (duePromotions.length > 0) {
        console.log(`Successfully made ${duePromotions.length} promotions effective.`);
      }
    } catch (error) {
      console.error('Error in promotion cron job:', error);
    }
  });
};
