const axios = require('axios');
async function test() {
  try {
    const login = await axios.post('http://localhost:13111/api/auth/login', {
      email: 'admin@metalconnect.com',
      password: 'admin123'
    });
    const token = login.data.token;
    
    const overview = await axios.get('http://localhost:13111/api/analytics/overview', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Overview:', overview.data);
    
    const trend = await axios.get('http://localhost:13111/api/analytics/revenue-trend', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Trend length:', trend.data.length);
    
    const tops = await axios.get('http://localhost:13111/api/analytics/top-products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Top Products length:', tops.data.length);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
