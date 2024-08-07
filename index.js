//importing packages
const express = require('express');
const dotenv = require('dotenv');
const connectToDB = require('./database/db');
const cors = require('cors');
const acceptMultimedia = require('connect-multiparty')
const cloudinary = require('cloudinary')
// making express app
const app = express();

// configuring dotenv
dotenv.config();

//cloudinary config          
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUNDINARY_API_SECRET,
});

app.use(acceptMultimedia())

//cors config to accept request from frontend
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsOptions))

//connect to database
connectToDB();

//Accepting json data
app.use(express.json());


//creating test route 
app.get("/test", (req, res) => {
    res.status(200).send("Hello from server");
})

//defining auth routes
app.use('/api/auth', require('./routes/authroutes'));

//defining user routes
app.use('/api/user', require('./routes/userroutes'));

//defining journal routes
app.use('/api/journal', require('./routes/journalroutes'));

//defining journal routes
app.use('/api/comment', require('./routes/commentRoute'));

app.use('/api/feedback', require('./routes/contactroutes'));
const PORT = process.env.PORT;

app.listen(PORT, () => {

    console.log(`server is running on port ${PORT}`)

});

//exporting app
module.exports = app;