const http = require('http');

async function test() {
  const loginData = JSON.stringify({ email: 'hradmin@empora.com', password: 'password123' });
  
  const req = http.request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const { accessToken } = JSON.parse(data);
      if (!accessToken) return console.log('Login failed', data);

      const appReq = http.request('http://localhost:5000/api/jobs/applications', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }, (appRes) => {
        let appDataStr = '';
        appRes.on('data', d => appDataStr += d);
        appRes.on('end', () => {
          const apps = JSON.parse(appDataStr).data;
          const convertedApp = apps.find(a => a.status === 'Converted to Employee');
          if (!convertedApp) {
             console.log('No converted app found');
             return;
          }
          console.log('Found converted app:', convertedApp._id);

          const resendReq = http.request(`http://localhost:5000/api/jobs/applications/${convertedApp._id}/resend-welcome`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }, (resendRes) => {
            let resendDataStr = '';
            resendRes.on('data', d => resendDataStr += d);
            resendRes.on('end', () => {
              console.log('Resend Response:', resendRes.statusCode, resendDataStr);
            });
          });
          resendReq.end();
        });
      });
      appReq.end();
    });
  });
  req.write(loginData);
  req.end();
}
test();
