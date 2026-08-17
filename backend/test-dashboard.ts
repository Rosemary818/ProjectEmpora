import mongoose from 'mongoose';
import { User } from './src/models/user.model';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ firstName: 'rose' });
  if (!user) return console.log('No employee found');
  
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  
  try {
    const res = await fetch('http://localhost:5000/api/user/employee-dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('Fetch error:', err);
  }
  process.exit(0);
}
test();
