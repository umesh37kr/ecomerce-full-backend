const mongoose = require('mongoose');
const User = require('./user-model')
const productSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please enter the name']
    },
    description: {
        type: String,
        required: [true, 'please enter the description']
    },
    price:{
        type: Number,
        required: [true, 'please enter product price']
    },
    ratings: {
        type: Number,
        default: 0
    },
    images:[
        {
            public_id:{
                type: String,
                required: true,
            } ,
            url:{
                type: String,
                required: true,
            }
        }
    ],
    category:{
        type: String,
        required: [true, 'please enter category']
    },
    stock: {
        type: Number,
        required: [true, 'please enter product stock'],
        maxLength: [4, 'stock can not exceed 4 count'],
        default: 1
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        { 
            user: {
                type: mongoose.Schema.ObjectId,
                ref: User,
                required: true
            },
            name:{
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            },
            comment:{
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: User,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema)