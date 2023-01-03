const express = require('express');
const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
require('dotenv').config();

const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');


const app = express();
const port = 3000;

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ 
  extended: true
})); 


app.post('/',
  // Request validation
  body('user_id').isInt(),
  body('type').isAscii(),
  body('amount').isFloat(),
  body('symbol').isAscii(),

  // Response generation
  (req, res) => {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      (async () => {
        const data = JSON.stringify({
          "user_id": req.body.user_id,
          "type": req.body.type,
          "amount": req.body.amount,
          "symbol": req.body.symbol
        });

        await client.xadd('api', "*", "request", data );
        res.send("OK!\n");
      })();
});


app.listen(port, () => {
    console.log(`API-Gateway is listening on port ${port}`); 
});

