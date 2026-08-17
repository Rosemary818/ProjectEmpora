const mongoose = require('mongoose');
const { getMyApplications } = require('./src/controllers/careerPortal.controller');

mongoose.connect('mongodb://empora_admin:EmporaDB2026Secure@ac-akdrdsg-shard-00-00.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-01.zfjsdpt.mongodb.net:27017,ac-akdrdsg-shard-00-02.zfjsdpt.mongodb.net:27017/empora?ssl=true&replicaSet=atlas-r7dhjg-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(async () => {
    // Create a mock req and res
    const req = {
      user: {
        _id: new mongoose.Types.ObjectId('6a632148c6ad6ab9d391fa13')
      }
    };
    const res = {
      status: function(s) {
        this.statusCode = s;
        return this;
      },
      json: function(data) {
        console.log("Response:", JSON.stringify(data, null, 2));
      }
    };
    
    await getMyApplications(req, res);
    process.exit(0);
  });
