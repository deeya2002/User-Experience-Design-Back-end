const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    number: {
        type: String,
    },
    location: {
        type: String,
    },
    bio: {
        type: String,
    },
    occupation: {
        type: String,
    },
    userImageUrl: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }], // Add this line
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }],
    saved: {
        type: String,
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});


const User = mongoose.model('users', userSchema);
module.exports = User;
