const {v4: uuidv4} = require('uuid');
const Redis = require('ioredis');
require('dotenv').config();
const {createStreamGroup,
       readStreamGroup,
       sendMessage} = require('./redis.js');


const STREAMS_KEY_API     = "api";
const STREAMS_KEY_PAYMENT = "payment";
const GROUP_NAME          = "payment-group";
const CONSUMER_ID         = "payment-consumer-".concat(uuidv4());
const RESP_STREAMS_KEY    = "payment_response";
const RESP_CHANNEL        = "payment_response";


const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redis_out = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const redis_in = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});


// TODO: Use postgress
const users = new Map();

async function receiveMessages(redis, streamKey, groupName, consumerId, processMessage) {
    await createStreamGroup(redis, streamKey, groupName, consumerId);
    while (true) {
        const [[, records]] = await readStreamGroup(redis, streamKey, groupName, consumerId);
        for (const [id, [, request]] of records) {
            await processMessage(request);
        }
    }
}

async function deposit(request) {
    if (users.has(request.user_id)) {
        users.set(request.user_id, users.get(request.user_id) + request.amount);
        const response = { "status" : "OK", 
            "response" : `Deposit to account ${request.user_id} with amount of ${request.amount} has been done`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
    } else {
        const response = { "status" : "ERROR", 
            "response" : `User ${request.user_id} not found`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
    }
}

async function withdraw(request) {
    if (users.has(request.user_id)) {
        if (users.get(request.user_id) >= request.amount) {
            users.set(request.user_id, users.get(request.user_id) - request.amount);
            const response = { "status" : "OK", 
                "response" : `Withdraw from account ${request.user_id} with amount of ${request.amount} has been done`,
                "id" : request.id};
            await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
        } else {
            const response = { "status" : "ERROR", 
                "response" : `User ${request.user_id} has not sufficent amount`,
                "id" : request.id};
            await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
        }
    } else {
        const response = { "status" : "ERROR", 
            "response" : `User ${request.user_id} not found`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
    }
}

async function addUser(request) {
    const id = uuidv4();
    users.set(id, 0);
    const response = { "status" : "OK", 
        "response" : `User with id ${id} has been created`,
        "id" : request.id};
    await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
}

async function removeUser(request) {
    if (users.has(request.user_id)) {
        users.delete(request.user_id);
        const response = { "status" : "OK", 
            "response" : `User ${request.user_id} with amount of ${request.amount} has been deleted`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
    } else {
        const response = { "status" : "ERROR", 
            "response" : `User ${request.user_id} not found`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
    }
}

async function userInfo(request) {
    if (users.has(request.user_id)) {
        const response = { "status" : "OK", 
            "response" : `User info of ${request.user_id}`,
            "id" : request.id,
            "user_id" : request.user_id,
            "amount" : users.get(request.user_id)};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
    } else {
        const response = { "status" : "ERROR", 
            "response" : `User ${request.user_id} not found`,
            "id" : request.id};
        await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
    }
}

async function processRequest(message) {
      const request = JSON.parse(message);
      switch(request.type) {
        case "DEPOSIT": {
            await deposit(request);
            break;
        }
        case "WITHDRAW":{
            await withdraw(request);
            break;
        }
        case "ADD_USER":{
            await addUser(request);
            // TODO: confirm message should return when DB create it actually.
            console.log(`User with ID "${request.user_id}" created!`);
            break;
        }
        case "REMOVE_USER":{
            await removeUser(request);
            break;
        }
        case "USER_INFO":{
            await userInfo(request);
            break;
        }
        default:{
            const response = { "status" : "ERROR", 
                              "response" : `Undefined Type ${request.type}`,
                              "id" : request.id};
            await sendMessage(redis_out, JSON.stringify(response), RESP_CHANNEL, RESP_STREAMS_KEY);
        }
      }
}

async function main() {
    const [firstCall, secondCall] = await Promise.all([
        receiveMessages(redis_out, STREAMS_KEY_API, GROUP_NAME, CONSUMER_ID, processRequest),
        receiveMessages(redis_in, STREAMS_KEY_PAYMENT, GROUP_NAME, CONSUMER_ID, processRequest)
    ]);
}

main().catch(err => console.error(err));