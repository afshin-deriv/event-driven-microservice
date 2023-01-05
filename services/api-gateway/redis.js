const Redis = require('ioredis');
require('dotenv').config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const STREAMS_KEY = "api";

const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});


const redis = {

    addToStream: function (data) { 
        client.xadd(STREAMS_KEY, '*', 'request', data, function (err) {
            if (err) {
              return console.error(err);
            }
          });
    },

    validateAndParse: function (data) {
        if ( !data.user_id && !data.type && !data.amount && !data.symbol) {
            throw 'Invalid Request format';
        }
        const jsonData = JSON.stringify({
            "user_id": data.user_id,
            "amount":  data.amount,
            "symbol":  data.symbol,
            "type":    data.type
        });

	    return jsonData;
    }
};

module.exports = redis;
