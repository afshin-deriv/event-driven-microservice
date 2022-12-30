const redis = require('redis');
const publisher  = redis.createClient();

(async () => {

    const client = redis.createClient();
    const subscriber = client.duplicate();
    await publisher.connect();
    await subscriber.connect();
  
    await subscriber.subscribe('trade', (message) => {
      // Debug message
      console.log(message);
    
      // Check & Parse request

      // Payment
      publisher.publish('api','{"user_id":100}');
    });
})();
