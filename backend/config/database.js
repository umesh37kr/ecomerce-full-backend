const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: "backend/.env"});

function connectDB() {
    // database connection
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const connection = mongoose.connection
    // try{ 
    connection.once('open', () => {
        console.log('Database connected')
    })
    // }catch(err) {
    //     console.log(err)
    //     console.log('connection failed')
    // }
}
module.exports = connectDB