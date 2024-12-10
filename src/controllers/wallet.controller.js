const db = require('../config/db.config');
const { addUserBalance: addUserBalanceQuery } = require('../database/queries');

exports.addbalance = (req, res) => {
    const user_id = req.userId; // Ambil user_id dari token yang sudah divalidasi
    const { amount } = req.body; // Ambil 'amount' dari request body

    // Validasi data
    if (!amount || amount <= 0) {
        return res.status(400).send({
            status: "error",
            message: "Invalid input data. Ensure 'amount' is provided and greater than 0."
        });
    }

    db.query(addUserBalanceQuery, [amount, user_id], (err, result) => {
        if (err) {
            logger.error(`Error updating balance: ${err.message}`);
            return res.status(500).send({
                status: "error",
                message: "An error occurred while updating the balance."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({
                status: "error",
                message: "Wallet not found for the given user_id."
            });
        }

        res.status(200).send({
            status: "success",
            message: "Balance updated successfully",
            data: {
                user_id,
                amount_added: amount
            }
        });
    });
}