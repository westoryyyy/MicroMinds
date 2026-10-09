const axios = require('axios');

async function run() {
  try {
    // 1. Get API Key
    const res1 = await axios.post('http://localhost:3000/api-keys', {
      walletAddress: '0x1234567890123456789012345678901234567890'
    }, {
      headers: { 'Authorization': 'Bearer mock' }
    });
    const apiKey = res1.data.key;
    console.log('API Key:', apiKey);

    // 2. Pre-fund Mock Escrow (if there's a debug endpoint)
    await axios.post('http://localhost:3000/escrow/mock-deposit', {
      address: '0x1234567890123456789012345678901234567890',
      amountWei: '10000000000000000'
    });
    console.log('Mock deposit done.');

    // 3. Get listings to find AI Assistant ID
    const resList = await axios.get('http://localhost:3000/listings');
    const aiListing = resList.data.find(l => l.name === 'AI Assistant');
    console.log('AI Listing ID:', aiListing.id);

    // 4. Test Success (AI Assistant)
    const resCall = await axios.post('http://localhost:3000/api/chat-agent', {
      listingId: aiListing.id,
      input: { prompt: 'Hello AI' }
    }, {
      headers: { 'x-api-key': apiKey }
    });
    console.log('Call Result:', resCall.data);

    // 5. Test Bad Schema (Flaky)
    const flakyListing = resList.data.find(l => l.name === 'Flaky Listing');
    const resFlaky = await axios.post('http://localhost:3000/api/chat-agent', {
      listingId: flakyListing.id,
      input: { trigger: 'bad_schema' }
    }, {
      headers: { 'x-api-key': apiKey }
    });
    console.log('Flaky Result (Bad Schema):', resFlaky.data);

    // 6. Test 500 (Flaky)
    const resFlaky500 = await axios.post('http://localhost:3000/api/chat-agent', {
      listingId: flakyListing.id,
      input: { trigger: '500' }
    }, {
      headers: { 'x-api-key': apiKey }
    });
    console.log('Flaky Result (500):', resFlaky500.data);

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

run();
