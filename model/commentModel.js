const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  journalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "journals",
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User', // Reference to the User model
  required: true,
},
createdAt: {
  type: Date,
}
},
);

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;

