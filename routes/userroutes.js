//import router from express
const router = require('express').Router();
const userController = require('../controllers/usercontrollers.js');
const { authGuard } = require('../middleware/authGuard.js');
const { upload } = require('../middleware/uploads.js');


//all the routes for the user
//register the user
router.post('/create', userController.createUser);

//login the user
router.post('/login', userController.loginUser);

//update the user
router.put('/updateuser', authGuard, userController.updateUser);

//get the user
router.get('/getuser', authGuard, userController.getSingleUser)

//forget password
//send the mail
router.post('/resetpassword', userController.resetPassword);

//check the code
router.post('/resetcode', userController.verifyResetCode);

//update the password
router.post('/updatepassword', userController.updatePassword);

router.post("/uploadImage", upload, userController.uploadImage);

//export
module.exports = router;