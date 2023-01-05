const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const redis = require('./postgresql.js');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
require('dotenv').config();

const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const STREAMS_KEY = "api";
const GROUP_NAME = "trade-group";
const CONSUMER_ID = "consumer-".concat(uuidv4());

async function recieve_api_request () {
  await client.xgroup('CREATE', STREAMS_KEY,
                       GROUP_NAME, '$', 'MKSTREAM')
                      .catch(() => console.log(`Consumer ${CONSUMER_ID} group already exists`));

  while (true) {
    const [[, records]] = await client.xreadgroup(
      'GROUP', GROUP_NAME, CONSUMER_ID, 'BLOCK', '0',
      'COUNT', '1', 'STREAMS', STREAMS_KEY, '>');
    for (const [id, [, request]] of records) {
      await processAndAck(id, request);
    }
  }
}

const redis_payment = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
});

async function recieve_payment_response() {
  await redis_payment.xgroup('CREATE', 'payment_response',
                       GROUP_NAME, '$', 'MKSTREAM')
                      .catch(() => console.log(`Consumer ${CONSUMER_ID} group already exists`));

  while (true) {
    const [[, records]] = await redis_payment.xreadgroup(
      'GROUP', GROUP_NAME, CONSUMER_ID, 'BLOCK', '0',
      'COUNT', '1', 'STREAMS', 'payment_response', '>');
    for (const [id, [, request]] of records) {
      await processPaymentResponse(id, request);
    }
  }
}

async function send_response(message) {
    console.log(`Send to api ${message}`);
    const channel = "api-response";
    await client.xadd(channel, '*', 'trade-response', message, function (err) {
        if (err) {
            return console.error(err);
        }
    });
}

async function processPaymentResponse (id, message) {
    console.log(`process payment response ${message}`);
    const response = JSON.parse(message);
    if (response.status == "OK") {
        redis_payment.get(response.id, (err, result) => {
              if (result) {
                const req = JSON.parse(result);
                if (req.type == "BUY") {
                    const resp = { "status" : "OK" ,
                                   "response" : `amount of ${req.count} of symbol ${req.symbol} at price ${req.price} has been bought`};
                    send_response(JSON.stringify(resp));
                } else {
                    const resp = { "status" : "OK" ,
                                   "response" : `amount of ${req.count} of symbol ${req.symbol} at price ${req.price} has been soled`};
                    send_response(JSON.stringify(resp));
                }
              }
        });
    }
}

async function ask_payment(message) {
    console.log(`Send message to payment ${message}`);
    const channel = "payment";
    await client.xadd(channel, '*', 'payment', message, function (err) {
        if (err) {
            return console.error(err);
        }
    });
}

async function processAndAck (id, message) {
  console.log(`process api message ${message}`);

  request = JSON.parse(message);
  switch(request.type) {
      case "BUY": {
          // TODO: check the price and amount from market
          redis_payment.set(request.id, message);
          const request_withdraw = {"id" : request.id,
                                    "user_id" :    request.user_id,
                                    "amount" : request.count * request.price,
                                    "type" : "WITHDRAW"};
          await ask_payment(JSON.stringify(request_withdraw));
          break;
      }
      case "SELL": {
          // TODO: check the price and amount from market
          redis_payment.set(request.id, message);
          const request_withdraw = {"id" : request.id,
                                    "user_id" :    request.user_id,
                                    "amount" : request.count * request.price,
                                    "type" : "DEPOSIT"};
          await ask_payment(JSON.stringify(request_withdraw));
          break;
      }
      default: {
          const resp = { "status" : "ERROR" , "response" : "Undefined trade command" };
          await send_response(JSON.stringify(resp));
      }
  }
}

async function main() {
    const [firstCall, secondCall] = await Promise.all([
            recieve_api_request(),
            recieve_payment_response()
	]);
}

main().catch(err => console.error(err));
