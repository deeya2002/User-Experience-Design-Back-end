const nodemailer = require('nodemailer');

// Generate a random reset code between 1000 and 9000
const resetCode = Math.floor(1000 + Math.random() * 8000);

// Function 
const mailConfig = () => {
    console.log(process.env.USEREMAIL);
    console.log(process.env.PASSWORD);

    // Create Nodemailer transporter using Gmail service 
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USEREMAIL, 
            pass: process.env.PASSWORD, 
        },
    });

   
    return transporter;
} 


module.exports = {
    resetCode,
    mailConfig
}