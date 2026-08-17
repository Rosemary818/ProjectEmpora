const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const syncManagers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Get the models
    const { Department } = require('./dist/models/department.model.js');
    const { User } = require('./dist/models/user.model.js');

    const departments = await Department.find();
    console.log(`Found ${departments.length} departments.`);

    let syncCount = 0;

    for (const dept of departments) {
      if (dept.managerId) {
        const user = await User.findById(dept.managerId);
        if (user && String(user.departmentId) !== String(dept._id)) {
          user.departmentId = dept._id;
          await user.save();
          syncCount++;
          console.log(`Synced manager ${user.firstName} ${user.lastName} to department ${dept.departmentName}`);
        }
      }
    }

    console.log(`Synchronization complete. Synced ${syncCount} managers.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

syncManagers();
