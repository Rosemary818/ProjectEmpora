const mongoose = require('mongoose');

mongoose.connect('mongodb://empora_admin:EmporaDB2026Secure@ac-akdrdsg-shard-00-00.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-01.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-02.zfjsdpt.mongodb.net:27017/empora?ssl=true&replicaSet=atlas-r7dhjg-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({_id: {$in: [new mongoose.Types.ObjectId('6a632148c6ad6ab9d391fa13'), new mongoose.Types.ObjectId('6a7bd060c328da5fb7162b89')]}}).toArray();
    console.log("Users with applications:");
    console.log(JSON.stringify(users.map(u => ({_id: u._id, email: u.email, role: u.role}))));

    const allUsers = await db.collection('users').find({role: 'Candidate'}).toArray();
    console.log("\nAll Candidates:");
    console.log(JSON.stringify(allUsers.map(u => ({_id: u._id, email: u.email, role: u.role}))));
    process.exit(0);
  });
