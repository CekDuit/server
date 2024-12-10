const router = require('express').Router();
const User = require('../models/user.model'); // Menggunakan model User
const verifyToken = require('../middlewares/authMiddleware'); // Middleware validasi token

// Route untuk mendapatkan informasi pengguna
router.route('/profile')
    .get(verifyToken, (req, res) => {
    const userId = req.userId; // ID pengguna dari token yang telah diverifikasi

    User.findById(userId, (err, user) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({ message: "User not found" });
            }
            return res.status(500).send({ message: "Error retrieving user" });
        }
        res.status(200).send({ message: "User profile retrieved successfully", user });
    });
});

module.exports = router;
