const router = require('express').Router();
const postController = require("../controllers/postcontrollers");

//create the post
router.post('/create_post', postController.createPost)

// get all posts
router.get("/get_posts", postController.getAllPosts)

// single post
router.get("/get_post/:id", postController.getSinglePost)

// update post
router.put("/update_post/:id", postController.updatePost)

// delete post
router.delete("/delete_post/:id", postController.deletePost)

//search post
router.post('/search', postController.searchByPostTitle);

module.exports = router;