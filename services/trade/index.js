const postgresql = require('./postgresql.js');
const redis = require('./redis.js');
const {v4: uuidv4} = require('uuid');


const STREAMS_KEY_TRADE   = "api";
const STREAMS_KEY_PAYMENT = "payment_response";
const GROUP_NAME          = "trade-group";
const CONSUMER_ID         = "consumer-".concat(uuidv4());



redis.createStreamGroup(STREAMS_KEY_TRADE, GROUP_NAME, CONSUMER_ID);
async function recieve_api_request () {
  while (true) {
    const [[, records]] = await redis.readStreamGroup(STREAMS_KEY_TRADE, GROUP_NAME, CONSUMER_ID);
    for (const [id, [, request]] of records) {
      await processTradeAck(id, request);
    }
  }
}


redis.createStreamGroup(STREAMS_KEY_PAYMENT, GROUP_NAME, CONSUMER_ID);
async function recieve_payment_response() {
  while (true) {
    const [[, records]] = await redis.readStreamGroup(STREAMS_KEY_PAYMENT, GROUP_NAME, CONSUMER_ID);
    for (const [id, [, request]] of records) {
      await processPaymentResponse(id, request);
    }
  }
}

async function send_response(message) {
    console.log(`Send to api ${message}`);
    const channel = "api-response";
    await redis.addToStream(channel, 'trade-response', message, (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

async function processPaymentResponse (id, message) {
    console.log(`process payment response ${message}`);
    const response = JSON.parse(message);
    if (response.status == "OK") {
        await redis.get(response.id, (err, result) => {
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
    await redis.addToStream(channel, 'payment', message, (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

async function processTradeAck (id, message) {
  console.log(`process api message ${message}`);

  request = JSON.parse(message);
  switch(request.type) {
      case "BUY": {
          // TODO: check the price and amount from market
          await redis.set(request.id, message);
          const request_withdraw = {"id" : request.id,
                                    "user_id" :    request.user_id,
                                    "amount" : request.count * request.price,
                                    "type" : "WITHDRAW"};
          await ask_payment(JSON.stringify(request_withdraw));
          break;
      }
      case "SELL": {
          // TODO: check the price and amount from market
          await redis.set(request.id, message);
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
