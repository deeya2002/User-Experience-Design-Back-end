const router = require('express').Router();
const commentController = require("../controllers/commentcontroller");
const { authGuard, authGuardAdmin } = require('../middleware/authGuard');

// create comment
router.post('/create_comment',authGuard, commentController.createComment);

// get all comment
router.get("/get_comments/:journalId",commentController.getComments);

// delete offer by id 
router.delete("/delete_comment/:id", authGuardAdmin, commentController.deleteComment);

module.exports = router;