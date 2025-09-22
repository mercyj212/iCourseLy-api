const express = require('express');
const { enrollCourse, getEnrollments } = require('../controllers/enrollController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Enroll in a course
route.post('/:courseId', authMiddleware, enrollCourse);

// Get all courses a user is enrolled in
router.get('/', authMiddleware, getEnrollments);

module.exports = router;