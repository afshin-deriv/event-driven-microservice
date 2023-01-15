const { Pool, Client } = require("pg");

require('dotenv').config();

const POSTGRESQL_HOST = process.env.POSTGRESQL_HOST || 'localhost';
const POSTGRESQL_USER = process.env.POSTGRESQL_USER || 'postgres';
const POSTGRESQL_PASS = process.env.POSTGRESQL_PASS || '123456';
const POSTGRESQL_PORT = process.env.POSTGRESQL_PORT || '5432';

const credentials = {
    user: POSTGRESQL_USER,
    host: POSTGRESQL_HOST,
    database: "payment",
    password: POSTGRESQL_PASS,
    port: POSTGRESQL_PORT,
};

async function addUserDB (client_id) {
    const pool = new Pool(credentials);

    const result = await pool.query(`INSERT INTO public.client (client_id) VALUES ('${client_id}')`);
    await pool.end();

    return result;
}

async function delUserDB (client_id) {
    const pool = new Pool(credentials);

    const result = await pool.query(`DELETE from client WHERE client_id = ${client_id}`);
    await pool.end();

    return result;
}

async function infoUserDB (client_id) {
    const pool = new Pool(credentials);

    const result = await pool.query(`SELECT client_id, balance, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at from client WHERE client_id = '${client_id}'`);
    await pool.end();

    return result;
}


module.exports = {
    addUserDB,
    delUserDB,
    infoUserDB
};
