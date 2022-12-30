const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser')

const publisher = redis.createClient();

const app = express();
const port = 3000;

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ 
  extended: true
})); 

app.post('/', (req, res) => {
    (async () => { 
        res.send('Your request received!');
        console.log(req.body.user_id);
        console.log(req.body.type);
        console.log(req.body.amount);
        console.log(req.body.symbol);
        await publisher.connect();
        // await publisher.publish('trade', JSON.stringify(req));
    })();
});


app.listen(port, () => {
    console.log(`API-Gateway is listening on port ${port}`); 
});