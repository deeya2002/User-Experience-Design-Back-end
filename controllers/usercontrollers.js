const mongoose = require('mongoose');
const Users = require("../model/usermodel")
const bcrypt = require("bcrypt")
const { mailConfig, resetCode } = require("../utils/resetPassword")
const ResetCode = require("../model/resetCodeModel");
const { asyncHandler } = require('../middleware/async');

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
                    firstName: singleuser.firstName,
                    lastName: singleuser.lastName,
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
            message: "Server Error: " + error
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

const Follow = require('../model/usermodel'); // Adjust import if needed

// Follow a user
const followUser = async (req, res) => {
    const followerId = req.user.id;
    const { followingId } = req.body;

    try {
        const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message: 'Already following this user.'
            });
        }

        const follow = new Follow({ follower: followerId, following: followingId });
        await follow.save();

        return res.json({
            success: true,
            message: 'User followed successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error: ' + error.message
        });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    const followerId = req.user.id;
    const { followingId } = req.body;

    try {
        const follow = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
        if (!follow) {
            return res.status(400).json({
                success: false,
                message: 'Not following this user.'
            });
        }

        return res.json({
            success: true,
            message: 'User unfollowed successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error: ' + error.message
        });
    }
};

const searchUser = async (req, res) => {
    console.log("hello")
    try {
        // Get the search query from the request
        const { username } = req.query;
        console.log(username)
        // Find users matching the username with a regex pattern
        const users = await Users.find({
            fullName: username//{ $regex: username, $options: 'i' } // Case-insensitive search
        })
        console.log(users)
        // .limit(10) // Limit the results to 10 users
        // .select("fullname username "); // Select only necessary fields

        if (users.length > 0) {
            res.json({
                success: true,
                users
            });
        } else {
            res.json({
                success: false,

            });

        }
    } catch (err) {
        // Handle errors
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};



module.exports = {
    updateUser,
    resetPassword,
    verifyResetCode,
    updatePassword,
    getSingleUser,
    uploadImage,
    followUser,
    unfollowUser,
    searchUser
}