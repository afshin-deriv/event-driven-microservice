const Redis = require('ioredis');

const redis = new Redis({
    host: '127.0.0.1',
    port: '6379',
});

redis.xadd('site:pdx', '*',
           'aqi', 37,
           'tempc', 5.1).then(function(id) {
  console.log("id:", id);
});
