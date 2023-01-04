const Redis = require('ioredis');
const WebSocketServer = require('ws');


const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
require('dotenv').config();

const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const port = 3000;
const STREAMS_KEY = "api";

(async () => {
  client.xgroup('CREATE', 'api', 'trade', '$', 'MKSTREAM', function (err) {
    if (err) {
      return console.error(err);
    }
  });
})();

const wss = new WebSocketServer.Server({ port: port })
wss.on("connection", ws => {
  console.log("New ws client connected");
  // sending message
  ws.on("message", data => {
      const req = JSON.parse(data);
      // Simple validation
      if ( req.user_id && req.type && req.amount && req.symbol ) {
        (async () => {
          const data = JSON.stringify({
            "user_id": req.user_id,
            "amount":  req.amount,
            "symbol":  req.symbol,
            "type":    req.type
          });

          await client.xadd(STREAMS_KEY, '*', 'request', data, function (err) {
            if (err) {
              return console.error(err);
            }
          });
        })();
      } else {
        ws.send("Request format isn't valid!");
      }
      // Debug log
      console.log(`user_id: ${obj.user_id}, type: ${obj.type}, amount: ${obj.amount}, symbol: ${obj.symbol}`);
  });

  ws.on("close", () => {
      console.log("The client has connected");
  });

  ws.onerror = function () {
      console.log("Some Error occurred")
  }
});

console.log(`API-Gateway is listening on port ${port}`);