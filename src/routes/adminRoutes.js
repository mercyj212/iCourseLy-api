const express = require('express');
const { 
    getAllUsers,
    getAllCoursesAdmin,
    deleteCourseAdmin,
    approveCourse,
    getAnalytics
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Users Management
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

// Courses Management
router.get('/courses', authMiddleware, roleMiddleware('admin'), getAllCoursesAdmin);
router.delete('/courses/:id', authMiddleware, roleMiddleware('admin'), deleteCourseAdmin);
router.put('/courses/:id/approve', authMiddleware, roleMiddleware('admin'), approveCourse);

// Dashboard analytics
router.get('/analytics', authMiddleware, roleMiddleware('admin'), getAnalytics);

module.exports = router;