const express = require('express');
const { addComment, getComments, replyComment, deleteComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Add comment to a lesson
router.post('/:lessonId', authMiddleware, addComment);

// Get all comments for a lesson
router.get('/:lessonId', getComments);

// Reply to a comment
router.post('/reply/:commentId', authMiddleware, replyComment);

// Delete a comment
router.delete('/:id', authMiddleware, deleteComment);

module.exports = router;
