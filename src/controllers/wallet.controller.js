const db = require('../config/db.config');
const { 
    addUserBalance: addUserBalanceQuery, 
    addTransactionHistory: addTransactionHistoryQuery,
    subtractUserBalance: subtractUserBalanceQuery } = require('../database/queries');
const { logger } = require('../utils/logger');

const exchangeRates = {
    USD: 15939,
    EUR: 16744,
    MYR: 3586
};

exports.addbalance = (req, res) => {
    const user_id = req.userId;
    const { amount, merchantName, transactionId, currency, paymentMethod, notes = "-" } = req.body;

    if (currency !== "IDR") {
        if (exchangeRates[currency]) {
            amount = amount * exchangeRates[currency];
            currency = "IDR";
        } else {
            return res.status(400).send({
                status: "error",
                message: "Invalid currency."
            });
        }
    }

    // Validasi input
    if (!amount || amount <= 0) {
        return res.status(400).send({
            status: "error",
            message: "Invalid input data. Ensure 'amount' is provided and greater than 0."
        });
    }

    const app_transaction_id = `TX-${Date.now()}-${user_id}`; // Generate unique transaction ID

    // Memulai transaksi
    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            logger.error(`Transaction Error: ${transactionErr.message}`);
            return res.status(500).send({
                status: "error",
                message: "An error occurred while starting the transaction."
            });
        }

        db.query(addUserBalanceQuery, [amount, user_id], (err, result) => {
            if (err) {
                logger.error(`Error updating balance: ${err.message}`);
                return db.rollback(() => {
                    res.status(500).send({
                        status: "error",
                        message: "An error occurred while updating the balance."
                    });
                });
            }

            if (result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(404).send({
                        status: "error",
                        message: "Wallet not found for the given user_id."
                    });
                });
            }

            // Query untuk menambahkan transaksi ke transaction_history
            db.query(
                addTransactionHistoryQuery,
                [app_transaction_id, user_id, merchantName, transactionId, amount, currency, paymentMethod, "INCOME", notes],
                (transactionErr, transactionResult) => {
                    if (transactionErr) {
                        logger.error(`Error inserting transaction history: ${transactionErr.message}`);
                        return db.rollback(() => {
                            res.status(500).send({
                                status: "error",
                                message: "An error occurred while saving the transaction history."
                            });
                        });
                    }

                    // Commit transaksi jika semua berhasil
                    db.commit((commitErr) => {
                        if (commitErr) {
                            logger.error(`Commit Error: ${commitErr.message}`);
                            return db.rollback(() => {
                                res.status(500).send({
                                    status: "error",
                                    message: "An error occurred while committing the transaction."
                                });
                            });
                        }

                        res.status(200).send({
                            status: "success",
                            message: "Balance updated successfully and transaction recorded.",
                            data: {
                                user_id,
                                amount_added: amount,
                                transaction_id: transactionId
                            }
                        });
                    });
                }
            );
        });
    });
};

exports.deductbalance = (req, res) => {
    const user_id = req.userId;
    const { amount, merchantName, transactionId, currency, paymentMethod, notes = "-" } = req.body;

    // Validasi mata uang dan konversi ke IDR jika perlu
    if (currency !== "IDR") {
        if (exchangeRates[currency]) {
            amount = amount * exchangeRates[currency];
            currency = "IDR";
        } else {
            return res.status(400).send({
                status: "error",
                message: "Invalid currency."
            });
        }
    }

    // Validasi input
    if (!amount || amount <= 0) {
        return res.status(400).send({
            status: "error",
            message: "Invalid input data. Ensure 'amount' is provided and greater than 0."
        });
    }

    const app_transaction_id = `TX-${Date.now()}-${user_id}`; // Generate unique transaction ID

    // Memulai transaksi
    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            logger.error(`Transaction Error: ${transactionErr.message}`);
            return res.status(500).send({
                status: "error",
                message: "An error occurred while starting the transaction."
            });
        }

        // Mengurangi saldo pengguna
        db.query(subtractUserBalanceQuery, [amount, user_id, amount], (err, result) => {
            if (err) {
                logger.error(`Error deducting balance: ${err.message}`);
                return db.rollback(() => {
                    res.status(500).send({
                        status: "error",
                        message: "An error occurred while deducting the balance."
                    });
                });
            }

            if (result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(400).send({
                        status: "error",
                        message: "Insufficient balance or wallet not found."
                    });
                });
            }

            // Menambahkan transaksi ke transaction_history
            db.query(
                addTransactionHistoryQuery,
                [
                    app_transaction_id, user_id, merchantName, transactionId,
                    amount, currency, paymentMethod, "EXPENSE", notes
                ],
                (transactionErr, transactionResult) => {
                    if (transactionErr) {
                        logger.error(`Error inserting transaction history: ${transactionErr.message}`);
                        return db.rollback(() => {
                            res.status(500).send({
                                status: "error",
                                message: "An error occurred while saving the transaction history."
                            });
                        });
                    }

                    // Commit transaksi jika semua berhasil
                    db.commit((commitErr) => {
                        if (commitErr) {
                            logger.error(`Commit Error: ${commitErr.message}`);
                            return db.rollback(() => {
                                res.status(500).send({
                                    status: "error",
                                    message: "An error occurred while committing the transaction."
                                });
                            });
                        }

                        res.status(200).send({
                            status: "success",
                            message: "Balance deducted successfully and transaction recorded.",
                            data: {
                                user_id,
                                amount_deducted: amount,
                                transaction_id: transactionId
                            }
                        });
                    });
                }
            );
        });
    });
};
