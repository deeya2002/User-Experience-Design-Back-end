//import(if needed) done
const mongoose = require('mongoose');

//list of functions
const connectToDB = () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log("connected to database");
    })
}

//export 
module.exports = connectToDB;