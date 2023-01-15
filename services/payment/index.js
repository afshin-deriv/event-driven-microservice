const {v4: uuidv4} = require('uuid');
const Redis = require('ioredis');
require('dotenv').config();
const {createStreamGroup,
       readStreamGroup,
       sendMessage} = require('./redis.js');
const {addUserDB,
       delUserDB,
       infoUserDB} = require('./postgresql.js');

const STREAMS_KEY_PAYMENT = "payment";
const GROUP_NAME          = "payment-group";
const CONSUMER_ID         = "payment-consumer-".concat(uuidv4());
const RESP_KEY            = "payment_response";
const RESP_CHANNEL        = "payment";


const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';



const redis_in = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

(async () => {
    await createStreamGroup(redis_in, STREAMS_KEY_PAYMENT, GROUP_NAME, CONSUMER_ID);
})();

// TODO: Use postgress
const users = new Map();

async function receiveMessages(redis, streamKey, groupName, consumerId, processMessage) {
    while (true) {
        const [[, records]] = await readStreamGroup(redis, streamKey, groupName, consumerId);
        for (const [id, [, request]] of records) {
            await processMessage(request);
        }
    }
}

async function deposit(request) {
    const redis_out = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
    });

    if (users.has(request.user_id)) {
        users.set(request.user_id, users.get(request.user_id) + request.amount);
        const response = { "status" : "OK", 
            "response" : `Deposit to account ${request.user_id} with amount of ${request.amount} has been done`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
    } else {
        const response = { "status" : "ERROR", 
            "response" : `User ${request.user_id} not found`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
    }
}

async function withdraw(request) {
    const redis_out = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
    });

    if (users.has(request.user_id)) {
        if (users.get(request.user_id) >= request.amount) {
            users.set(request.user_id, users.get(request.user_id) - request.amount);
            const response = { "status" : "OK", 
                "response" : `Withdraw from account ${request.user_id} with amount of ${request.amount} has been done`,
                "id" : request.id};
            await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
        } else {
            const response = { "status" : "ERROR", 
                "response" : `User ${request.user_id} has not sufficient amount`,
                "id" : request.id};
            await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
        }
    } else {
        const response = { "status" : "ERROR", 
            "response" : `User ${request.user_id} not found`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
    }
}

async function addUser(request) {
    const redis_out = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
    });

    const id = uuidv4();
    await addUserDB(id);
    const response = { "status" : "OK", 
        "response" : `User with id ${id} has been created`,
        "id" : request.id};
    await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
}

async function removeUser(request) {
    const redis_out = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
    });

    if (users.has(request.user_id)) {
        users.delete(request.user_id);
        const response = { "status" : "OK", 
            "response" : `User ${request.user_id} with amount of ${request.amount} has been deleted`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
    } else {
        const response = { "status" : "ERROR", 
            "response" : `User ${request.user_id} not found`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
    }
}

async function userInfo(request) {
    const redis_out = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
    });

    await infoUserDB(request.user_id).then(function (result) {
        let response;
        if (result.rowCount > 0) {
            response = JSON.stringify({
                "status" : "OK",
				"response": `user_id: ${result.rows[0].client_id}, balance: ${result.rows[0].balance}, created_at: ${result.rows[0].created_at}`
            });

           } else {
            response = JSON.stringify({
                "status" : "ERROR",
                "response" : `User ${request.user_id} not found`
            });
        }

           sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_KEY);
        });
}

async function processRequest(message) {
      const request = JSON.parse(message);
      switch(request.type) {
        case "deposit": {
            await deposit(request);
            break;
        }
        case "withdraw":{
            await withdraw(request);
            break;
        }
        case "add_user":{
            await addUser(request);
            break;
        }
        case "remove_user":{
            await removeUser(request);
            break;
        }
        case "user_info":{
            await userInfo(request);
            break;
        }
      }
}

async function main() {
    const [firstCall, secondCall] = await Promise.all([
        receiveMessages(redis_in, STREAMS_KEY_PAYMENT, GROUP_NAME, CONSUMER_ID, processRequest)
    ]);
}

main().catch(err => console.error(err));
