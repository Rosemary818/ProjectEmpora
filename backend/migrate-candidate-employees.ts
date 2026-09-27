import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/user.model';
import { Project } from './src/models/project.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/empora';

async function migrateCandidates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Identify existing Employee records whose employeeCode starts with CAN
    const usersToMigrate = await User.find({
      role: 'Employee',
      employeeCode: { $regex: /^CAN/i }
    });

    console.log(`Found ${usersToMigrate.length} employees with CANxxx IDs to migrate.`);

    let migratedCount = 0;

    for (const user of usersToMigrate) {
      console.log(`Migrating user ${user.firstName} ${user.lastName} (Current ID: ${user.employeeCode})`);

      // 4. Preserve the original CANxxx ID
      user.candidateId = user.employeeCode;
      
      // Clear the employeeCode so the pre('save') hook generates a new one
      user.employeeCode = undefined;
      // Mark role as modified to trigger the hook condition (this.isModified('role') && !this.employeeCode)
      user.markModified('role');

      // 9. Recalculate Bench Status
      const activeProjectsCount = await Project.countDocuments({
        teamMembers: user._id,
        status: 'Active'
      });

      if (activeProjectsCount > 0) {
        user.benchStatus = 'Allocated';
        user.benchStartDate = undefined;
      } else {
        user.benchStatus = 'On Bench';
        user.benchStartDate = new Date();
      }

      // 3. Update the Employee record with the new EMP ID (via save hook)
      await user.save();

      console.log(`Successfully migrated! New ID: ${user.employeeCode}, Candidate ID preserved: ${user.candidateId}, Bench Status: ${user.benchStatus}`);
      migratedCount++;
    }

    console.log(`Migration completed. Migrated ${migratedCount} employees.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCandidates();
