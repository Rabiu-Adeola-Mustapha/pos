require("dotenv").config();
const mongoose = require('mongoose');
const config = require('./config')



const dbConnect = async () => {

    try {
       const connect = await mongoose.connect(config.databaseURI) ;
       console.log(`MongoDB Connected: ${connect.connection.host}`) ;
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit() ;
    }
}


module.exports = dbConnect ;