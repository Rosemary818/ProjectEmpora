const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { getHRAdminDashboard } = require('./dist/controllers/admin.controller.js');
    
    // mock req, res, next
    const req = {};
    const res = {
      status: (code) => ({
        json: (data) => console.log('Response:', data)
      })
    };
    const next = (err) => console.error('Next called with error:', err);
    
    await getHRAdminDashboard(req, res, next);
    
    process.exit(0);
  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
};

testDashboard();
