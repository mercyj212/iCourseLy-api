const express = require('express');
const { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new course
route.post('/', authMiddleware, createCourse);

// Get all courses
router.get('/', getCourses);

// Get single course by ID
router.get('/:id', getCourseById);

// Update a course
router.put('/:id', authMiddleware, updateCourse);

// Delete a course
router.delete('/:id', authMiddleware, deleteCourse);

module.exports = router;