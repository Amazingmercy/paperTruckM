const express = require('express')
const router = express.Router()
const {login, loginPage, register, registerPage, forgetPassword, forgetPasswordPage, resetPassword, updatePassword, updatePasswordPage, logout} = require('../controllers/auth')
const validate = require('../middlewares/validate')

router.route('/login').get(loginPage)
router.route('/login').post(login)
router.route('/').get(registerPage)
router.route('/register').post(validate, register)
router.route('/forgetPassword').get(forgetPasswordPage)
router.route('/forgetPassword').post(forgetPassword)
router.route('/resetPassword').get(resetPassword)
router.route('/updatePassword/:token').get(updatePasswordPage)
router.route('/updatePassword/:token').post(updatePassword)
router.route('/logout').post(logout)


module.exports = router;