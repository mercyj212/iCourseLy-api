const express = require('express');
const { param } = require('express-validator');
const { 
    getAllUsers,
    getAllCoursesAdmin,
    deleteCourseAdmin,
    approveCourse,
    getAnalytics,
    updateUserRole,
    deleteUser,
    createCourseAdmin,
    getNotifications,
    markNotificationAsRead
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequestMiddleware');
const upload = require('../middleware/uploadMiddleware'); // ✅ For image upload (if using Cloudinary or multer)

const router = express.Router();

// ===========================
// 🔹 User Management
// ===========================
router.put('/users/:id/role', authMiddleware, roleMiddleware('admin'), updateUserRole);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

// ===========================
// 🔹 Courses Management
// ===========================
router.get('/courses', authMiddleware, roleMiddleware('admin'), getAllCoursesAdmin);

// ✅ Create a new course (Admin Only)
router.post(
    '/courses',
    authMiddleware,
    roleMiddleware('admin'),
    upload.single('coverImage'), // optional if you want to upload images
    createCourseAdmin
);

router.delete(
    '/courses/:id',
    authMiddleware,
    roleMiddleware('admin'),
    [ param('id').isMongoId().withMessage('Invalid course ID') ],
    validateRequest,
    deleteCourseAdmin
);

router.put(
    '/courses/:id/approve',
    authMiddleware,
    roleMiddleware('admin'),
    [ param('id').isMongoId().withMessage('Invalid course ID') ],
    validateRequest,
    approveCourse
);
// ===========================
// 🔹 Notifications
// ===========================
router.get('/notifications', authMiddleware, roleMiddleware('admin'), getNotifications);

// Mark a notification as read
router.put(
    '/notifications/:id/read',
    authMiddleware,
    roleMiddleware('admin'),
    [ param('id').isMongoId().withMessage('Invalid notification ID') ],
    validateRequest,
    markNotificationAsRead
);

// ===========================
// 🔹 Dashboard analytics
// ===========================
router.get('/analytics', authMiddleware, roleMiddleware('admin'), getAnalytics);

module.exports = router;
