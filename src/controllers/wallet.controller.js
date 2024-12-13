const db = require('../config/db.config');
const { 
    addUserBalance: addUserBalanceQuery, 
    addTransactionHistory: addTransactionHistoryQuery,
    subtractUserBalance: subtractUserBalanceQuery,
    getTransactionHistory: getTransactionHistoryQuery, getTransactionHistoryByTime: getTransactionHistoryByTimeQuery } = require('../database/queries');
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

exports.getTransactionHistory = (req, res) => {
    const user_id = req.userId; // Ambil user_id dari token yang sudah divalidasi

    db.query(getTransactionHistoryQuery, [user_id], (err, results) => {
        if (err) {
            logger.error(`Error retrieving transaction history: ${err.message}`);
            return res.status(500).send({
                status: "error",
                message: "An error occurred while retrieving the transaction history."
            });
        }

        if (results.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No transaction history found for this user."
            });
        }

        res.status(200).send({
            status: "success",
            message: "Transaction history retrieved successfully.",
            data: results
        });
    });
};

exports.getTransactionHistoryByTime = (req, res) => {
    const user_id = req.userId; // Ambil user_id dari token yang sudah divalidasi
    const { transactionType, timeFrame, category } = req.query; // Ambil tipe transaksi dan rentang waktu dari query string

    // Validasi tipe transaksi
    if (!transactionType || (transactionType !== "INCOME" && transactionType !== "EXPENSE" && transactionType !== "ALL")) {
        return res.status(400).send({
            status: "error",
            message: "Invalid or missing transaction type. Allowed values: 'INCOME', 'EXPENSE', 'ALL'."
        });
    }

    // Validasi rentang waktu
    const validTimeFrames = ["MONTHLY", "LAST_30_DAYS", "LAST_7_DAYS", "LAST_3_DAYS", "TODAY", "ALL_TIME"];
    if (!timeFrame || !validTimeFrames.includes(timeFrame)) {
        return res.status(400).send({
            status: "error",
            message: `Invalid or missing time frame. Allowed values: ${validTimeFrames.join(", ")}.`
        });
    }

    const validCategory = ["FOOD", "HEALTH", "DRINKS", "HOUSEHOLD", "TRANSPORTATION", "GROCERIES", "FAMILY", "SUBSCRIPTION", "APPAREL", "EDUCATION", "ENTERTAINMENT", "UTILITIES", "BEAUTY", "OTHER", "ALL"];
    if (!category || !validCategory.includes(category)) {
        return res.status(400).send({
            status: "error",
            message: `Invalid or missing category. Allowed values: ${validCategory.join(", ")}.`
        });
    }

    db.query(
        getTransactionHistoryByTimeQuery,
        [user_id, transactionType, timeFrame, category],
        (err, results) => {
            if (err) {
                logger.error(`Error retrieving transaction history: ${err.message}`);
                return res.status(500).send({
                    status: "error",
                    message: "An error occurred while retrieving the transaction history."
                });
            }

            if (results.length === 0) {
                return res.status(404).send({
                    status: "error",
                    message: `No transaction history found for type '${transactionType}' and '${category}' category within the '${timeFrame}' time frame.`
                });
            }

            res.status(200).send({
                status: "success",
                message: `Transaction history for type '${transactionType}' and '${category}' category within the '${timeFrame}' time frame retrieved successfully.`,
                data: results
            });
        }
    );
};

