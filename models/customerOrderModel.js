const {Schema, model} = require('mongoose')

const customerOrder = new Schema({
    customerId: {type: Schema.ObjectId, required: true},
    products: {type: Array, required: true},
    price: {type: Number, required: true},
    payment_status: {type:String, require: true},
    // items: {type:Number, require: true},
    shippingInfo: {type:Object, require: true},
    delivery_status: {type:String, require: true},
    date: {type:String, required: true}
},{timestamps: true})

module.exports = model('customerOrders',customerOrder)