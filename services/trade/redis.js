async function createStreamGroup(redis, stream_key, group_name, consumer_id) {
    return await redis.xgroup('CREATE', stream_key,
        group_name, '$', 'MKSTREAM')
        .catch(() => console.log(`Consumer ${consumer_id} group already exists`));
}

async function readStreamGroup(redis, stream_key, group_name, consumer_id) {
    return await redis.xreadgroup(
        'GROUP', group_name, consumer_id, 'BLOCK', '0',
        'COUNT', '1', 'STREAMS', stream_key, '>');
}

async function addToStream(redis, channel, msg_key, message, error_handler) {
    await redis.xadd(channel, '*', msg_key, message, error_handler);
}

async function set(redis, request_id, message) {
    await redis.set(request_id, message);
}

async function get(redis, response_id, response_handler) {
    await redis.get(response_id, response_handler);
}

async function askPayment(redis, channel, key, message) {
    await redis.xadd(channel, '*', channel, message, (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

module.exports = {
    createStreamGroup,
    readStreamGroup,
    addToStream,
    set,
    get,
    askPayment
};
