const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const checkEmail = require('../middlewares/checkEmail');
const { signup: signupValidator, signin: signinValidator } = require('../validators/auth');
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/authMiddleware');


router.route('/signup')
    .post(signupValidator, asyncHandler(checkEmail), asyncHandler(authController.signup));

router.route('/signin')
    .post(signinValidator, asyncHandler(authController.signin));

router.route('/validate-token')
    .get(verifyToken, (req, res) => {
        res.status(200).send({ message: 'Token is valid!', userId: req.userId });
    });

module.exports = router;