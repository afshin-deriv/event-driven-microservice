const WebSocketServer = require('ws');
const redis = require('./redis.js');


const port = 3000;
const wss = new WebSocketServer.Server({ port: port });


wss.on("connection", ws => {
  console.log("New client connected");

  ws.on("message", data => {
    try {
      const req = JSON.parse(data);
      valid_data = redis.validateAndParse(req);
      (async () => {
        await redis.addToStream(valid_data);
      })();

      console.table({user_id: req.user_id, type: req.type, amount: req.amount, symbol: req.symbol});

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
