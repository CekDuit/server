const express = require('express');
const router = express.Router();
const { setupWatch, handleNotifications } = require('../controllers/gmailController');

// Rute untuk memulai Gmail Watch
router.post('/start-watch', setupWatch);

// Rute untuk menangani notifikasi Gmail
router.post('/notifications', handleNotifications);

module.exports = router;
