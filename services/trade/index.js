const postgresql = require('./postgresql.js');
const {
    createStreamGroup,
    readStreamGroup,
    addToStream,
    set,
    askPayment,
    get} = require('./redis.js');
const {v4: uuidv4} = require('uuid');


const STREAMS_KEY_TRADE   = "api";
const STREAMS_KEY_PAYMENT = "payment_response";
const GROUP_NAME          = "trade-group";
const CONSUMER_ID         = "consumer-".concat(uuidv4());

async function receiveMessages(id, streamKey, groupName, consumerId, processMessage) {
  await createStreamGroup(id, streamKey, groupName, consumerId);
  while (true) {
    const [[, records]] = await readStreamGroup(id, streamKey, groupName, consumerId);
    for (const [id, [, request]] of records) {
      await processMessage(id, request);
    }
  }
}

async function sendResponse(message) {
    console.log(`Send to api ${message}`);
    const channel = "api-response";
    await addToStream(channel, 'trade-response', message, (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

async function processPaymentMessage (id, message) {
    console.log(`process payment response ${message}`);
    const response = JSON.parse(message);
    if (response.status == "OK") {
        get(response.id, (err, result) => {
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
  console.log(`process api message ${message}`);

    let request = JSON.parse(message);
  switch(request.type) {
      case "BUY": {
          // TODO: check the price and amount from market
          await set(request.id, message);
          const request_withdraw = {"id" : request.id,
              "user_id" :    request.user_id,
              "amount" : request.count * request.price,
              "type" : "WITHDRAW"};
          await askPayment(JSON.stringify(request_withdraw));
          break;
      }

      case "SELL": {
          // TODO: check the price and amount from market
          await set(request.id, message);
          const request_deposit = {
              "id" : request.id,
              "user_id" :    request.user_id,
              "amount" : request.count * request.price,
              "type" : "DEPOSIT"};
          await askPayment(JSON.stringify(request_deposit));
          break;
      }

      default: {
          const resp = { "status" : "ERROR" , "response" : "Undefined trade command" };
          await sendResponse(JSON.stringify(resp));
      }
  }
}

async function main() {
    const [firstCall, secondCall] = await Promise.all([
            receiveMessages(1, STREAMS_KEY_TRADE, GROUP_NAME, CONSUMER_ID, processTradeMessage),
            receiveMessages(2, STREAMS_KEY_PAYMENT, GROUP_NAME, CONSUMER_ID, processPaymentMessage)
	]);
}

main().catch(err => console.error(err));
