const express = require('express');
const { markLessonComplete, trackProgress, getLessonProgress } = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Mark a lesson as complete
router.post('/complete', authMiddleware, markLessonComplete);

// Get progress for a course
router.get('/course/:courseId', authMiddleware, trackProgress);

// Get progress for a lesson
router.get('/lesson/:lessonId', authMiddleware, getLessonProgress);

module.exports = router;
