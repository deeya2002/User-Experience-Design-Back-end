const mongoose = require('mongoose');
const Users = require("../model/usermodel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const middleware = require("../middleware/authGuard")
const { mailConfig, resetCode } = require("../utils/resetPassword")
const ResetCode = require("../model/resetCodeModel");
const { asyncHandler } = require('../middleware/async');

const createUser = async (req, res) => {
    // step 1 : Check if data is coming or not
    console.log(req.body);

    // step 2 : Destructure the data
    const { fullName, userName, email, password } = req.body;

    // step 3 : validate the incomming data
    if (!fullName || !userName || !email || !password) {
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
            fullName: fullName,
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
        res.status(500).json("Server create Error")
    }


}
// const loginUser = async (req, res) => {
//     //step 1: check incoming data
//     console.log(req.body)
//     // step 2 : validation
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return res.json({
//             success: false,
//             message: "Please enter all fields."
//         })
//     }
//     //try catch block
//     try {
//         //finding user
//         const user = await Users.findOne({ email: email })
//         if (!user) {
//             return res.json({
//                 success: fasle,
//                 message: "User does not exists"
//             })
//         }
//         //comparing password
//         const databasePassword = user.password;
//         const isMatched = await bcrypt.compare(password, databasePassword)
//         if (!isMatched) {
//             return res.json({
//                 success: fasle,
//                 message: "Invalid credentials"
//             })
//         }
//         //creating token
//         const token = await jwt.sign(
//             { id: user._id, isAdmin: user.isAdmin },
//             process.env.JWT_SECRET
//         )

//         //response
//         res.status(200).json({
//             success: true,
//             message: "User Logged in Successfully.",
//             token: token,
//             userData: user
//         })

//     }
//     catch (error) {
//         return res.json({
//             success: false,
//             message: "Servor login Error",
//             error: error
//         })
//     }
// }
const loginUser = async (req, res) => {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields."
        });
    }

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User does not exist."
            });
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            token,
            userData: user
        });

    } catch (error) {
        console.error("Error during login:", error); // Log the error details on the server side
        res.status(500).json({
            success: false,
            message: "Server login error.",
            error: error.message // Include the error message in the response
        });
    }
};

const getSingleUser = async (req, res) => {
    const userId = req.user.id;
    try {
        const singleuser = await Users.findById(userId);
        if (singleuser) {
            return res.json({
                success: true,
                message: "User retrieved successfully",
                userProfile: {
                    id: singleuser.id,
                    fullName: singleuser.fullName,
                    userName: singleuser.userName,
                    email: singleuser.email,
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server single user Error: " + error
        });
    }
};

//update the user
const updateUser = async (req, res) => {
    const userId = req.user.id;
    const UserData = req.body;
    try {
        const user = await Users.findOne({ _id: userId });
        if (user) {
            await Users.findByIdAndUpdate({
                _id: userId
            }, UserData);
        } else {
            return res.json({
                success: false,
                message: "User doesnot exist."
            })
        }
        return res.json({
            success: true,
            message: "User updated."
        })
    } catch (error) {
        return res.json({
            success: false,
            message: "Server Error " + error

        })
    }

}

//send email to the user
const resetPassword = async (req, res) => {
    const UserData = req.body;
    console.log(UserData)
    const user = await Users.findOne({ email: UserData?.email });
    const OTP = resetCode;
    console.log(user.id);
    console.log(OTP);
    await ResetCode.findOneAndUpdate({
        userId: user.id
    }, {
        resetCode: OTP
    }, { upsert: true })
    console.log(user);
    const MailConfig = mailConfig();

    const mailOptions = {
        from: 'Food Rush',
        to: UserData?.email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${OTP}`
    };

    try {
        await MailConfig.sendMail(mailOptions);
        return res.json({
            success: true,
            message: "Reset code email sent successfully!"
        })
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: 'Error sending reset code email:' + error.message,
        })
    }
}

//verify the code
const verifyResetCode = async (req, res) => {

    const { resetCode, email } = req.body;
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found with the provided email."
            });
        } else {
            const savedResetCode = await ResetCode.findOne({ userId: user._id });
            if (!savedResetCode || savedResetCode.resetCode != resetCode) {
                return res.json({
                    success: false,
                    message: "Invalid reset code."
                });
            } else {
                return res.json({
                    success: true,
                    message: "Reset code verified successfully."
                });
            }
        }
    } catch (error) {
        console.error("Error in verifyResetCode:", error);
        return res.json({
            success: false,
            message: 'Server Error: ' + error.message,
        });
    }
};


//update password
const updatePassword = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Update the user's password
        const randomSalt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, randomSalt);

        await Users.findOneAndUpdate({ email }, { password: encryptedPassword });

        return res.json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: 'Server Error: ' + error.message,
        });
    }
};

const uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send({ message: "Please upload a file" });
    }
    res.status(200).json({
        success: true,
        data: req.file.filename,
    });
});

module.exports = {
    createUser,
    loginUser,
    updateUser,
    resetPassword,
    verifyResetCode,
    updatePassword,
    getSingleUser,
    uploadImage
}