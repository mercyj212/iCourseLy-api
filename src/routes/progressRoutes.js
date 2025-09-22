const express = require('express');
const { trackProgress, getUserProgress } = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Track lesson progress
route.post('/:lessonId', authMiddleware, trackProgress);

// Get progress of logged-in user
router.get('/', authMiddleware, getUserProgress);

module.exports = router;