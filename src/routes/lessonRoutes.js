const express = require('express');
const { createLesson, getLessonByCourse, getLessonById, updateLesson, deleteLesson } = require('../controllers/lessonController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new lesson
route.post('/', authMiddleware, createLesson);

// Get all lessons for a course
router.get('/course/:id', getLessonByCourse);

// Get single lesson
router.get('/:id', getLessonById);

// Update lesson
router.put('/:id', authMiddleware, updateLesson);

// Delete a course
router.delete('/:id', authMiddleware, deleteLesson);

module.exports = router;