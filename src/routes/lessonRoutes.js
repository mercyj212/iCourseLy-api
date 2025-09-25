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
    // [
        // param('').isMongoId().withMessage('Invalid lesson ID'),
        // body('title').notEmpty().withMessage('Lesson title is required'),
        // body('description').notEmpty().withMessage('Lesson description is required')
    // ],
    // validateRequest,
    createLesson
);

// Get all lessons for a course
router.get(
    '/course/:id',
    [param('id').isMongoId().withMessage('Invalid lesson ID') ],
    validateRequest, 
    getLessonsByCourse
);

// Get single lesson
router.get(
    '/:id', 
    param('id').isMongoId().withMessage('Invalid lesson ID'),
    validateRequest, 
    getLessonById
);

// Update lesson
router.put(
    '/:id', 
    authMiddleware, 
    roleMiddleware('instructor'), 
    [ param('id').isMongoId().withMessage('Invalid lesson ID')],
    validateRequest,
    updateLesson
);

// Delete a lesson
router.delete(
    '/:id', 
    authMiddleware, 
    roleMiddleware('instructor'),
    param('id').isMongoId().withMessage('Invalid lesson ID'),
    validateRequest, 
    deleteLesson
);

module.exports = router;