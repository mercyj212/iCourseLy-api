const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');

exports.enrollCourse = async (req, res) => {
  try {

    
    const userId = req.user.id;

    // Only students can enroll
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    const { courseId } = req.params;

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user already enrolled
    if (course.students.includes(userId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add user to course students
    course.students.push(userId);
    await course.save();

    // Add course to user's enrolledCourses
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
    }
    await user.save();

    res.status(200).json({ message: 'Enrolled successfully', course });
  } catch (error) {
    console.error('enrollCourse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('enrolledCourses');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.enrolledCourses);
  } catch (error) {
    console.error('getEnrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};