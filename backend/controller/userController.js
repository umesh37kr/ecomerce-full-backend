const User = require('../models/user-model')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require("../middleware/catchAsyncError")
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

// register user
exports.registerUser = catchAsyncError(async(req, res, next) => {
    const {name, email, password} = req.body;
    const user = await User.create({
        name,
        email,
        password: password,
        avatar: {
            public_id: 'this is public id',
            url: "this is sample url"
        }
    });
    sendToken(user, 200, res)
})

// Login User
exports.login = catchAsyncError(async(req, res, next) => {
    const {email, password} = req.body
    if(!email || !password){
        return next(new ErrorHandler("please enter user name and password", 400))
    }
    const user = await User.findOne({ email }).select("+password")
    if(!user){
        return next(new ErrorHandler("username or password is invalid", 401))
    }

    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler("username or password is invalid", 401))
    }
    sendToken(user, 200, res)
})

// logout user
exports.logout = catchAsyncError(async(req, res, next) => {
    res.cookie("token", null, { 
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({success: true, message: "User logged out"})
})

//  forgot password 
exports.forgotPassword = catchAsyncError(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new ErrorHandler("user not found", 404))
    }
    // get reset password Token
    const resetToken = await user.getResetPasswordToken()
     await user.save({ validationBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/password/reset/${resetToken}`

    const message = `your password reset token is :- ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce password recovery`,
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })

    } catch (error) {
        console.log(error)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
    }

})

// reset password
exports.resetPassword = catchAsyncError(async(req, res, next) =>{
    // creating has token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex"); 
     
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })
    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()
    
    sendToken(user, 200, res)
})

// get user Details
exports.getUserDeatils = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

// update user password
exports.updatePassword = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect", 401))
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match", 400))
    }

    user.password = req.body.newPassword
    await user.save()

    sendToken(user, 200, res)
})

// update user profile
exports.updateUserProfile = catchAsyncError(async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }
    // here we will add cloudanry for avatar

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
    })
})

// get all user list admin
exports.getAllUser = catchAsyncError(async(req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

// get single user admin
exports.getSingleUser = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(`user does not exist with this id: ${req.params.id}`,404))
    }
    res.status(200).json({
        success: true,
        user
    })
})

// update user role -- Admin
exports.updateUserRole = catchAsyncError(async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators: true,
        useFindAndModify: false,
    })

    if(!user){
        return next(new ErrorHandler(`user does not exist with this id: ${req.params.id}`,404))
    }

    res.status(200).json({
        success: true,
        message: "user role updated"
    })
})

// delete user --Admin
exports.deleteUser = catchAsyncError(async(req, res, next) => {

const user = await User.findById(req.params.id)
 if(!user){
        return next(new ErrorHandler(`user does not exist with this id: ${req.params.id}`,404))
    }

     await user.remove()

    res.status(200).json({
        success: true,
        message: "user deleted successfully"
    })
})