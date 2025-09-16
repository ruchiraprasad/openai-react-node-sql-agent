const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();


const config = {
    user: process.env.SQL_SERVER_USER,
    password: process.env.SQL_SERVER_PASSWORD,
    server: process.env.SQL_SERVER_HOST,
    port: parseInt(process.env.SQL_SERVER_PORT || '1433', 10),
    database: process.env.SQL_SERVER_DATABASE,
    options: {
        enableArithAbort: true,
        encrypt: false // set to true for Azure or encrypted connections
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};


let pool;


async function getPool() {
    if (!pool) pool = await sql.connect(config);
    return pool;
}


async function executeQuery(query, params = {}) {
    const p = await getPool();
    const request = p.request();
    // Add parameters safely
    for (const [k, v] of Object.entries(params)) {
        // map JS types to SQL types simply
        request.input(k, v);
    }
    const result = await request.query(query);
    return result.recordset;
}


module.exports = { executeQuery, sql };