const Redis = require('ioredis');
require('dotenv').config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redis_sub = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
});

const redis_pub = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
});

async function createStreamGroup(stream_key, group_name, consumer_id) {
    await redis_sub.xgroup('CREATE', stream_key, group_name, '$', 'MKSTREAM')
        .catch(() => console.log(`Consumer ${consumer_id} group already exists`));
}

async function readStreamGroup(stream_key, group_name, consumer_id) {
    return await redis_sub.xreadgroup(
            'GROUP', group_name, consumer_id, 'BLOCK', '0',
            'COUNT', '1', 'STREAMS', stream_key, '>');
}

async function sendMessage(message, channel, key) {
    await redis_pub.xadd(channel, '*', key, message, function (err) {
        if (err) {
            return console.error(err);
        }
    });
}

module.exports = {
    createStreamGroup,
    readStreamGroup,
    sendMessage
};
