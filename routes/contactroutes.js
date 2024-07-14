const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactusController');
// Middleware to protect routes (if required)
const { authGuard } = require('../middleware/authGuard'); // Assuming you have an authentication middleware

// Route to create a journal
router.post('/createfeedback', authGuard, contactController.createcontact);

module.exports = router;