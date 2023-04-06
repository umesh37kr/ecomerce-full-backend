const Errorhandler = require('../utils/Errorhandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error"

    // wrong mongodb id error
    if(err.name === "CastError"){
        const message = `Resource not found invalid ${err.path}`
        err = new Errorhandler(message, 400)
    }

    // mongoose duplicate key errors
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new Errorhandler(message, 400)
    }

    // wrong jwt error
    if(err.name === "JsonWebTokenError"){
        const message = `json web token is invalid, try again`
        err = new Errorhandler(message, 400)
    }

    //  jwt expire error
    if(err.name === "TokenExpiredError"){
        const message = `json web token is expired, try again`
        err = new Errorhandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}