const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
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
    userImageUrl: {
        type: String,
    },
    isAdmin:{
        type:Boolean,
        default : false,
    }
});

const User = mongoose.model('users', userSchema);
module.exports = User;