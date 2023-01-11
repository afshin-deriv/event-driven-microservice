const Redis = require('ioredis');
require('dotenv').config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const STREAMS_KEY = "api";

const redis_write = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const redis_read = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

function addToStream (data) {
    redis_write.xadd(STREAMS_KEY, '*', 'request', data, function (err) {
        if (err) {
            return console.error(err);
        }
    });
}

module.exports = {
    addToStream
};
