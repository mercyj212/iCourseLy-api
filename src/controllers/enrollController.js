const Course = require('../models/Course');
const Enroll = require('../models/Enroll');
const Lesson = require('../models/Lesson');

exports.enrollCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const alreadyEnrolled = await Enroll.findOne({ studentId, courseId });
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    const enrollment = await Enroll.create({
      studentId,
      courseId,
      enrolledAt: new Date(),
      progress: [],
      completionPercentage: 0
    });

    if (!course.students.includes(studentId)) {
      course.students.push(studentId);
      await course.save();
    }

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enroll.find({ studentId })
      .populate('courseId');

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const studentId = req.user.id;

    const enroll = await Enroll.findOne({ studentId, courseId });
    if (!enroll) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    const alreadyCompleted = enroll.progress.find(
      p => p.lessonId.toString() === lessonId
    );

    if (!alreadyCompleted) {
      enroll.progress.push({
        lessonId,
        completedAt: new Date(),
      });
    }

    // ✅ FIX: calculate completion correctly
    const totalLessons = await Lesson.countDocuments({ courseId });
    const completedLessons = enroll.progress.length;

    enroll.completionPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    await enroll.save();

    res.json({
      message: 'Lesson marked as complete',
      enroll,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
