const express = require('express');

const app = express();
const port = 3002;


app.get('/', (req, res) => {
    res.send('reporting is up!');
});


app.listen(port, () => {
    console.log(`reporting is listening on port ${port}`); 
});
