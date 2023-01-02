const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
require('dotenv').config();

const client = redis.createClient({ url:`redis://${REDIS_HOST}:${REDIS_PORT}` });

(async () => {

    const subscriber = client.duplicate();
    await client.connect();
    await subscriber.connect();
  
    await subscriber.subscribe('trade', (message) => {
      // Debug message
      console.log(message);
    
      // Check & Parse request

      // Payment
      client.publish('api','{"user_id":100}');
    });
})();
