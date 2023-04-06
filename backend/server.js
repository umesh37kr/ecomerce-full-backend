const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const routes = require('./routes/index');
const errorMiddleware = require('./middleware/error')
const db = require('./config/database');
const cookieParser = require('cookie-parser');
// Handling uncaught exceptions errors
process.on('uncaughtException', err =>{
    console.log(`Error: ${err.message}`)
    console.log("server is sutting down due to uncaught exception error")
    process.exit(1)
})
db()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/api', routes)

// middlewares for error handlers.
app.use(errorMiddleware)

const server = app.listen(PORT, () =>{
    console.log(`app is listening on ${PORT}`)
});

// unhandled promise rejection
process.on("unhandledRejection", err =>{
    console.log(`Error: ${err.message}`)
    console.log("server is sutting down due to unhandled promise rejection")
    server.close(() =>{
        process.exit(1)
    })
})