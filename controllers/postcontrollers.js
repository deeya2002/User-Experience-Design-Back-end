const Posts = require("../model/postmodel");
const Users = require("../model/usermodel");
const Comments = require("../model/commentModel");

const postCtrl = {
  createPost: async (req, res) => {
    try {
      const { postTitle, postDescription, postLocation, images } = req.body;
      if (images.length === 0)
        return res.status(400).json({ msg: "Add a photo" });
      const newPost = new Posts({
        postTitle,
        postDescription,
        postLocation,
        images,
        user: req.user._id,
      });
      await newPost.save();

      return res.status(200).json({
        msg: "Post saved",
        newPost: {
          ...newPost._doc,
          user: req.user,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPost: async (req, res) => {
    try {
      const posts = await Posts.find({
        user: [...req.user.following, req.user._id],
      })
        .sort("-createdAt")
        .populate("user likes", "username avatar fullname friends")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

      return res.status(200).json({
        msg: "Posts found",
        result: posts.length,
        posts,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { postTitle, postDescription, postLocation, images } = req.body;

      const post = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          postTitle,
          postDescription,
          postLocation,
          images,
        }
      ).populate("user likes", "username avatar fullname");

      return res.status(200).json({
        msg: "Post updated",
        newPost: {
          ...post._doc,
          postTitle,
          postDescription,
          postLocation,
          images,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  likePost: async (req, res) => {
    try {
      const post = await Posts.find({
        _id: req.params.id,
        likes: req.user._id,
      });

      if (post.length > 0)
        return res.status(400).json({ msg: "You have already liked this post" });

      const like = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { likes: req.user._id },
        },
        { new: true }
      );

      if (!like) return res.status(400).json({ msg: "No post found" });
      return res.json({
        msg: "Post liked",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  savePost: async (req, res) => {
    try {
      const user = await Users.find({
        _id: req.user._id,
        saved: req.params.id,
      });

      if (user.length > 0)
        return res.status(400).json({ msg: "You have already saved this post" });

      await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: { saved: req.params.id },
        },
        { new: true }
      );

      return res.json({
        msg: "Post saved",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unsavePost: async (req, res) => {
    try {
      await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          $pull: { saved: req.params.id },
        },
        { new: true }
      );

      return res.json({
        msg: "Post unsaved",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unlikePost: async (req, res) => {
    try {
      const unlike = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { likes: req.user._id },
        },
        { new: true }
      );

      if (!unlike) return res.status(400).json({ msg: "No post found" });
      return res.json({
        msg: "Post unliked",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getsavedPost: async (req, res) => {
    try {
      const savedPosts = await Posts.find({ _id: { $in: req.user.saved } })
        .sort("-createdAt")
        .populate("user likes", "username avatar fullname");

      return res.json({
        msg: "Saved posts found",
        savedPosts,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserPosts: async (req, res) => {
    try {
      const posts = await Posts.find({ user: req.params.id })
        .sort("-createdAt")
        .populate("user likes", "username avatar fullname")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

      return res.status(200).json({
        msg: "Posts found",
        result: posts.length,
        posts,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSinglePost: async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id)
        .populate("user likes", "username avatar fullname friends")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

      return res.status(200).json({
        post,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deletePost: async (req, res) => {
    try {
      const post = await Posts.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });
      await Comments.deleteMany({ _id: { $in: post.comments } });

      return res.json({
        msg: "Post deleted",
        newPost: {
          ...post,
          user: req.user,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = postCtrl;
