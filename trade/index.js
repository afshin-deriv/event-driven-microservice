const express = require('express');
const redis = require('redis');


(async () => {

    const client = redis.createClient();
  
    const subscriber = client.duplicate();
  
    await subscriber.connect();
  
    await subscriber.subscribe('trade', (message) => {
      console.log(message); 
    });
})();
