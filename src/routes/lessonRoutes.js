const express = require('express');
const { body, param } = require('express-validator');
const { 
    createLesson, 
    getLessonsByCourse, 
    getLessonById, 
    updateLesson, 
    deleteLesson 
} = require('../controllers/lessonController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequestMiddleware');

const router = express.Router();

// Create a new lesson
router.post(
    '/', 
    authMiddleware, 
    roleMiddleware('instructor'),
    [
        param('courseId').isMongoId().withMessage('Invalid course ID'),
        body('title').notEmpty().withMessage('Lesson title is required'),
        body('content').notEmpty().withMessage('Lesson content is required')
    ],
    validateRequest,
    createLesson
);

// Get all lessons for a course
router.get(
    '/course/:id',
    [param('courseId').isMongoId().withMessage('Invalid course ID') ],
    validateRequest, 
    getLessonsByCourse
);

// Get single lesson
router.get(
    '/:id', 
    param('lessonId').isMongoId().withMessage('Invalid lesson ID'),
    validateRequest, 
    getLessonById
);

// Update lesson
router.put(
    '/:id', 
    authMiddleware, 
    roleMiddleware('instructor'), 
    [ param('lessonId').isMongoId().withMessage('Invalid lesson ID')],
    validateRequest,
    updateLesson
);

// Delete a lesson
router.delete(
    '/:id', 
    authMiddleware, 
    roleMiddleware('instructor'),
    param('lessonId').isMongoId().withMessage('Invalid lesson ID'),
    validateRequest, 
    deleteLesson
);

module.exports = router;