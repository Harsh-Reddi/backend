const chatController = require('../../controllers/order/chatController')
const { authMiddleware } = require('../../middlewares/authMiddleware')
const router = require('express').Router()


router.post('/chat/customer/add-customer-friend',chatController.add_friend)
router.post('/chat/customer/send-message-seller',chatController.customer_message_add)
router.get('/chat/seller/get-customers/:sellerId',chatController.get_customers)
router.get('/chat/seller/get-customer-message/:customerId',authMiddleware, chatController.get_customer_message)
module.exports = router
