const express = require('express');
const { addComment, getCommentForLesson, deleteComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Add comment
route.post('/:lessonId', authMiddleware, addComment);

// Get all comments for a lesson
router.get('/lessonId', getCommentForLesson);

// Delete a comment
router.delete('/:id', authMiddleware, deleteComment);


module.exports = router;