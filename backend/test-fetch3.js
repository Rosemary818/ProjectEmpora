const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

const testFetch = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const { User } = require('./dist/models/user.model.js');
  
  const hrAdmin = await User.findOne({ role: 'HRAdmin' });
  if (!hrAdmin) {
    console.log('No HRAdmin found');
    process.exit(1);
  }

  const token = jwt.sign({ userId: hrAdmin._id, role: hrAdmin.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  
  const res = await fetch('http://localhost:5000/api/admin/hr-dashboard', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
  
  process.exit(0);
};

testFetch().catch(console.error);
