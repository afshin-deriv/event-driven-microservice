const { Pool, Client } = require("pg");

require('dotenv').config();

const POSTGRESQL_HOST = process.env.POSTGRESQL_HOST || 'localhost';
const POSTGRESQL_USER = process.env.POSTGRESQL_USER || 'postgres';
const POSTGRESQL_PASS = process.env.POSTGRESQL_PASS || '';
const POSTGRESQL_PORT = process.env.POSTGRESQL_PORT || '5432';

const credentials = {
    user: POSTGRESQL_USER,
    host: POSTGRESQL_HOST,
    database: "payment",
    password: POSTGRESQL_PASS,
    port: POSTGRESQL_PORT,
};

const pool = new Pool(credentials);

async function addUser (client_id, fullname) {

    const result = await pool.query(`
      INSERT INTO client (client_id, fullname) VALUES(${client_id}, ${fullname})`);
    await pool.end();

    return result;
}

async function delUser (client_id) {
    const result = await pool.query(`DELETE from client WHERE client_id = ${client_id}`);
    await pool.end();

    return result;
}

async function infoUder (client_id) {
    const result = await pool.query(`SELECT client_id, fullname, created_at from client WHERE client_id = ${client_id}`);
    await pool.end();

    return result;
}


module.exports = {
    addUser,
    delUser
};
