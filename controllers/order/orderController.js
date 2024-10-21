const moment = require("moment")
const authOrderModel = require("../../models/authOrderModel")
const customerOrderModel = require("../../models/customerOrderModel")
const cartModel = require("../../models/cartModel")
const { createToken } = require("../../utils/createToken")
const { responseReturn } = require("../../utils/response")

// const {mongo: {ObjectId}} = require('mongoose')
const { ObjectId } = require('mongodb'); 


class orderController{
    paymentCheck = async(id) => {
        try {
            const order = await customerOrderModel.findById(id)
            if (order.payment_status === 'unpaid') {
                await customerOrderModel.findByIdAndUpdate(id, {
                    delivery_status: 'cancelled'
                })
                await authOrderModel.updateMany({
                    orderId: id
                },{
                    delivery_status: 'cancelled'
                })
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    //End Method


    place_order = async(req, res) => {
        const {price, products, shipping_fee, shippingInfo, userId} = req.body
        let authorOrderData = []
        let cartId = []
        const tempDate = moment(Date.now()).format('LLL')
        let customerOrderProduct = []
        for (let i = 0; i < products.length; i++) {
            const pro = products[i].products
            for (let j = 0; j < pro.length; j++) {
                const tempCusPro = pro[j].productInfo
                tempCusPro.quantity = pro[j].quantity
                customerOrderProduct.push(tempCusPro)
                if (pro[j]._id) {
                    cartId.push(pro[j]._id)
                }
            }
            
        }
        try {
            const order = await customerOrderModel.create({
                customerId: userId,shippingInfo,
                products: customerOrderProduct,
                price: price + shipping_fee,
                payment_status: 'unpaid',
                delivery_status: 'pending',
                date: tempDate
            })
            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products
                const pri = products[i].price
                const sellerId = products[i].sellerId
                let storePor = []
                for (let j = 0; j < pro.length; j++) {
                    const tempPro = pro[j].productInfo
                    tempPro.quantity = pro[j].quantity
                    storePor.push(tempPro)
                }
                authorOrderData.push({
                    orderId: order.id,sellerId,
                    products: storePor,
                    price: pri,
                    payment_status: 'unpaid',
                    shippingInfo: 'GleamStreet Warehouse',
                    delivery_status: 'pending',
                    date: tempDate
                })
                
            } 
            await authOrderModel.insertMany(authorOrderData)
            // for (let k = 0; k < cartId.length; k++) {
            //     await  cartModel.findByIdAndDelete(cartId[k])  
            // }
            for (let k = 0; k < cartId.length; k++) {
                try {
                    await cartModel.findByIdAndDelete(cartId[k]);
                } catch (error) {
                    console.log(`Error deleting cart item with id: ${cartId[k]}`, error);
                }
            }
            
            setTimeout(() => {
                this.paymentCheck(order.id)
            }, 15000)
            responseReturn(res, 200, {message: "Order Placed Successfully", orderId: order.id})
        } catch (error) {
            console.log(error.message)
        }
    }
    //End Method

    get_customer_dashboard_data = async(req, res) => {
         const {userId} = req.params
         try {
           const recentOrders =  await customerOrderModel.find({
                customerId: new ObjectId(userId)
           }).limit(5)
           const pendingOrder =  await customerOrderModel.find({
                customerId: new ObjectId(userId), delivery_status: 'pending'
           }).countDocuments()
           const totalOrder =  await customerOrderModel.find({
                customerId: new ObjectId(userId)
           }).countDocuments()
           const cancelledOrder =  await customerOrderModel.find({
                customerId: new ObjectId(userId), delivery_status: 'cancelled'
           }).countDocuments()
           responseReturn(res, 200, {
             recentOrders,
             pendingOrder,
             totalOrder,
             cancelledOrder
           })
         } catch (error) {
            console.log(error.message)
         }
    }

   
}

module.exports = new orderController()