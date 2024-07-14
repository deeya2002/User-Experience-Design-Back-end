const Contactus = require("../model/contactModel");
const mongoose = require('mongoose');


const createcontact = async (req, res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // step 2 : Destructuring data
    const {
        fullname,
        email,
        number,
        message
    } = req.body;

    // step 3 : Validate data
    if (!fullname || !email || !number || !message) {
        return res.json({
            success: false,
            message: "Please fill all the fields"
        })
    }

    try {
        const newcontact = new Contactus({
            fullname: fullname,
            email: email,
            number: number,
            message: message,
        })
        await newcontact.save();
        res.json({
            success: true,
            message: "Feedback is send successfully",
            contact: newcontact
        })



    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}


module.exports = {
    createcontact,
};