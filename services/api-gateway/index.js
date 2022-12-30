const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');

const client  = redis.createClient({ url:'redis://redis:6379' });
const subscriber = client.duplicate();

const app = express();
const port = 3000;

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ 
  extended: true
})); 

(async () => {
    await subscriber.connect();
    await client.connect();
})();


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
        // console.log(req.body.user_id);
        // console.log(req.body.type);
        // console.log(req.body.amount);
        // console.log(req.body.symbol);
        await client.publish('trade', JSON.stringify(req.body));
        res.send("OK!\n");
    })();
});


app.listen(port, () => {
    console.log(`API-Gateway is listening on port ${port}`); 
});
