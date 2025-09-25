const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// CREATE a lesson
exports.createLesson = async (req, res) => {
    try {
        const { courseId, title, content, videoUrl, videoLinkUrl, resources, duration, isPublished } = req.body;

        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        // Find the course
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found'});

        // Only instructor can add lessons
        if (course.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not autorized'});
        }

        // Ensure required fields are present
        if (!courseId || !title || !content || !videoUrl ||!videoLinkUrl || !duration || isPublished === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const lesson = await Lesson.create({
            courseId,
            title,
            content,
            video: { url: videoUrl },
            videoLink: { url: videoLinkUrl },
            resources: resources || '',
            duration,
            isPublished
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
exports.getLessonsByCourse = async(req, res) => {
    try {
        const { courseId } = req.params;
        const lessons = await Lesson.find({ course: courseId }).sort({ createdAt: 1});
        res.json(lessons);   
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET a single lesson by Id
exports.getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found'});
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE a lesson
exports.updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const course = await Course.findById(lesson.courseId);
        if (course.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized '});
        }

        const { title, content, videoUrl, resources, duration } = req.body;
        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;
        lesson.videoUrl = videoUrl || lesson.videoUrl;
        lesson.resources = resources || lesson.resources;
        lesson.duration = duration || lesson.duration;

        await lesson.save();
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
};

// DELETE a lesson
exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if  (!lesson) return res.status(403).json({ message: 'Lesson not found'});

        const course = await Course.findById(lesson.courseId);
        if (course.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await lesson.deleteOne();
        course.lessons.pull(lesson.id);
        await course.save();

        res.json({ message: 'Lesson deleted successfully '});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};