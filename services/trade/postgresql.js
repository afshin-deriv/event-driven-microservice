const { Pool, Client } = require("pg");

require('dotenv').config();

const POSTGRESQL_HOST = process.env.POSTGRESQL_HOST || 'localhost';
const POSTGRESQL_USER = process.env.POSTGRESQL_USER || 'postgres';
const POSTGRESQL_PASS = process.env.POSTGRESQL_PASS || '';
const POSTGRESQL_PORT = process.env.POSTGRESQL_PORT || '5432';

const credentials = {
    user: POSTGRESQL_USER,
    host: POSTGRESQL_HOST,
    database: "trade",
    password: POSTGRESQL_PASS,
    port: POSTGRESQL_PORT,
  };


const postgres = {

    addToStream: function (data) { 
        client.xadd(STREAMS_KEY, '*', 'request', data, function (err) {
            if (err) {
              return console.error(err);
            }
          });
    },

    validateAndParse: function (data) {
        if ( !data.user_id && !data.type && !data.amount && !data.symbol) {
            throw 'Invalid Request format';
        }
        const jsonData = JSON.stringify({
            "user_id": data.user_id,
            "amount":  data.amount,
            "symbol":  data.symbol,
            "type":    data.type
        });

	    return jsonData;
    }
};

module.exports = postgres;
