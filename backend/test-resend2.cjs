require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/empora').then(async () => {
  const User = mongoose.connection.collection('users');
  const hrAdmin = await User.findOne({ role: { $in: ['HRAdmin', 'SuperAdmin'] } });
  if (!hrAdmin) { console.log('No HRAdmin found'); return process.exit(1); }

  const token = jwt.sign(
    { userId: hrAdmin._id.toString(), role: hrAdmin.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const appReq = http.request('http://localhost:5000/api/jobs/applications', {
    headers: { 'Authorization': `Bearer ${token}` }
  }, (appRes) => {
    let appDataStr = '';
    appRes.on('data', d => appDataStr += d);
    appRes.on('end', () => {
      const apps = JSON.parse(appDataStr).data;
      if (!apps) return console.log('Failed to fetch apps', appDataStr);
      const convertedApp = apps.find(a => a.status === 'Converted to Employee');
      if (!convertedApp) { console.log('No converted app found'); return process.exit(0); }
      console.log('Found converted app:', convertedApp._id);

      const resendReq = http.request(`http://localhost:5000/api/jobs/applications/${convertedApp._id}/resend-welcome`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (resendRes) => {
        let resendDataStr = '';
        resendRes.on('data', d => resendDataStr += d);
        resendRes.on('end', () => {
          console.log('Resend Response:', resendRes.statusCode, resendDataStr);
          process.exit(0);
        });
      });
      resendReq.end();
    });
  });
  appReq.end();
});
