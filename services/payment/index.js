const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
require('dotenv').config();

const redis_sub = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
});

const redis_pub = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
});

const STREAMS_KEY = "payment";
const GROUP_NAME = "payment-group";
const CONSUMER_ID = "consumer-".concat(uuidv4());

// TODO: Use postgress
const users = new Map();

async function send_response(message) {
    console.log(`Send ${message}`);
    const response_channel = "payment_response";
    await redis_pub.xadd(response_channel, '*', 'payment_response', message, function (err) {
        if (err) {
            return console.error(err);
        }
    });
}

async function recieve_request() {
    await redis_sub.xgroup('CREATE', STREAMS_KEY, GROUP_NAME, '$', 'MKSTREAM')
        .catch(() => console.log(`Consumer ${CONSUMER_ID} group already exists`));

    while (true) {
        const [[, records]] = await redis_sub.xreadgroup(
            'GROUP', GROUP_NAME, CONSUMER_ID, 'BLOCK', '0',
            'COUNT', '1', 'STREAMS', STREAMS_KEY, '>');
        for (const [id, [, request]] of records) {
            await process_request(request);
        }
    }
}

async function process_request(message) {
      console.log(`Received ${message}`);
      request = JSON.parse(message);
      switch(request.type) {
        case "DEPOSIT": {
            if (users.has(request.user_id)) {
                users.set(request.user_id, users.get(request.user_id) + request.amount);
                const response = { "status" : "OK", 
                                  "response" : `Deposit to account ${request.user_id} with amount of ${request.amount} has been done`,
                                  "id" : request.id};
                await send_response(JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                await send_response(JSON.stringify(response));
            }
            break;
        }
        case "WITHDRAW":{
            if (users.has(request.user_id)) {
                if (users.get(request.user_id) >= request.amount) {
                    users.set(request.user_id, users.get(request.user_id) - request.amount);
                    const response = { "status" : "OK", 
                                       "response" : `Withdraw from account ${request.user_id} with amount of ${request.amount} has been done`,
                                       "id" : request.id};
                    await send_response(JSON.stringify(response));
                } else {
                    const response = { "status" : "ERROR", 
                                      "response" : `User ${request.user_id} has not sufficent amount`,
                                      "id" : request.id};
                    await send_response(JSON.stringify(response));
                }
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                await send_response(JSON.stringify(response));
            }
            break;
        }
        case "ADD_USER":{
            const id = Date.now();
            users.set(id, 0);
            const response = { "status" : "OK", 
                              "response" : `User with id ${id} has been created`,
                              "id" : request.id};
            await send_response(JSON.stringify(response));
            break;
        }
        case "REMOVE_USER":{
            if (users.has(request.user_id)) {
                users.delete(request.user_id);
                const response = { "status" : "OK", 
                                  "response" : `User ${request.user_id} with amount of ${request.amount} has been deleted`,
                                  "id" : request.id};
                await send_response(JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                await send_response(JSON.stringify(response));
            }
            break;
        }
        case "USER_INFO":{
            if (users.has(request.user_id)) {
                const response = { "status" : "OK", 
                                  "response" : `User info of ${request.user_id}`,
                                  "id" : request.id,
                                  "user_id" : request.user_id,
                                  "amount" : users.get(request.user_id)};
                await send_response(JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                await send_response(JSON.stringify(response));
            }
            break;
        }
        default:{
            const response = { "status" : "ERROR", 
                              "response" : `Undefined Type ${request.type}`,
                              "id" : request.id};
            await send_response(JSON.stringify(response));
        }
      }
}

recieve_request().catch(err => console.error(err));
