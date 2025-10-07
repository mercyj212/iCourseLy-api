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
  markNotificationAsRead,
  getAdminProfile,
  uploadAvatar
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequestMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// ------------------ Users ------------------
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.put('/users/:userId/role', authMiddleware, roleMiddleware('admin'), updateUserRole);
router.delete('/users/:userId', authMiddleware, roleMiddleware('admin'), deleteUser);

// ------------------ Courses ------------------
router.get('/courses', authMiddleware, roleMiddleware('admin'), getAllCoursesAdmin);
router.post('/courses', authMiddleware, roleMiddleware('admin'), upload.single('coverImage'), createCourseAdmin);
router.delete(
  '/courses/:id',
  authMiddleware,
  roleMiddleware('admin'),
  [param('id').isMongoId().withMessage('Invalid course ID')],
  validateRequest,
  deleteCourseAdmin
);
router.put(
  '/courses/:id/approve',
  authMiddleware,
  roleMiddleware('admin'),
  [param('id').isMongoId().withMessage('Invalid course ID')],
  validateRequest,
  approveCourse
);

// ------------------ Notifications ------------------
router.get('/notifications', authMiddleware, roleMiddleware('admin'), getNotifications);

// Mark all notifications as read
router.put('/notifications/read', authMiddleware, roleMiddleware('admin'), markNotificationAsRead);

// ------------------ Analytics ------------------
router.get('/analytics', authMiddleware, roleMiddleware('admin'), getAnalytics);

// ------------------ Admin Profile ------------------
router.get('/profile', authMiddleware, roleMiddleware('admin'), getAdminProfile);
router.post('/upload-avatar', authMiddleware, roleMiddleware('admin'), upload.single('avatar'), uploadAvatar);

module.exports = router;
