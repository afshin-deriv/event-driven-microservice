const postgresql = require('./postgresql.js');
const Redis = require('ioredis');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redis_trade = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const redis_payment = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const {
    createStreamGroup,
    readStreamGroup,
    addToStream,
    set,
    askPayment,
    get} = require('./redis.js');



const STREAMS_KEY_TRADE   = "api";
const STREAMS_KEY_PAYMENT = "payment_response";
const GROUP_NAME          = "trade-group";
const CONSUMER_ID         = "trade-consumer-".concat(uuidv4());

async function receiveMessages(redis, streamKey, groupName, consumerId, processMessage) {
  await createStreamGroup(redis, streamKey, groupName, consumerId);
  while (true) {
    const [[, records]] = await readStreamGroup(redis, streamKey, groupName, consumerId);
    for (const [id, [, request]] of records) {
      await processMessage(id, request);
    }
  }
}

async function sendResponse(message) {
    console.log(`Send to api ${message}`);
    const channel = "api-response";
    await addToStream(redis_payment, channel, 'trade-response', message, (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

async function processPaymentMessage (id, message) {
    console.log(`process payment response ${message}`);
    const response = JSON.parse(message);
    if (response.status == "OK") {
        get(redis_trade, response.id, (err, result) => {
              if (result) {
                const req = JSON.parse(result);
                if (req.type == "BUY") {
                    const resp = { "status" : "OK" ,
                                   "response" : `amount of ${req.count} of symbol ${req.symbol} at price ${req.price} has been bought`};
                    sendResponse(JSON.stringify(resp));
                } else {
                    const resp = { "status" : "OK" ,
                                   "response" : `amount of ${req.count} of symbol ${req.symbol} at price ${req.price} has been soled`};
                    sendResponse(JSON.stringify(resp));
                }
              }
        });
    }
}

async function processTradeMessage (id, message) {
  const request = JSON.parse(message);
  switch(request.type) {
      case "BUY": {
          // TODO: check the price and amount from market
          console.log(`process BUY request ${message}`);
          await set(redis_trade, request.id, message);
          const request_withdraw = {"id" : request.id,
              "user_id" :    request.user_id,
              "amount" : request.count * request.price,
              "type" : "WITHDRAW"};
          await askPayment(redis_trade, "payment", "payment", JSON.stringify(request_withdraw));
          break;
      }

      case "SELL": {
          // TODO: check the price and amount from market
          console.log(`process SELL request ${message}`);
          await set(redis_trade, request.id, message);
          const request_deposit = {
              "id" : request.id,
              "user_id" :    request.user_id,
              "amount" : request.count * request.price,
              "type" : "DEPOSIT"};
          await askPayment(redis_trade, "payment", "payment", JSON.stringify(request_deposit));
          break;
      }
      /* If received message isn't for trade service, simply ignore it! */

      // default: {
      //     const resp = { "status" : "ERROR" , "response" : "Undefined trade command" };
      //     await sendResponse(JSON.stringify(resp));
      // }
  }
}

async function main() {
    const [firstCall, secondCall] = await Promise.all([
            receiveMessages(redis_trade, STREAMS_KEY_TRADE, GROUP_NAME, CONSUMER_ID, processTradeMessage),
            receiveMessages(redis_payment, STREAMS_KEY_PAYMENT, GROUP_NAME, CONSUMER_ID, processPaymentMessage)
	]);
}

main().catch(err => console.error(err));
