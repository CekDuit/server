const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const walletController = require('../controllers/wallet.controller');
const verifyToken = require('../middlewares/authMiddleware');

router.route('/addbalance')
    .post(verifyToken, asyncHandler(walletController.addbalance));

router.route('/deductbalance')
    .post(verifyToken, asyncHandler(walletController.deductbalance));

module.exports = router;