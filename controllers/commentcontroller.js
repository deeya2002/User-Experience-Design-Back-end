const mongoose = require('mongoose');
const { createError } = require("../utils/createError.js");
const Users = require("../model/usermodel");
const Comment = require("../model/commentModel.js");

const createComment = async (req, res) => {
    const { journalId, commentText } = req.body;
    const userId = req.user.id; // Assuming the user ID is extracted from the JWT token

    try {
        // Create the new comment
        const newComment = new Comment({
            userId,
            journalId,
            commentText,
            createdBy: userId,
            createdAt: new Date()
        });

        console.log(newComment);
        await newComment.save();

        res.status(201).json({
            success: true,
            message: "Comment created successfully!",
            comment: newComment
        }
        );
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).send(err.message || "Internal server error");
    }
};

const getComments = async (req, res) => {
    const { journalId } = req.params; // Assuming journalId is passed as a URL parameter
    console.log("id" + journalId);
    try {
        const allComments = await Comment.aggregate([
            {
                $match: { journalId: new mongoose.Types.ObjectId(journalId) } // Filter comments by journalId
            },
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
        res.status(500).send("Internal server error");
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
