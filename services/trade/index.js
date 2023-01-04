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

redis_sub.subscribe("trade", (err, count) => {
    if (err) {
        console.error("Failed to subscribe: %s", err.message);
    } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count}`);
    }
});

redis_sub.subscribe("payment_response", (err, count) => {
    if (err) {
        console.error("Failed to subscribe: %s", err.message);
    } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count}`);
    }
});

redis_sub.on("message", (channel, message) => {
    console.log(`Received ${message} from ${channel}`);
    
    if (channel == "trade") {
        const payment_channel = "payment";
        request = JSON.parse(message);
        switch(request.type) {
            case "BUY": {
                // TODO: check the price and amount from market
                redis_pub.set(request.id, message);
                const request_withdraw = {"id" : request.id,
                                          "user_id" :    request.user_id,
                                          "amount" : request.count * request.price,
                                          "type" : "WITHDRAW"};
                redis_pub.publish(payment_channel, JSON.stringify(request_withdraw));
                break;
            }
            case "SELL": {
                // TODO: check the price and amount from market
                redis_pub.set(request.id, message);
                const request_withdraw = {"id" : request.id,
                                          "user_id" :    request.user_id,
                                          "amount" : request.count * request.price,
                                          "type" : "DEPOSIT"};
                redis_pub.publish(payment_channel, JSON.stringify(request_withdraw));
                break;
            }
            default: {
                const resp = { "status" : "ERROR" , "response" : "Undefined trade command" };
                redis_pub.publish(response_channel, message);
            }
        }
    } else if (channel == "payment_response") {
        const response_channel = "trade_response";
        const response = JSON.parse(message);

        if (response.status == "OK") {
            redis_pub.get(response.id, (err, result) => {
                  if (result) {
                    console.log(result);
                    const req = JSON.parse(result);
                    if (req.type == "BUY") {
                        const resp = { "status" : "OK" ,
                                       "response" : `amount of ${req.count} of symbol ${req.symbol} at price ${req.price} has been bought`};
                        redis_pub.publish(response_channel, json.stringify(resp));
                    } else {
                        const resp = { "status" : "OK" ,
                                       "response" : `amount of ${req.count} of symbol ${req.symbol} at price ${req.price} has been soled`};
                        redis_pub.publish(response_channel, json.stringify(resp));
                    }
                  }
            });
        } else {
            redis_pub.publish(response_channel, message);
        }
    }
});
