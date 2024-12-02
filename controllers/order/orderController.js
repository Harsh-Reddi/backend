const moment = require("moment")
const authOrderModel = require("../../models/authOrderModel")
const customerOrderModel = require("../../models/customerOrderModel")
const cartModel = require("../../models/cartModel")
const { createToken } = require("../../utils/createToken")
const { responseReturn } = require("../../utils/response")
const stripe = require('stripe')('sk_test_51QRb0qLuBdeUEIIz77vBRXNHCKVMnxDluqa5uyub1o9l7anlJAdc2r1MGVsQelVercm3Wz6nmHNtlkRbjasskErf00fVqMUPyG')
const myShopWallet = require('../../models/myShopWallet')
const sellerWallet = require('../../models/sellerWallet')

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
    //End Method

    get_orders = async(req, res) => {
        const {customerId, status} = req.params
        try {
            let orders = []
            if (status !== 'all') {
                orders = await customerOrderModel.find({
                    customerId: new ObjectId(customerId), 
                    delivery_status: status
                })
            } else {
                orders = await customerOrderModel.find({
                    customerId: new ObjectId(customerId)
                })
            }
            responseReturn(res, 200, {orders})
        } catch (error) {
            console.log(error.message)
        }
    }
    //End Method

    get_order_details = async(req, res) => {
        const {orderId} = req.params
        try {
            const order = await customerOrderModel.findById(orderId)
            responseReturn(res, 200, {order})
        } catch (error) {
            console.log(error.message)
        }
    }
   //End Method

   get_admin_orders = async(req, res) => {
    let {page,searchValue,parPage} = req.query
    page = parseInt(page)
    parPage= parseInt(parPage)
    const skipPage = parPage * (page - 1)
    try {
        if (searchValue) {
            
        } else {
            const orders = await customerOrderModel.aggregate([
                {
                    $lookup: {
                        from: 'authororders',
                        localField: "_id",
                        foreignField: 'orderId',
                        as: 'suborder'
                    }
                }
            ]).skip(skipPage).limit(parPage).sort({ createdAt: -1})
            const totalOrder = await customerOrderModel.aggregate([
                {
                    $lookup: {
                        from: 'authororders',
                        localField: "_id",
                        foreignField: 'orderId',
                        as: 'suborder'
                    }
                }
            ])
            responseReturn(res,200, { orders, totalOrder: totalOrder.length })
        }
    } catch (error) {
        console.log(error.message)
    } 
 }
  // End Method 

  get_admin_order = async (req, res) => {
    const { orderId } = req.params
    try {
        const order = await customerOrderModel.aggregate([
            {
                $match: {_id: new ObjectId(orderId)}
            },
            {
                $lookup: {
                    from: 'authororders',
                    localField: "_id",
                    foreignField: 'orderId',
                    as: 'suborder'
                }
            }
        ])
        responseReturn(res,200, { order: order[0] })
    } catch (error) {
        console.log('get admin order details' + ' '+ error.message)
    }
  }
  //End Method

  admin_order_status_update = async(req, res) => {
    const { orderId } = req.params
    const { status } = req.body
    try {
        await customerOrderModel.findByIdAndUpdate(orderId, {
            delivery_status : status
        })
        responseReturn(res,200, {message: 'order Status change success'})
    } catch (error) {
        console.log('get admin status error' + error.message)
        responseReturn(res,500, {message: 'internal server error'})
    }
     
  }
  // End Method 

  get_seller_orders = async (req,res) => {
    const {sellerId} = req.params
    let {page,searchValue,parPage} = req.query
    page = parseInt(page)
    parPage= parseInt(parPage)
    const skipPage = parPage * (page - 1)
    try {
        if (searchValue) {

        } else {
            const orders = await authOrderModel.find({
                sellerId,
            }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
            const totalOrder = await authOrderModel.find({
                sellerId
            }).countDocuments()
            responseReturn(res,200, {orders,totalOrder})
        }
        
    } catch (error) {
        console.log('get seller Order error' + error.message)
        responseReturn(res,500, {message: 'internal server error'})
    }
}
// End Method 

get_seller_order = async (req,res) => {
    const { orderId } = req.params
    try {
        const order = await authOrderModel.findById(orderId)
        responseReturn(res, 200, { order })
    } catch (error) {
        console.log('get seller details error' + error.message)
    }
  }
  // End Method

  seller_order_status_update = async(req,res) => {
    const {orderId} = req.params
    const { status } = req.body
    try {
        await authOrderModel.findByIdAndUpdate(orderId,{
            delivery_status: status
        })
        responseReturn(res,200, {message: 'order status updated successfully'})
    } catch (error) {
        console.log('get seller Order error' + ' ' + error.message)
        responseReturn(res,500, {message: 'internal server error'})
    }
  }
  // End Method 

  create_payment = async (req, res) => {
    const { price } = req.body
    try {
        const payment = await stripe.paymentIntents.create({
            amount: price * 100,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true
            }
        })
        responseReturn(res, 200, { clientSecret: payment.client_secret })
    } catch (error) {
        console.log(error.message)
    }
  }
  // End Method 

  order_confirm = async (req,res) => {
    const {orderId} = req.params
    try {
        await customerOrderModel.findByIdAndUpdate(orderId, { payment_status: 'paid', delivery_status: 'pending' })
        await authOrderModel.updateMany({ orderId: new ObjectId(orderId)},{
            payment_status: 'paid', delivery_status: 'pending'  
        })
        const cuOrder = await customerOrderModel.findById(orderId)
        const auOrder = await authOrderModel.find({
            orderId: new ObjectId(orderId)
        })
        const time = moment(Date.now()).format('l')
        const splitTime = time.split('/')
        await myShopWallet.create({
            amount: cuOrder.price,
            month: splitTime[0],
            year: splitTime[2]
        })
        for (let i = 0; i < auOrder.length; i++) {
             await sellerWallet.create({
                sellerId: auOrder[i].sellerId.toString(),
                amount: auOrder[i].price,
                month: splitTime[0],
                year: splitTime[2]
             }) 
        }
        responseReturn(res, 200, {message: 'success'}) 

    } catch (error) {
        console.log(error.message)
    }
  }

}

module.exports = new orderController()