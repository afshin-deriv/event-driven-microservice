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

    check_symbol_availability: async function (symbol_name) {
        const pool = new Pool(credentials);
        const symbol = await pool.query(`SELECT 1 AS result FROM symbol WHERE symbol_name=${symbol_name}`);
        await pool.end();

        return symbol;
    },

    is_market_open: async function (symbol_name, date) {
        const pool = new Pool(credentials);
        const market = await pool.query(
          `SELECT 1 AS result FROM market INNER JOIN symbol ON symbol.market_id = market.market_id
           WHERE symbol_name = ${symbol_name} 
           AND
           ${date} >= open_from
           AND
           ${date} <= open_until`
        );
        await pool.end();

        return market;
    }
};

module.exports = postgres;
