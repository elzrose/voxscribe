const { DeepgramClient } = require('@deepgram/sdk');
require('dotenv').config();

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

async function test() {
  try {
    const live = await deepgram.listen.v1.createConnection({
      model: 'nova-2',
      smart_format: true,
      language: 'en-US'
    });
    
    let proto = Object.getPrototypeOf(live);
    console.log('--- Prototype Hierarchy ---');
    while (proto) {
      console.log(`Proto Name: ${proto.constructor.name}`);
      console.log(Object.getOwnPropertyNames(proto));
      proto = Object.getPrototypeOf(proto);
    }
    
    // Close the socket connection
    live.requestClose();
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

test();
