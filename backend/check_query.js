const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://empora_admin:EmporaDB2026Secure@ac-akdrdsg-shard-00-00.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-01.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-02.zfjsdpt.mongodb.net:27017/empora?ssl=true&replicaSet=atlas-r7dhjg-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(async () => {
    // Define a minimal model just to test the query
    const jobAppSchema = new Schema({}, { strict: false, collection: 'jobapplications' });
    const JobApp = mongoose.model('JobApp', jobAppSchema);

    // Test with string
    let apps = await JobApp.find({ candidateId: '6a632148c6ad6ab9d391fa13' });
    console.log("Found with string:", apps.length);

    // Test with ObjectId
    apps = await JobApp.find({ candidateId: new mongoose.Types.ObjectId('6a632148c6ad6ab9d391fa13') });
    console.log("Found with ObjectId:", apps.length);
    
    // Check if maybe it's saved as user instead of candidateId
    const all = await JobApp.find({});
    console.log("First app candidateId:", all[0].candidateId);

    process.exit(0);
  });
