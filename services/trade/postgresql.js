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

    checkSymbol: async function (symbol) {
        const pool = new Pool(credentials);
        const symbol = await pool.query("SELECT * from symbols");
        await pool.end();

        return symbol;
    },

    marketCalendar: async function (market, date) {
        const pool = new Pool(credentials);
        const market = await pool.query(`SELECT * from markets where market = ${market} and date = ${date}`);
        await pool.end();

        return market;
    }
};

module.exports = postgres;
