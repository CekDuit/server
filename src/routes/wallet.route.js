const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const walletController = require('../controllers/wallet.controller');
const verifyToken = require('../middlewares/authMiddleware');

router.route('/addbalance')
    .post(verifyToken, asyncHandler(walletController.addbalance));

router.route('/deductbalance')
    .post(verifyToken, asyncHandler(walletController.deductbalance));

router.route('/history')
    .get(verifyToken, asyncHandler(walletController.getTransactionHistory));

router.route('/monthly-history')
    .get(verifyToken, asyncHandler(walletController.getTransactionHistoryByType));

module.exports = router;