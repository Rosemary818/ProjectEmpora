import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/user.model';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/empora';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ employeeCode: { $exists: false } });
    console.log(`Found ${users.length} users to migrate`);

    const counters = {
      Manager: 0,
      Employee: 0,
      HRAdmin: 0,
      SuperAdmin: 0,
      Candidate: 0
    };

    for (const user of users) {
      let prefix = 'EMP';
      if (user.role === 'Manager') prefix = 'MGR';
      else if (user.role === 'HRAdmin') prefix = 'HR';
      else if (user.role === 'SuperAdmin') prefix = 'SA';
      else if (user.role === 'Candidate') prefix = 'CAN';

      counters[user.role]++;
      user.employeeCode = `${prefix}${counters[user.role].toString().padStart(3, '0')}`;
      await user.save();
      console.log(`Migrated user: ${user.email} -> ${user.employeeCode}`);
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
