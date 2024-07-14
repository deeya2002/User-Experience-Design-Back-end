const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
},
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;

