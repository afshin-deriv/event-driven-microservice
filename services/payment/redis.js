async function createStreamGroup(redis, stream_key, group_name, consumer_id) {
    await redis.xgroup('CREATE', stream_key, group_name, '$', 'MKSTREAM')
        .catch(() => console.log(`Consumer ${consumer_id} group already exists`));
}

async function readStreamGroup(redis, stream_key, group_name, consumer_id) {
    return await redis.xreadgroup(
            'GROUP', group_name, consumer_id, 'BLOCK', '0',
            'COUNT', '1', 'STREAMS', stream_key, '>');
}

async function sendMessage(redis, message, channel, key) {
     await redis.xadd(channel, '*', key, message, function (err) {
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
