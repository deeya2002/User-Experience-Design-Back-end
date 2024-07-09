const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    journalName: {
        type: String,
        required: true,
        trim: true,
    },
    journalDescription: {
        type: String,
        required: true,
        trim: true,
    },
    journalImageUrl: {
        type: String,
        required: true,
    },
    journalLocation: {
        type: String,
        required: true,
        trim: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
    }],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const journals = mongoose.model('journals', journalSchema);
module.exports = journals; 
