const formidable = require("formidable")
const {responseReturn} = require("../../utils/response")
const cloudinary = require('cloudinary').v2
const sellerModel = require('../../models/sellerModel')

class sellerController{

    get_seller_request = async(req,res) => {
        // console.log(req.query)
        const {page, searchValue, parPage} = req.query
        const skipPage = parseInt(parPage) * (parseInt(page) - 1)
        try {
            if (searchValue) {
                
            } else {
                const sellers = await sellerModel.find({status: 'pending'}).skip(skipPage).limit(parPage).sort({createdAt: -1})
                const totalSeller = await sellerModel.find({  }).countDocuments()
                responseReturn(res, 200, {sellers, totalSeller})
            }
        } catch (error) {
            
            responseReturn(res, 500, {message: error.message})
        }
    }
    //End Method

    get_seller = async(req,res) => {
        const {sellerId} = req.params
        try {
            const seller = await sellerModel.findById(sellerId)
            responseReturn(res, 200, {seller})
        } catch (error) {
            responseReturn(res, 500, {error: error.message})
        }
    }
    //End Method

    seller_status_update = async(req, res) => {
        const {sellerId, status} = req.body
        try {
            await sellerModel.findByIdAndUpdate(sellerId, {status})
            const seller = await sellerModel.findById(sellerId)
            responseReturn(res, 200, {seller, message: 'Seller Status Update Successfully'})
        } catch (error) {
            responseReturn(res, 500, {error: error.message})
        }
    }

}

module.exports = new sellerController()