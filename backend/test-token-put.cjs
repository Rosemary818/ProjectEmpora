const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function getAdminTokenAndTest() {
  await mongoose.connect('mongodb://empora_admin:EmporaDB2026Secure@ac-akdrdsg-shard-00-00.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-01.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-02.zfjsdpt.mongodb.net:27017/empora?ssl=true&replicaSet=atlas-r7dhjg-shard-0&authSource=admin&retryWrites=true&w=majority');
  console.log('Connected to DB');

  // get a user
  const db = mongoose.connection.db;
  const hrAdmin = await db.collection('users').findOne({ role: 'HRAdmin' });
  const token = jwt.sign(
    { userId: hrAdmin._id },
    'your_jwt_access_secret_here',
    { expiresIn: '1d' }
  );
  
  const res = await fetch('http://localhost:5000/api/holidays/6a7bd9c6ddb5322a861433e7', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Test Holiday Updated HR', date: '2026-12-25', description: 'Test' })
  });
  
  const data = await res.json();
  console.log('Update Holiday Response HR:', data);

  process.exit(0);
}

getAdminTokenAndTest();
