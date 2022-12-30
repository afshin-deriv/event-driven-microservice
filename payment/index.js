const express = require('express');

const app = express();
const port = 3001;


app.get('/', (req, res) => {
    res.send('Payment is up!');
});


app.listen(port, () => {
    console.log(`Payment is listening on port ${port}`); 
});
