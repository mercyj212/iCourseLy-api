import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enroll from '../models/Enroll.js';
import Comment from '../models/Comment.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // 1️⃣ Enrollments
    const enrollments = await Enroll.find({ studentId })
      .populate('courseId');

    const totalCourses = enrollments.length;

    let completedLessonsCount = 0;
    let currentCourse = null;

    // 2️⃣ Progress per course (from Enroll.progress)
    const progressData = {};

    for (const enroll of enrollments) {
      const totalLessons = await Lesson.countDocuments({
        courseId: enroll.courseId._id,
      });

      const completedLessons = enroll.progress.filter(
        (p) => p.completedAt
      ).length;

      const progressPercent = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      progressData[enroll.courseId._id] = progressPercent;
      completedLessonsCount += completedLessons;

      if (!currentCourse && progressPercent > 0 && progressPercent < 100) {
        currentCourse = {
          title: enroll.courseId.title,
          instructor: enroll.courseId.instructorId,
          progress: progressPercent,
        };
      }
    }

    // Fallback current course
    if (!currentCourse && enrollments.length > 0) {
      const last = enrollments[enrollments.length - 1];
      currentCourse = {
        title: last.courseId.title,
        instructor: last.courseId.instructorId,
        progress: progressData[last.courseId._id] || 0,
      };
    }

    // 3️⃣ Points
    const totalPoints = completedLessonsCount * 10;

    // 4️⃣ Recent courses
    const recentCourses = enrollments.slice(-3).map((enroll) => ({
      id: enroll.courseId._id,
      title: enroll.courseId.title,
      instructor: enroll.courseId.instructorId,
      cover: enroll.courseId.coverImage || '/default-course.jpg',
      progress: progressData[enroll.courseId._id] || 0,
    }));

    // 5️⃣ Recommended courses
    const enrolledIds = enrollments.map((e) => e.courseId._id);
    const recommended = await Course.find({
      _id: { $nin: enrolledIds },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    // 6️⃣ Recent comments
    const recentComments = await Comment.find({ student: studentId })
      .populate('course')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalCourses,
      completedLessons: completedLessonsCount,
      totalPoints,
      progressData,
      currentCourse,
      recentCourses,
      recommended,
      recentComments,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error loading student dashboard' });
  }
};
