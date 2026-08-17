const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const syncEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Get the models
    const { Project } = require('./dist/models/project.model.js');
    const { User } = require('./dist/models/user.model.js');

    const projects = await Project.find().populate('managerId');
    console.log(`Found ${projects.length} projects.`);

    let syncCount = 0;

    for (const proj of projects) {
      if (proj.managerId && proj.managerId.departmentId) {
        const teamMemberIds = proj.teamMembers || [];
        if (teamMemberIds.length > 0) {
          const res = await User.updateMany(
            { _id: { $in: teamMemberIds }, role: 'Employee' },
            { departmentId: proj.managerId.departmentId }
          );
          syncCount += res.modifiedCount || 0;
          console.log(`Synced ${res.modifiedCount} employees for project ${proj.name} to manager ${proj.managerId.firstName}'s department.`);
        }
      }
    }

    console.log(`Synchronization complete. Synced ${syncCount} employees.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

syncEmployees();
