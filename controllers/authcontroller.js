const mongoose = require('mongoose');
const Users = require("../model/usermodel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const createUser = async (req, res) => {
    // step 1 : Check if data is coming or not
    console.log(req.body);

    // step 2 : Destructure the data
    const { fullname, userName, email, password } = req.body;

    // step 3 : validate the incomming data
    if (!fullname || !userName || !email || !password) {
        return res.json({
            success: false,
            message: "Please enter all the fields."
        })
    }

    // step 4 : try catch block
    try {
        // step 5 : Check existing user
        const existingUser = await Users.findOne({ email: email })
        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists."
            })
        }

        // password encryption
        const randomSalt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, randomSalt)

        // step 6 : create new user
        const newUser = new Users({
            // fieldname : incomming data name
            fullname: fullname,
            userName: userName,
            email: email,
            password: encryptedPassword,
        })

        // step 7 : save user and response
        await newUser.save();
        res.status(200).json({
            success: true,
            message: "User created successfully."
        })


    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }


}
const loginUser = async (req, res) => {
    //step 1: check incoming data
    console.log(req.body)
    // step 2 : validation
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({
            success: false,
            message: "Please enter all fields."
        })
    }
    //try catch block
    try {
        //finding user
        const user = await Users.findOne({ email: email })
        if (!user) {
            return res.json({
                success: fasle,
                message: "User does not exists"
            })
        }
        //comparing password
        const databasePassword = user.password;
        const isMatched = await bcrypt.compare(password, databasePassword)
        if (!isMatched) {
            return res.json({
                success: fasle,
                message: "Invalid credentials"
            })
        }
        //creating token
        const token = await jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET
        )

        //response
        res.status(200).json({
            success: true,
            message: "User Logged in Successfully.",
            token: token,
            userData: user
        })

    }
    catch (error) {
        return res.json({
            success: false,
            message: "Servor Error",
            error: error
        })
    }
}
module.exports = {
    createUser,
    loginUser
}