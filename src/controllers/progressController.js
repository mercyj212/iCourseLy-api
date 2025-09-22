const Progress = require('../models/Progress');

// Mark a lesson as completed
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user.id; // from authMiddleware

    let progress = await Progress.findOne({ user: userId, course: courseId, lesson: lessonId });

    if (!progress) {
      progress = new Progress({
        user: userId,
        course: courseId,
        lesson: lessonId,
        completed: true,
      });
    } else {
      progress.completed = true;
    }

    await progress.save();
    res.status(200).json({ message: 'Lesson marked as complete', progress });
  } catch (error) {
    res.status(500).json({ message: 'Error marking lesson complete', error });
  }
};

// Get progress for a course
exports.trackProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.find({ user: userId, course: courseId });

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course progress', error });
  }
};

// Get progress for a single lesson
exports.getLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ user: userId, lesson: lessonId });

    res.status(200).json(progress || { completed: false });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson progress', error });
  }
};
