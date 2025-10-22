const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

// ----------------- Users -----------------

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

// @desc Get all instructors
// @access Private (Admin only)
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }).select("-password");
    res.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Failed to fetch instructors" });
  }
};

exports.addInstructors = async (req, res) => {
  try {
    const { name, email, password, status } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password || "instructor123", 10);

    const newInstructor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "instructor",
      status: status || "active",
    });

    res.status(201).json(newInstructor);
  } catch (err) {
    console.error("Error creating instructor:", err);
    res.status(500).json({ message: "Failed to create instructor" });
  }
};



// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- Courses -----------------

// Get all courses for admin
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructorId', 'userName email role avatar')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error('getAllCoursesAdmin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a course
exports.deleteCourseAdmin = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await course.deleteOne();

    // Remove from instructor's createdCourses
    const instructor = await User.findById(course.instructorId);
    if (instructor) {
      instructor.createdCourses = instructor.createdCourses.filter(c => c.toString() !== course._id.toString());
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

    // Emit Socket.IO notification
    req.app.get('io')?.emit('notification', {
      message: `Course approved: ${course.title}`,
      timestamp: new Date(),
    });

    await Notification.create({ message: `Course approved: ${course.title}` });

    res.json({ message: 'Course approved successfully', course });
  } catch (err) {
    console.error('approveCourse error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

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
      const uploaded = await cloudinary.uploader.upload(req.file.path, { folder: 'course_covers' });
      coverImage = { url: uploaded.secure_url, public_id: uploaded.public_id };
    }

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

    // Add to instructor's createdCourses
    const instructor = await User.findById(instructorId);
    if (instructor) {
      instructor.createdCourses.push(course._id);
      await instructor.save();
    }

    req.app.get('io')?.emit('notification', {
      message: `New course created: ${course.title}`,
      timestamp: new Date(),
    });

    await Notification.create({ message: `New course created: ${course.title}` });

    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (err) {
    console.error('createCourseAdmin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ----------------- Analytics -----------------
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const approvedCourses = await Course.countDocuments({ isApproved: true });

    // Mock chart data (for demo)
    const usersGrowth = [
      { month: "Jan", count: 10 },
      { month: "Feb", count: 25 },
      { month: "Mar", count: 40 },
      { month: "Apr", count: 50 },
      { month: "May", count: 70 },
      { month: "Jun", count: 100 },
    ];

    const revenueGrowth = [
      { month: "Jan", amount: 500 },
      { month: "Feb", amount: 1200 },
      { month: "Mar", amount: 1800 },
      { month: "Apr", amount: 2500 },
      { month: "May", amount: 3100 },
      { month: "Jun", amount: 4000 },
    ];

    res.json({
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      publishedCourses,
      approvedCourses,
      usersGrowth,
      revenueGrowth,
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- Notifications -----------------
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    console.error('markNotificationAsRead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- Admin Profile & Avatar -----------------
exports.getAdminProfile = async (req, res) => {
  try {
    // Accept either _id or id from token
    const userId = req.user._id || req.user.id;
    if (!userId) return res.status(401).json({ message: 'Invalid token' });

    const admin = await User.findOne({ _id: userId, role: 'admin' }).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.json(admin);
  } catch (err) {
    console.error('getAdminProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update admin profile (name, email)
exports.updateAdminProfile = async (req, res) => {
  try {
    const userId = (req.user && (req.user._id || req.user.id)) || req.user; // be tolerant of token shape
    const { userName, email } = req.body;

    if (!userName && !email) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    // If email provided, ensure uniqueness
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing && existing._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const update = {};
    if (userName) update.userName = userName;
    if (email) update.email = email.toLowerCase().trim();

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Admin not found' });

    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    console.error('updateAdminProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change admin password
exports.changeAdminPassword = async (req, res) => {
  try {
    const userId = (req.user && (req.user._id || req.user.id)) || req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // You can add password strength validation here
    user.password = newPassword;
    await user.save(); // pre('save') will hash

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changeAdminPassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
