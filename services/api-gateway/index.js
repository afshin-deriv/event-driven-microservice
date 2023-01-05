const WebSocketServer = require('ws');
const redis = require('./redis.js');


const port = 3000;
const wss = new WebSocketServer.Server({ port: port });


wss.on("connection", ws => {
  console.log("New client connected");

  ws.on("message", data => {
      const req = JSON.parse(data);
      validData = redis.validateAndParse(req);
      if ( validData ) {
        (async () => {
          await redis.addToStream(validData);
        })();
      } else {
        ws.send("Request format isn't valid!");
      }
      // Debug log
      console.log(`user_id: ${req.user_id}, type: ${req.type}, amount: ${req.amount}, symbol: ${req.symbol}`);
  });

  ws.on("close", () => {
      console.log("Client gets disconnected");
  });

  ws.onerror = function (e) {
      console.log("Some Error occurred", e);
  }
});

console.log(`API-Gateway is listening on port ${port}`);
