const Order = require('../models/order-model')
const Product = require('../models/product-model')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require("../middleware/catchAsyncError")

// create new order
exports.newOrder = catchAsyncError(async(req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(201).json({
        success: true,
        order
    })
})

// get single order
exports.getSingleOrder = catchAsyncError(async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    )

    if(!order) {
        return next(new ErrorHandler("order not found with this id", 404))
    }

    res.status(200).json({
        status: true,
        order
    })
})

// get logged in user order
exports.myOrder = catchAsyncError(async(req, res, next) => {

    const order = await Order.find({user: req.user._id})

    res.status(200).json({
        status: true,
        order
    })
})

// get all orders --Admin
exports.getAllOrders = catchAsyncError(async(req, res, next) => {
    
    const orders = await Order.find()

    let Totalamount= 0;

    orders.forEach(order => {
        Totalamount += order.totalPrice
    })
    res.status(200).json({
        status: true,
        Totalamount,
        orders
    })
})

// update order status -- Admin
exports.updateOrder = catchAsyncError(async(req, res, next) => {
    
    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHandler("order not found with this id", 404))
    }

    if (order.orderStatus === 'Delivered'){
        return next(new ErrorHandler("you have delivered this order", 400))
    }

    order.orderItems.forEach(async(order) => {
        await updateStock(order.product, order.quantity)
    })

    order.orderStatus = req.body.status;

    if(req.body.status === 'Delivered'){
        order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        status: true,
    })
})

async function updateStock(id, qty){
    const product = await Product.findById(id);

    product.stock -= qty
    await product.save({ validateBeforeSave: false });
}

// delete order -- admin
exports.deleteOrder = catchAsyncError(async(req, res, next) => {

    const order = await Order.findById(req.params.id)
    if(!order) {
        return next(new ErrorHandler("order not found with this id", 404))
    }
    await order.remove()
    res.status(200).json({
        status: true,
    })
})