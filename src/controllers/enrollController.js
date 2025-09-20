const Course = require('../models/Course');
const Enroll = require('../models/Enroll');
const User = require('../models/User');

// Enroll a user into a course
exports.enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id; 

        // Find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found '});
        }

        // Check if user already enrolled
        if (course.students.include(userId)) {
            return res.status(400).json({ message: 'Already enrolled in this course'});
        }

        // Add user to course students
        course.students.push(userId);
        await course.save();

        // Add course to user's enrolledCourses
        const user = await User.findById(userId);
        user.enrollCourses.pusg(courseId);
        await user.save();

        res.status(200).json({ message: 'Enroll successfully', course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error'});
    }
};