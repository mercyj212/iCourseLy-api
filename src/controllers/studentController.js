// Student Dashboard controller
// Handles logic for student dashboard functionalities
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enroll from '../models/Enroll.js';
import Progress from '../models/Progress.js';

// Get student dashboard data
export const getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Total courses enrolled
    const enrolledCourses = await Enroll.find({ student: studentId }).populate('course');
    const totalCourses = enrolledCourses.length;

    // Total lessons completed
    const completedLessons = await Progress.find({ student: studentId, completed: true });
    const totalCompletedLessons = completedLessons.length;

    // In-progress courses
    const inProgressCount = totalCourses > 0 ? totalCourses - completedCount : 0;

    // Points earned (assuming 10 points per completed lesson)
    const totalPoints = completedCount * 10;

    // Recent courses (last 5 enrolled)
    const recentCourses = enrolledCourses.slice(-3).map((en) => ({
        id: en.course._id,
        title: en.course.title,
        instructor: en.course.instructor,
        cover: en.course.coverImage || "/default-course.jpg",
        progress: en.progress || 0,
    }));

    // Recommended courses (random selection of 3 courses)
    const recommendedCourses = await Course.find().limit(3).select('title instructor coverImage');

    res.status(200).json({
        stats: {
            totalCourses,
            completedCourses: completedCount,
            inProgressCourses: inProgressCount,
            points: totalPoints,
        },
        recentCourses,
        recommendedCourses,
    });
  }
    catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
    }
};