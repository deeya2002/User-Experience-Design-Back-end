const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalcontrollers');

// Middleware to protect routes (if required)
const { authGuard } = require('../middleware/authGuard'); // Assuming you have an authentication middleware

// Route to create a journal
router.post('/create', authGuard, journalController.createjournal);

// Route to get all journals by a specific user
router.get('/user/:userId', authGuard, journalController.getUserJournals);

// Route to get all journals with pagination
router.get('/getalljournal', journalController.getAllJournals);

// Route to get a single journal
router.get('/me/:id', journalController.getSinglejournal);

// Route to update a journal
router.put('/me/:id', authGuard, journalController.updatejournal);

// Route to delete a journal
router.delete('/me/:id', authGuard, journalController.deletejournal);

// Route to search journals by name
router.post('/searchjournal', journalController.searchByjournalName);

// Route to like a journal
router.post('/:id/like', authGuard, journalController.likeJournal);

// Route to unlike a journal
router.post('/:id/unlike', authGuard, journalController.unlikeJournal);

// Route to save a journal
router.post('/:id/save', authGuard, journalController.saveJournal);

// Route to unsave a journal
router.post('/:id/unsave', authGuard, journalController.unsaveJournal);

// Route to get journals saved by the current user
router.get('/saved', authGuard, journalController.getSavedJournals);

module.exports = router;
