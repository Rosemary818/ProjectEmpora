const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { User } = require('./dist/models/user.model.js');
  
  const hrAdmin = await User.findOne({ role: 'HRAdmin' });
  if (!hrAdmin) { console.log('No HRAdmin found'); return process.exit(1); }
  
  const token = jwt.sign({ userId: hrAdmin._id, role: hrAdmin.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  
  const res = await fetch('http://localhost:5000/api/admin/employees', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
  process.exit(0);
}

test();
