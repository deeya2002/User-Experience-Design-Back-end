//import router from express
const router = require('express').Router();
const authController = require('../controllers/authcontrollers');



//all the routes for the user
//register the user
router.post('/create', authController.createUser);

//login the user
router.post('/login', authController.loginUser);

//export
module.exports = router;