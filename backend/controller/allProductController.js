const Product = require('../models/product-model')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require("../middleware/catchAsyncError")
const ApiFilter = require('../utils/apiFilter')

// create product --admin
exports.createProduct = catchAsyncError(async(req, res, next) =>{
    req.body.user = req.user.id
    // console.log(req.body)
    const product = await Product.create(req.body)
    res.status(200).json({
        success: true,
        product: product
    })
})

// get all product
exports.allProduct = catchAsyncError(async(req, res, next) =>{
    const resultPerPage = 5
   const apiFilter = new ApiFilter(Product.find(), req.query)
   .search()
   .filter()
   .pagination(resultPerPage);
   const product = await apiFilter.query;
   res.status(201).json({
    count: product.length, 
    success: true,
    product: product
   })
})

// get single product details
exports.singleProduct = catchAsyncError(async(req, res, next) => {
    let product = await Product.findById(req.params.id)
    if(!product) {
        return next(new ErrorHandler('product not found', 404))
        res.status(500).json({success: false, message: "product not found"})
    }
    res.status(200).json({success: true, product})
})

// update product --admin
exports.updateProduct = catchAsyncError(async(req, res, next) => {
    let product = await Product.findById(req.params.id)
    if(!product) {
        res.status(500).json({success: false, message: "product not found"})
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({success: true, product: product})
})

// delete product --Admin
exports.deleteProduct = catchAsyncError(async(req, res, next) => {
    let product = await Product.findByIdAndDelete(req.params.id)
    if(!product) {
        res.status(500).json({success: false, message: "product not found"})
    }
    res.status(200).json({success: true, message: "product deleted"})
})

// create new review or update review
exports.createProductReview = catchAsyncError(async(req, res, next) => {
    const { rating, comment, productId } = req.body
    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment: comment
    }

    const product = await Product.findById(productId);
     
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if(isReviewed) {
        product.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment);
        })
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;
    product.ratings = product.reviews.forEach((rev) =>{
        avg += rev.rating
    }) / product.reviews.length
    product.ratings = avg / product.reviews.length
    await product.save({ validateBeforeSave: false});
    res.status(200).json({
        success: true,
    })

})

// get all review of a product
exports.getProductReviews = catchAsyncError(async(req, res, next) => {
    const product = await Product.findById(req.query.id)
    if(!product) {
        res.status(500).json({success: false, message: "product not found"})
    }
    res.status(200).json({success: true, reviews: product.reviews})
})

// delete product review
exports.deleteProductReviews = catchAsyncError(async(req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if(!product) {
        res.status(500).json({success: false, message: "product not found"})
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    )
    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating
    })

    const ratings = avg / reviews.length
    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
        );

    res.status(200).json({success: true})    
})