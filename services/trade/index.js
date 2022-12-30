const redis = require('redis');
const client = redis.createClient({ url:'redis://redis:6379' });

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
