const Redis = require('ioredis');
require('dotenv').config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redis_obj = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const redis = {

    createStreamGroup: async function (stream_key, group_name, consumer_id) {
        return await redis_obj.xgroup('CREATE', stream_key,
                       group_name, '$', 'MKSTREAM')
                      .catch(() => console.log(`Consumer ${consumer_id} group already exists`));
    },
    readStreamGroup: async function (stream_key, group_name, consumer_id) {
        return await redis_obj.xreadgroup(
            'GROUP', group_name, consumer_id, 'BLOCK', '0',
            'COUNT', '1', 'STREAMS', stream_key, '>');
    },
    addToStream: async function (channel, msg_key, message, error_handler) {
        await redis_obj.xadd(channel, '*', msg_key, message, error_handler);
    },
    set: async function (request_id, message) {
        await redis_obj.set(request_id, message);
    },
    get: async function (response_id, response_handler) {
        await redis_obj.get(response_id, response_handler);
    }

};

module.exports = redis;