const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('https://metal-connect.dev.rraasi.com/api/auth/login', {
      email: 'admin@metalconnect.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log("Logged in!");

    const metals = [
      { type: 'STEEL', price: 450 },
      { type: 'ALUMINIUM', price: 280 },
      { type: 'BRASS', price: 520 },
      { type: 'COPPER', price: 750 },
      { type: 'BRONZE', price: 420 },
      { type: 'IRON', price: 380 },
    ];

    for (const m of metals) {
      await axios.post('https://metal-connect.dev.rraasi.com/api/metal-price', {
        metalType: m.type,
        pricePerKg: m.price
      }, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`Created ${m.type} price: ${m.price}`);
    }

    const pricesRes = await axios.get('https://metal-connect.dev.rraasi.com/api/metal-price/current', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Final Prices:", pricesRes.data.map(p => `${p.metalType}: ${p.pricePerKg}`));
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}
test();
