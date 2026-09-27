import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { calculateProjectStatus } from './project.helper';

export const syncBenchStatus = async (userId: string | any) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'Employee') return;

    // Fetch all projects for this user
    const projects = await Project.find({ teamMembers: userId });

    let hasActiveProject = false;

    // Evaluate true status for each project
    for (const project of projects) {
      const trueStatus = calculateProjectStatus(project.startDate, project.endDate, project.status);
      if (trueStatus === 'Active') {
        hasActiveProject = true;
        break; // Found at least one active project, no need to check others
      }
    }

    if (hasActiveProject) {
      if (user.benchStatus === 'On Bench' || user.benchStatus === 'Allocation Requested') {
        user.benchStatus = 'Allocated';
        user.requestedProjectId = undefined;

        if (user.benchStartDate) {
          if (!user.benchHistory) user.benchHistory = [];
          user.benchHistory.push({
            startDate: user.benchStartDate,
            endDate: new Date(),
            reason: user.benchReason,
          });
          user.benchStartDate = undefined;
          user.benchReason = undefined;
        }
        await user.save();
      }
    } else {
      if (user.benchStatus !== 'On Bench') {
        user.benchStatus = 'On Bench';
        user.benchStartDate = new Date();
        user.benchReason = 'Automatically identified (No active project allocations)';
        await user.save();
      }
    }
  } catch (error) {
    console.error(`Error syncing bench status for user ${userId}:`, error);
  }
};
