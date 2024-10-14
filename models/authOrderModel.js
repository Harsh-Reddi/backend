const {Schema, model} = require('mongoose')

const authSchema = new Schema({
    orderId: {type: Schema.ObjectId, required: true},
    sellerId: {type: Schema.ObjectId, required: true},
    products: {type: Array, required: true},
    price: {type: Number, required: true},
    payment_status: {type:String, require: true},
    // items: {type:Number, require: true},
    shippingInfo: {type:String, require: true},
    delivery_status: {type:String, require: true},
    date: {type:String, required: true}
},{timestamps: true})

module.exports = model('authorOrders',authSchema)