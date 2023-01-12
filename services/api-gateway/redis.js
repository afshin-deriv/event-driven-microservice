function addToStream (redis, stream_key, data) {
    redis.xadd(stream_key, '*', 'request', data, function (err) {
        if (err) {
            return console.error(err);
        }
    });
}

async function createStreamGroup(redis, stream_key, group_name, consumer_id) {
    await redis.xgroup('CREATE', stream_key, group_name, '$', 'MKSTREAM')
        .catch(() => console.log(`Consumer ${consumer_id} group already exists`));
}



module.exports = {
    addToStream,
    createStreamGroup,
};

