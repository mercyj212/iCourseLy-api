const express = require('express');
const { 
    getAllUsers,
    getAllCoursesAdmin,
    deleteCourseAdmin,
    approveCourse,
    getAnalytics,
    updateUserRole,
    deleteUser
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// User Management
router.put('/users/:id/role', authMiddleware, roleMiddleware('admin'), updateUserRole);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

// Courses Management
router.get('/courses', authMiddleware, roleMiddleware('admin'), getAllCoursesAdmin);
router.delete('/courses/:id', authMiddleware, roleMiddleware('admin'), deleteCourseAdmin);
router.put('/courses/:id/approve', authMiddleware, roleMiddleware('admin'), approveCourse);

// Dashboard analytics
router.get('/analytics', authMiddleware, roleMiddleware('admin'), getAnalytics);

module.exports = router;