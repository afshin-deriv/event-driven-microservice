const Redis = require('ioredis');
require('dotenv').config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redis_obj = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

async function createStreamGroup(id, stream_key, group_name, consumer_id) {
    if (id == 1) {
    return await redis_obj.xgroup('CREATE', stream_key,
                   group_name, '$', 'MKSTREAM')
                  .catch(() => console.log(`Consumer ${consumer_id} group already exists`));
    } else {
    return await client.xgroup('CREATE', stream_key,
                   group_name, '$', 'MKSTREAM')
                  .catch(() => console.log(`Consumer ${consumer_id} group already exists`));
    }
}

async function readStreamGroup(id, stream_key, group_name, consumer_id) {
    if (id == 1) {
    return await redis_obj.xreadgroup(
        'GROUP', group_name, consumer_id, 'BLOCK', '0',
        'COUNT', '1', 'STREAMS', stream_key, '>');
    } else {
    return await client.xreadgroup(
        'GROUP', group_name, consumer_id, 'BLOCK', '0',
        'COUNT', '1', 'STREAMS', stream_key, '>');
    }
}

async function addToStream(channel, msg_key, message, error_handler) {
    await client.xadd(channel, '*', msg_key, message, error_handler);
}

async function set(request_id, message) {
    await redis_obj.set(request_id, message);
}

async function get(response_id, response_handler) {
    await redis_obj.get(response_id, response_handler);
}

async function askPayment(message) {
    const channel = "payment";
    await redis_obj.xadd(channel, '*', 'payment', message, (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

module.exports = {
    redis_obj,
    createStreamGroup,
    readStreamGroup,
    addToStream,
    set,
    get,
    askPayment
};
