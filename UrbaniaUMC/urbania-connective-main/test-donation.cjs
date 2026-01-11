const axios = require('axios');

async function testDonation() {
  try {
    const response = await axios.post('http://localhost:4000/api/donations/process', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      amount: 100,
      currency: 'INR',
      program: 'general',
      donationType: 'one-time',
      anonymous: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDonation(); 