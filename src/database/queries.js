const { DB_NAME } = require('../utils/secrets')

const createDB = `CREATE DATABASE IF NOT EXISTS ${DB_NAME}`;

const createTableUSers = `
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstname VARCHAR(50) NULL,
    lastname VARCHAR(50) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
)
`;

const createTableWallet = `
CREATE TABLE wallets (
    user_id INT PRIMARY KEY,
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
`;

const createNewUser = `
INSERT INTO users VALUES(null, ?, ?, ?, ?, NOW())
`;

const createUserWallet = `
INSERT INTO wallets (user_id, balance) VALUES (?, ?)
`;

const findUserByEmail = `
SELECT * FROM users WHERE email = ?
`;

const userProfileById = `
SELECT id, firstname, lastname, email, created_on FROM users WHERE id = ?
`;

const addUserBalance = `
UPDATE wallets SET balance = balance + ? WHERE user_id = ?
`;

const subtractUserBalance = `
    UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND balance >= ?
`;

const addTransactionHistory = `
    INSERT INTO transaction_history 
    (id, user_id, datetime, merchant_name, transaction_id, amount, currency, payment_method, transaction_type, notes) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
`;

const getTransactionHistory = `
    SELECT * FROM transaction_history
    WHERE user_id = ?
    ORDER BY datetime DESC
`;

module.exports = {
    createDB,
    createTableUSers,
    createNewUser,
    findUserByEmail,
    userProfileById,
    createTableWallet,
    createUserWallet,
    addUserBalance,
    addTransactionHistory,
    subtractUserBalance,
    getTransactionHistory
};
