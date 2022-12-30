const express = require('express');

const app = express();
const port = 3000;


app.get('/', (req, res) => {
    res.send('Your request received!');
});


app.listen(port, () => {
    console.log(`API-Gateway is listening on port ${port}`); 
});