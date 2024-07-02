const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
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
    images: {
        type: Array,
        required: true
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'comment'
    }],
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('post', postSchema);
