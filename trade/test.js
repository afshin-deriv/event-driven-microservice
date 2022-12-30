const redis = require('redis');
const publisher = redis.createClient();

(async () => {

  const req1 = {
    type: 'sell',
    symbol: 'ABC',
    amount: '150',
  };
  const req2 = {
    type: 'buy',
    symbol: 'ABC',
    amount: '100',
  };
  const req3 = {
    type: 'sell',
    symbol: 'ABC',
    amount: '100',
  };

  await publisher.connect();

  await publisher.publish('trade', JSON.stringify(req1));
  await publisher.publish('trade', JSON.stringify(req1));
  await publisher.publish('trade', JSON.stringify(req1));
})();
