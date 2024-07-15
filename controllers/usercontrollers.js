const mongoose = require('mongoose');
const cloudinary = require("cloudinary");
const Users = require("../model/usermodel")
const bcrypt = require("bcrypt")
const { mailConfig, resetCode } = require("../utils/resetPassword")
const ResetCode = require("../model/resetCodeModel");
const { asyncHandler } = require('../middleware/async');

const getSingleUser = async (req, res) => {
    const userId = req.body.userId;
    console.log("data is ", userId)
    try {
        const singleuser = await Users.findById(userId);
        console.log(singleuser)
        if (singleuser) {
            return res.json({
                success: true,
                message: "User retrieved successfully",
                singleuser
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

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        // Step 1: Check incoming data
        console.log(req.body);
        console.log(req.files);

        // Destructuring data
        const {
            fullname,
            userName,
            email,
            number,
            location,
            bio,
            occupation
        } = req.body;
        const { userImage } = req.files;

        // Validate required fields
        if (!fullname || !email) {
            return res.json({
                success: false,
                message: "Full name and email are required fields!",
            });
        }

        // Prepare updated data
        let updatedData = {
            fullname,
            userName,
            email,
            number,
            location,
            bio,
            occupation,
            updatedAt: new Date() // Update timestamp
        };

        if (userImage) {
            // Upload image to Cloudinary
            const uploadedImage = await cloudinary.uploader.upload(userImage.path, {
                folder: "user_profiles",
                crop: "scale",
            });
            updatedData.userImageUrl = uploadedImage.secure_url;
        }

        // Find user and update
        const userId = req.params.id;
        const updatedUser = await Users.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User profile updated successfully!",
            updatedUser,
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//send email to the user
const resetPassword = async (req, res) => {
    const UserData = req.body;
    console.log(UserData)
    const user = await Users.findOne({ email: UserData?.email });
if(!user){
          return res.json({
            success: false,
            message: "User Not Found"
        })
}
    const OTP = resetCode;
    console.log(OTP);
    console.log(user)
    await ResetCode.findOneAndUpdate({
        userId: user._id

    }, {
        resetCode: OTP
    }, { upsert: true })
    console.log(user);
    const MailConfig = mailConfig();

    const mailOptions = {
        from: 'Travel Log',
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

const followUser = async (req, res) => {
    const { followeeId } = req.body;
    const userId = req.user.id
    try {
        const follower = await Users.findById(userId);
        if (!follower) {
            return res.status(404).json({ message: 'Follower user not found' });
        }

        const followee = await Users.findById(followeeId);
        if (!followee) {
            return res.status(404).json({ message: 'Followee user not found' });
        }


        if (!follower.follows.includes(followeeId)) {
            follower.follows.push(followeeId);
            // console.log("updated" + follower)
            await follower.save();
            return res.status(200).json({ message: `User ${userId} now follows user ${followeeId}` });
        } else {
            return res.status(200).json({ message: `User ${userId} already follows user ${followeeId}` });
        }
    } catch (err) {
        console.error("here", err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    const { unfolloweeId } = req.body;
    const userId = req.user.id

    try {
        const follower = await Users.findById(userId);
        if (!follower) {
            return res.status(404).json({ message: 'Follower user not found' });
        }

        const unfollowee = await Users.findById(unfolloweeId);
        if (!unfollowee) {
            return res.status(404).json({ message: 'Followee user not found' });
        }

        if (follower.follows.includes(unfolloweeId)) {
            // follower.follows.push(followeeId);
            // await follower.save();
            const newArray = follower.follows.reduce((acc, item) => {
                if (item !== unfolloweeId) {
                    acc.push(item);
                }
                return acc;
            }, []);
            console.log(newArray)
            return res.status(200).json({ message: `User ${userId} now not following user ${unfolloweeId}` });
        } else {
            return res.status(200).json({ message: `User ${userId} already unfollows user ${unfolloweeId}` });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
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
    updateUserProfile,
    resetPassword,
    verifyResetCode,
    updatePassword,
    getSingleUser,
    uploadImage,
    followUser,
    unfollowUser,
    searchUser
}