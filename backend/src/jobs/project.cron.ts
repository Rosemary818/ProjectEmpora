import cron from 'node-cron';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { calculateProjectStatus } from '../utils/project.helper';

export const initProjectCronJobs = () => {
  // Run daily at midnight to update project statuses
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily project status update job...');
    try {
      const projects = await Project.find({ status: { $ne: 'Completed' } });
      
      let updatedCount = 0;

      for (const project of projects) {
        if (project.status === 'On Hold') continue;

        const newStatus = calculateProjectStatus(project.startDate, project.endDate, project.status);
        
        if (newStatus !== project.status) {
          const previousStatus = project.status;
          project.status = newStatus as any;
          await project.save();
          updatedCount++;

          // Bench integration for projects transitioning to Completed
          if (newStatus === 'Completed') {
            for (const empId of project.teamMembers) {
              const emp = await User.findById(empId);
              if (emp) {
                const otherActive = await Project.countDocuments({
                  _id: { $ne: project._id },
                  teamMembers: empId as any,
                  status: { $in: ['Active', 'Upcoming'] }
                });
                if (otherActive === 0) {
                  emp.benchStatus = 'On Bench';
                  emp.benchStartDate = new Date();
                  emp.benchReason = `Project ${project.name} completed`;
                  await emp.save();
                }
              }
            }
          }
        }
      }

      console.log(`Daily project status update job finished. Updated ${updatedCount} projects.`);
    } catch (error) {
      console.error('Error in daily project status update job:', error);
    }
  });
};
