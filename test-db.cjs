require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

async function testHoliday() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/empora');
  console.log('Connected to DB');

  try {
    const { Holiday } = await import('./backend/dist/models/holiday.model.js');
    console.log('Holiday model loaded');
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

testHoliday();
