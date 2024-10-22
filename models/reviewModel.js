const {Schema, model} = require('mongoose')

const reviewSchema = new Schema({
    name: {type: String, required: true},
    productId: {type: Schema.ObjectId, required: true},
    review: {type: String, required: true},
    rating: {type: Number, required: true, default: 0},
    date: {type: String, required: true}
},{timestamps: true})

module.exports = model('reviews',reviewSchema)