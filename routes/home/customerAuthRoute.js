const customerauthController = require('../../controllers/home/customerauthController')

const router = require('express').Router()


router.post('/customer/customer-register',customerauthController.customer_register)
router.post('/customer/customer-login',customerauthController.customer_login)
router.get('/customer/logout',customerauthController.customer_logout)

module.exports = router