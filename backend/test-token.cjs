const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function getAdminTokenAndTest() {
  await mongoose.connect('mongodb://empora_admin:EmporaDB2026Secure@ac-akdrdsg-shard-00-00.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-01.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-02.zfjsdpt.mongodb.net:27017/empora?ssl=true&replicaSet=atlas-r7dhjg-shard-0&authSource=admin&retryWrites=true&w=majority');
  console.log('Connected to DB');

  // get a user
  const db = mongoose.connection.db;
  const adminUser = await db.collection('users').findOne({ role: 'SuperAdmin' });
  if (!adminUser) {
    console.log('No SuperAdmin found');
    process.exit(1);
  }
  
  console.log('Found admin:', adminUser.email);
  
  const token = jwt.sign(
    { userId: adminUser._id },
    'your_jwt_access_secret_here',
    { expiresIn: '1d' }
  );
  
  console.log('Generated token');
  
  const res = await fetch('http://localhost:5000/api/holidays', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Test Holiday', date: '2026-12-25', description: 'Test' })
  });
  
  const data = await res.json();
  console.log('Create Holiday Response:', data);

  process.exit(0);
}

getAdminTokenAndTest();
