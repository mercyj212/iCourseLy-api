const express = require('express');
const { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, getMyCourses } = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Create a new course
router.post('/', authMiddleware, roleMiddleware('instructor'), createCourse);

// Get all courses
router.get('/', getAllCourses);

// Get courses created by logged-in instructor
router.get('/my-courses', authMiddleware, roleMiddleware('instructor'), getMyCourses);

// Get single course by ID
router.get('/:id', getCourseById);

// Update a course
router.put('/:id', authMiddleware, roleMiddleware('instructor'), updateCourse);



// Delete a course
router.delete('/:id', authMiddleware, roleMiddleware('instructor'), deleteCourse);

module.exports = router;