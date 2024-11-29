const mysql = require('mysql');
const { logger } = require('../utils/logger');
const { DB_HOST, DB_USER, DB_PASS, CERT } = require('../utils/secrets');
const fs = require('fs');

const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    ssl: {
        ca: fs.readFileSync(CERT)
    }
});

connection.connect((err) => {
    if (err) logger.error(err.message);
});

module.exports = connection;