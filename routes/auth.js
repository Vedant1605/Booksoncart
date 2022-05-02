const express = require('express');
const { check, body } = require('express-validator');
const User = require('../models/user');

const authController = require('../controllers/auth');
const router = express.Router();

router.get('/login', authController.getLogin)
router.post('/login', check('email').isEmail().withMessage('Please Enter Vaild Email').custom(value => {
    return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
            return Promise.reject('Enter Valid Email')
        }
    });
}), authController.postLogin)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignUp)
router.post('/signup',
    check('email').isEmail().withMessage('Please Enter Vaild Email').custom(value => {
        return User.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-mail already exists')
            }
        });
    }),
    check('password', 'Please Enter Vaild password').isLength({ min: 6, max: 10 }),
    check('confirmpassword').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error(`Password Did'nt matched`)
        }
        return true ;
    })
    , authController.postSignUp)

router.get('/reset', authController.getPasswordReset)
router.post('/reset', authController.postPasswordReset)

router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password',
    check('password', 'Please Enter Vaild password').isLength({ min: 6, max: 10 }).isAlphanumeric(),
    body('confirmpassword').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error(`Password Did'nt matched`)
        }
        return true
    })
    , authController.postNewPassword)


module.exports = router