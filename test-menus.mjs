import https from 'https';

const API_KEY = '5EHsCetQvu9qeXfRit07gG0xJjnfD11O';
const ACCESS_TOKEN = '1|pjmDent0aDtOUd4hN7zLvL3S80lnlyMPcMKgGrqlbcfafc7b';

const options = {
  hostname: 'bookmypuc.com',
  port: 443,
  path: '/adminapi/api/v1/menus/main-menu',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'X-API-KEY': API_KEY,
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Error parsing JSON', data);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
