// userRoutes.js

const router = require('express').Router();
const userController = require('../controllers/usercontrollers.js');
const { authGuard } = require('../middleware/authGuard.js');
const { upload } = require('../middleware/uploads.js');

// Update the user
router.put('/updateuser', authGuard, userController.updateUser);

// Get the user
router.get('/getuser', authGuard, userController.getSingleUser);

// Forget password
// Send the mail
router.post('/resetpassword', userController.resetPassword);

// Check the code
router.post('/resetcode', userController.verifyResetCode);

// Update the password
router.post('/updatepassword', userController.updatePassword);

// Upload an image
router.post('/uploadImage', upload, userController.uploadImage);

// Follow a user
router.post('/follow/:userId', authGuard, userController.followUser);

// Unfollow a user
router.post('/unfollow/:userId', authGuard, userController.unfollowUser);

// Search for users
router.get('/search', userController.searchUser);

// Export
module.exports = router;
