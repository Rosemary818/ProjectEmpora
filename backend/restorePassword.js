const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'hradmin@gmail.com' },
    { $set: { password: '$2b$10$daiMGwans00RSf9AXQ7Bb.c6IqKaxsUhq9LPnaMMHSzHR2C3iUvae' } }
  );
  console.log('Restored');
  process.exit(0);
}
run();
