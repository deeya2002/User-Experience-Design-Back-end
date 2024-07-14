const mongoose = require('mongoose');
const { createError } = require("../utils/createError.js");
const Users = require("../model/usermodel");
const Comment = require("../model/commentModel.js");

const createComment = async (req, res, next) => {
    const newComment = new Comment({
        userId: req.user.id,
        desc: req.body.desc,
    });

    try {
        const comment = await Comment.findOne({
            userId: req.user.id,
        });

        if (comment) {
            return next(
                createError(403, "You have already created a comment!")
            );
        }

        // TODO: Check if the user purchased the gig.

        const savedComment = await newComment.save();

        // Sending a success message along with the created comment data
        res.status(201).json({
            message: "Comment has been created successfully!",
            comment: savedComment,
        });
    } catch (err) {
        next(err);
    }
};

const getComments = async (req, res) => {
    try {
        const allComments = await Comment.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: '$userDetails',
            },
            {
                $project: {
                    commentText: 1,
                    createdAt: 1,
                    'userDetails.username': 1,
                },
            },
        ]);

        res.json({
            success: true,
            message: "All comments fetched successfully!",
            comments: allComments,
        });
    } catch (err) {
        console.error(err);
        res.send("Internal server error");
    }
};

const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    try {
        await Comment.findByIdAndDelete(commentId);
        res.json({
            success: true,
            message: "Comment deleted successfully!",
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Server error!",
        });
    }
};

module.exports = {
    createComment,
    getComments,
    deleteComment,
};
