const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    postTitle: {
        type: String,
        required: true,
        trim: true,
    },
    postDescription: {
        type: String,
        required: true,
        trim: true,
    },
    postLocation: {
        type: String,
        required: true,
        trim: true,
    },
    postImageUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

const Posts = mongoose.model('posts', postSchema);
module.exports = Posts;