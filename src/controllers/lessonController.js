const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary'); // ✅ Cloudinary config

// CREATE a lesson
exports.createLesson = async (req, res) => {
  try {
    const { courseId, title, content, videoLinkUrl, resources, duration, isPublished } = req.body;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only instructor can add lessons
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Ensure required fields
    if (!title || !content || !duration || isPublished === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Upload video to Cloudinary (if provided)
    let video = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'lessons'
      });
      video = {
        url: result.secure_url,
        public_id: result.public_id
      };
    }

    // Create lesson
    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      video,
      videoLink: videoLinkUrl ? { url: videoLinkUrl } : undefined,
      resources: resources || '',
      duration,
      isPublished,
    });

    // Add lesson to course
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET all lessons for a course
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId }).sort({ createdAt: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET a single lesson by Id
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
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
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, videoLinkUrl, resources, duration, isPublished } = req.body;

    if (title) lesson.title = title;
    if (content) lesson.content = content;
    if (resources) lesson.resources = resources;
    if (duration) lesson.duration = duration;
    if (isPublished !== undefined) lesson.isPublished = isPublished;

    // ✅ Upload new video if provided
    if (req.file) {
      // (Optional) delete old video from Cloudinary before uploading new one
      if (lesson.video && lesson.video.public_id) {
        await cloudinary.uploader.destroy(lesson.video.public_id, { resource_type: 'video' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'lessons'
      });
      lesson.video = {
        url: result.secure_url,
        public_id: result.public_id
      };
    }

    if (videoLinkUrl) {
      lesson.videoLink = { url: videoLinkUrl };
    }

    await lesson.save();
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const course = await Course.findById(lesson.courseId);
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ✅ Delete video from Cloudinary if exists
    if (lesson.video && lesson.video.public_id) {
      await cloudinary.uploader.destroy(lesson.video.public_id, { resource_type: 'video' });
    }

    await lesson.deleteOne();
    course.lessons.pull(lesson._id);
    await course.save();

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
