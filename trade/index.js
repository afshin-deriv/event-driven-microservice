const express = require('express');

const app = express();
const port = 3000;


app.get('/', (req, res) => {
    res.send('Trading is up!');
});


app.listen(port, () => {
    console.log(`Trading is listening on port ${port}`); 
});