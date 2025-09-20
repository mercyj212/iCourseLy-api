const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// CREATE a lesson
exports.createLesson = async (req, res) => {
    try {
        const { courseId, title, content, videoUrl, resources, duration } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found'});

        // Only instructor cn add lessons
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not autorized'});
        }

        const lesson = await Lesson.create({
            course: courseId,
            title,
            content,
            videoUrl,
            resources,
            duration
        });

        // Add lesson to course
        course.lessons.push(lesson._id);
        await course.save();

        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// GET all lessons for a course
exports.getLessonsByCourse = async