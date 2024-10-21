const {Schema, model} = require('mongoose')

const wishlistSchema = new Schema({
    userId: {type: String, required: true},
    productId: {type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    slug: {type: String, required: true},
    discount: {type: Number, required: true},
    image: {type: Array, required: true},
    rating: {type: Number, default: 0}
},{timestamps: true})


module.exports = model('wishlists',wishlistSchema)