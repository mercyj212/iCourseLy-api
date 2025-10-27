const express = require('express');
const { body, param } = require('express-validator');
const { 
    createCourse, 
    getAllCourses, 
    getCourseById, 
    updateCourse, 
    deleteCourse, 
    getMyCourses, 
    searchCourses
} = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequestMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

const router = express.Router();

// Create a new course
router.post(
    '/', 
    authMiddleware, 
    roleMiddleware('instructor'),
    uploadMiddleware.single('coverImage'), 
    [
        body('title').notEmpty().withMessage('Course title is required'),
        body('description').isLength({ min: 10}).withMessage('Description  is too short'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('category').notEmpty().withMessage('Category is required'),
    ],
    validateRequest,
    createCourse
);

// Get all courses
router.get('/', getAllCourses);

// Get courses created by logged-in instructor
router.get('/my-courses', authMiddleware, roleMiddleware('instructor'), getMyCourses);

// Get single course by ID
router.get('/:id', getCourseById);

// Update a course
router.put(
    '/:id',
     authMiddleware, 
     roleMiddleware('instructor'),
     uploadMiddleware.single('coverImage'), 
     [
        param('id').isMongoId().withMessage('Invalid course ID')
     ],
     validateRequest,
     updateCourse
);



// Delete a course
router.delete(
    '/:id', 
    authMiddleware, 
    roleMiddleware('instructor'), 
    [
       param('id').isMongoId().withMessage('Invalid course ID') 
    ],
    validateRequest,
    deleteCourse
);

router.get("/search", searchCourses);

module.exports = router;

