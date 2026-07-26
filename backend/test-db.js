const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('connected');
  const { User } = require('./dist/models/user.model.js');
  try {
    const employees = await User.find({ role: { $in: ['Employee', 'Manager'] } })
      .select('-password')
      .sort('-createdAt');
    console.log('Employees found:', employees.length);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

test();
