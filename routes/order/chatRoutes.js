const chatController = require('../../controllers/order/chatController')
const router = require('express').Router()


router.post('/chat/customer/add-customer-friend',chatController.add_friend)
router.post('/chat/customer/send-message-seller',chatController.customer_message_add)
module.exports = router