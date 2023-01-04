const Redis = require("ioredis");
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

redis_sub.subscribe("payment", (err, count) => {
    if (err) {
        console.error("Failed to subscribe: %s", err.message);
    } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count}`);
    }
});

// TODO: Use postgress
const users = new Map();

redis_sub.on("message", (channel, message) => {
      console.log(`Received ${message} from ${channel}`);
      const response_channel = "payment_response";
      request = JSON.parse(message);
      switch(request.type) {
        case "DEPOSIT": {
            if (users.has(request.user_id)) {
                users.set(request.user_id, users.get(request.user_id) + request.amount);
                const response = { "status" : "OK", 
                                  "response" : `Deposit to account ${request.user_id} with amount of ${request.amount} has been done`,
                                  "id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
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
                    redis_pub.publish(response_channel, JSON.stringify(response));
                } else {
                    const response = { "status" : "ERROR", 
                                      "response" : `User ${request.user_id} has not sufficent amount`,
                                      "id" : request.id};
                    redis_pub.publish(response_channel, JSON.stringify(response));
                }
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            }
            break;
        }
        case "ADD_USER":{
            const id = Date.now();
            users.set(id, 0);
            const response = { "status" : "OK", 
                              "response" : `User with id ${id} has been created`,
                              "id" : request.id};
            redis_pub.publish(response_channel, JSON.stringify(response));
            break;
        }
        case "REMOVE_USER":{
            if (users.has(request.user_id)) {
                users.delete(request.user_id);
                const response = { "status" : "OK", 
                                  "response" : `User ${request.user_id} with amount of ${request.amount} has been deleted`,
                                  "id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
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
                redis_pub.publish(response_channel, JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            }
            break;
        }
        default:{
            const response = { "status" : "ERROR", 
                              "response" : `Undefined Type ${request.type}`,
                              "id" : request.id};
            redis_pub.publish(response_channel, JSON.stringify(response));
        }
      }
});
