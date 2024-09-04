const homeController = require('../../controllers/home/homeController')

const router = require('express').Router()


router.get('/get-categories',homeController.get_categories)
router.get('/get-products',homeController.get_products)

module.exports = router