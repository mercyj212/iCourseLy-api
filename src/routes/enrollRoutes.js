const express = require('express');
const { body, param } = require('express-validator');
const { enrollCourse, getEnrollments } = require('../controllers/enrollController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequestMiddleware');

const router = express.Router();

// Enroll in a course
router.post(
    '/:courseId',
     authMiddleware, 
     [ param('courseId').isMongoId().withMessage('Invalid course ID')],
     validateRequest,
     enrollCourse
    );

// Get all courses a user is enrolled in
router.get('/', authMiddleware, getEnrollments);

module.exports = router;