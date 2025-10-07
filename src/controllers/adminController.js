const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('getAllUsers error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all courses for admin with instructor info
exports.getAllCoursesAdmin = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('instructorId', 'userName email role')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error('getAllCoursesAdmin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete any course
exports.deleteCourseAdmin = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        await course.deleteOne();

        // Remove from instructor's createdCourses
        const instructor = await User.findById(course.instructorId);
        if (instructor) {
            instructor.createdCourses = instructor.createdCourses.filter(
                cld => cld.toString() !== course._id.toString()
            );
            await instructor.save();
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('deleteCourseAdmin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve a course
exports.approveCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.isApproved = true;
        await course.save();

        res.json({ message: 'Course approved successfully', course });
    } catch (err) {
        console.error('approveCourse error:', err);
        res.status(500).json({ message: 'Server error'});
    }
};

// Dashboard analytics 
exports.getAnalytics = async (req, res) => {
    try {
       const totalUsers = await User.countDocuments();
       const totalInstructors = await User.countDocuments({ role: 'instructor' });
       const totalStudents = await User.countDocuments({ role: 'student' });
       const totalCourses = await Course.countDocuments();
       const publishedCourses = await Course.countDocuments({ isPublished: true });
       const approvedCourses = await Course.countDocuments({ isApproved: true });

       res.json({
        totalUsers,
        totalInstructors,
        totalStudents,
        totalCourses,
        publishedCourses,
        approvedCourses
       });
    } catch (err) {
        console.error('getAnalytics error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Only allow valid roles
        if (!['student', 'instuctor', 'admin' ].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error('updateUserRole error:', error);
        res.status(500).json({ message: 'Server error'});
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('deleteUser error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Additional admin functionalities can be added here
// Admin creates a course
exports.createCourseAdmin = async (req, res) => {
  try {
    const { title, description, category, price, instructorId } = req.body;

    if (!title || !description || !category || !price || !instructorId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Upload cover image (optional)
    let coverImage = null;
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: 'course_covers',
      });
      coverImage = { url: uploaded.secure_url, public_id: uploaded.public_id };
    }

    // Create new course
    const course = new Course({
      title,
      description,
      category,
      price,
      coverImage,
      instructorId,
      isPublished: false,
      isApproved: false,
    });

    await course.save();

    // Add to instructor’s createdCourses
    const instructor = await User.findById(instructorId);
    if (instructor) {
      instructor.createdCourses.push(course._id);
      await instructor.save();
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (err) {
    console.error('createCourseAdmin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all notifications (Admin only)
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a notification as read (Admin only)
exports.markNotificationAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};


