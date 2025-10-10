import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enroll from '../models/Enroll.js';
import Progress from '../models/Progress.js';
import Comment from '../models/Comment.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // 🟡 1. Get all enrolled courses
    const enrolledCourses = await Enroll.find({ student: studentId }).populate('course');
    const totalCourses = enrolledCourses.length;

    // 🟡 2. Get all completed lessons
    const completedLessons = await Progress.find({
      student: studentId,
      completed: true,
    }).populate('lesson');

    const completedLessonsCount = completedLessons.length;

    // 🟡 3. Calculate progress per course
    const progressData = {};
    for (const enroll of enrolledCourses) {
      const totalLessons = await Lesson.countDocuments({ course: enroll.course._id });
      const completed = await Progress.countDocuments({
        student: studentId,
        course: enroll.course._id,
        completed: true,
      });
      const progressPercent = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
      progressData[enroll.course._id] = progressPercent;
    }

    // 🟡 4. Count in-progress courses (progress between 1%–99%)
    const inProgressCount = Object.values(progressData).filter(
      (p) => p > 0 && p < 100
    ).length;

    // 🟡 5. Points earned (10 per lesson)
    const totalPoints = completedLessonsCount * 10;

    // 🟡 6. Recent lessons (last 5 completed)
    const recentLessons = completedLessons
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    // 🟡 7. Recent courses
    const recentCourses = enrolledCourses.slice(-3).map((en) => ({
      id: en.course._id,
      title: en.course.title,
      instructor: en.course.instructor,
      cover: en.course.coverImage || '/default-course.jpg',
      progress: Math.round(progressData[en.course._id] || 0),
    }));

    // 🟡 8. Recommended courses
    const enrolledIds = enrolledCourses.map((e) => e.course._id);
    const recommended = await Course.find({ _id: { $nin: enrolledIds } })
      .sort({ createdAt: -1 })
      .limit(3);

    // 🟡 9. Recent comments
    const recentComments = await Comment.find({ student: studentId })
      .populate('course')
      .sort({ createdAt: -1 })
      .limit(5);

    // 🟡 10. Streaks (consecutive active days)
    const today = new Date();
    const pastWeek = new Date(today);
    pastWeek.setDate(today.getDate() - 7);
    const recentProgress = await Progress.find({
      student: studentId,
      updatedAt: { $gte: pastWeek },
    }).sort({ updatedAt: -1 });

    const streakDays = new Set(
      recentProgress.map((p) => new Date(p.updatedAt).toDateString())
    ).size;

    // 🟡 11. Badges (based on points or streaks)
    const badges = [];
    if (totalPoints >= 100) badges.push('🏅 Fast Learner');
    if (streakDays >= 3) badges.push('🔥 3-Day Streak');
    if (completedLessonsCount >= 20) badges.push('🎓 Course Champion');

    // ✅ Send response
    res.status(200).json({
      totalCourses,
      completedLessons: completedLessonsCount,
      inProgressCount,
      totalPoints,
      progressData,
      recentLessons,
      recentCourses,
      recommended,
      recentComments,
      streakDays,
      badges,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error loading student dashboard', error });
  }
};
