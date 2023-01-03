const Redis = require("ioredis");
const redis_sub = new Redis();

redis_sub.subscribe("payment", (err, count) => {
    if (err) {
    console.error("Failed to subscribe: %s", err.message);
    } else {
    // `count` represents the number of channels this client are currently subscribed to.
    console.log(
            `Subscribed successfully! This client is currently subscribed to ${count}
            channels.`
            );
    }
});

// TODO: Use postgress
const users = new Map();

const redis_pub = new Redis();
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
                                  "request_id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "request_id" : request.id};
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
                                       "request_id" : request.id};
                    redis_pub.publish(response_channel, JSON.stringify(response));
                } else {
                    const response = { "status" : "ERROR", 
                                      "response" : `User ${request.user_id} has not sufficent amount`,
                                      "request_id" : request.id};
                    redis_pub.publish(response_channel, JSON.stringify(response));
                }
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "request_id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            }
            break;
        }
        case "ADD_USER":{
            const id = Date.now();
            users.set(id, 0);
            const response = { "status" : "OK", 
                              "response" : `User with id ${id} has been created`,
                              "request_id" : request.id};
            redis_pub.publish(response_channel, JSON.stringify(response));
            break;
        }
        case "REMOVE_USER":{
            if (users.has(request.user_id)) {
                users.delete(request.user_id);
                const response = { "status" : "OK", 
                                  "response" : `User ${request.user_id} with amount of ${request.amount} has been deleted`,
                                  "request_id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "request_id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            }
            break;
        }
        case "USER_INFO":{
            if (users.has(request.user_id)) {
                const response = { "status" : "OK", 
                                  "response" : `User info of ${request.user_id}`,
                                  "request_id" : request.id,
                                  "user_id" : request.user_id,
                                  "amount" : users.get(request.user_id)};
                redis_pub.publish(response_channel, JSON.stringify(response));
            } else {
                const response = { "status" : "ERROR", 
                                  "response" : `User ${request.user_id} not found`,
                                  "request_id" : request.id};
                redis_pub.publish(response_channel, JSON.stringify(response));
            }
            break;
        }
        default:{
            const response = { "status" : "ERROR", 
                              "response" : `Undefined Type ${request.type}`,
                              "request_id" : request.id};
            redis_pub.publish(response_channel, JSON.stringify(response));
        }
      }
});
