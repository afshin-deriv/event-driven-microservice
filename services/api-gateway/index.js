const WebSocketServer = require('ws');
const {addToStream, createStreamGroup} = require('./redis.js');
const {validateAndParse} = require("./validation");

const {v4: uuidv4} = require('uuid');
const Redis = require('ioredis');
require('dotenv').config();

const GROUP_NAME          = "api-group";
const CONSUMER_ID              = "api-consumer-".concat(uuidv4());
const TRADE_STREAMS_KEY       = "trade";
const PAYMENT_STREAMS_KEY       = "payment";

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

const redis_out = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const port = 3000;
const wss = new WebSocketServer.Server({ port: port });


wss.on("connection", ws => {
  console.log("New client connected");

  ws.on("message", data => {
    try {
      const req = JSON.parse(data);
      const valid_data = validateAndParse(req);
      (async () => {
        if (req.type == "BUY" || req.type == "SELL") {
          console.log("trade...");
          await addToStream(redis_out, TRADE_STREAMS_KEY, valid_data);
        } else {
          await addToStream(redis_out, PAYMENT_STREAMS_KEY, valid_data);
          console.log("payment...");
        }

      })();

      console.table({req_type:req.type});

    } catch (e) {
      (async () => {
        await ws.send("Request format isn't valid!", e);
      })();
    }
  });

  ws.on("close", () => {
      console.log("Client gets disconnected");
  });

  ws.onerror = function (e) {
      console.log("Some Error occurred", e);
  }
});

console.log(`API-Gateway is listening on port ${port}`);



async function readStreamGroup(redis, stream_key, group_name, consumer_id) {
  return await redis.xreadgroup(
      'GROUP', group_name, consumer_id, 'BLOCK', '0',
      'COUNT', '1', 'STREAMS', stream_key, '>');
}

async function processRequest(message) {
  console.log(message);
}

async function receiveMessages(redis, streamKey, groupName, consumerId, processMessage) {
  await createStreamGroup(redis, streamKey, groupName, consumerId);
  while (true) {
    const [[, records]] = await readStreamGroup(redis, streamKey, groupName, consumerId);
    for (const [id, [, request]] of records) {
      await processMessage(request);
    }
  }
}



async function main() {
  const [firstCall, secondCall] = await Promise.all([
    receiveMessages(redis_trade, TRADE_STREAMS_KEY, GROUP_NAME, CONSUMER_ID, processRequest),
    receiveMessages(redis_payment, PAYMENT_STREAMS_KEY, GROUP_NAME, CONSUMER_ID, processRequest)
  ]);
}

main().catch(err => console.error(err));