const Course = require('../models/Course');
const User = require('../models/User');

// CREATE a new course
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, price, coverImage, isPublished } = req.body;
        const instructorId = req.user.id;
        
        const course = await Course.create({
            title,
            description,
            category,
            price,
            coverImage,
            instructorId,
            isPublished
        });

        // Push course to instructor's createdCourses
        if (req.user.role === 'instructor') {
            const instructor = await User.findById(req.user.id);
            instructor.createdCourses.push(course._id);
            await instructor.save();
        }

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// GET all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
        .populate('instructorId', 'userName email')
        .sort({ createdAt: -1 });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        .populate('instructorId', 'userName email')
        .populate('lessons');

        if (!course) return res.status(404).json({ message: 'Course not found'});

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE a course
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Only the instructor can update
        if (course.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized'});
        }

        const { title, description, category, price, coverImage, isPublished } = req.body;
        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.price = price || course.price;
        course.coverImage = coverImage || course.coverImage;
        course.isPublished = isPublished ?? course.isPublished;

        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get courses created by logged-in instructor
exports.getMyCourses = async (req, res) => {
    try {
        if (req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'Access denied: only instructors can view their courses' });
        }

        const instructor = await User.findById(req.user.id).populate({
            path: 'createdCourses',
            select: 'title description category price coverImage isPublished createdAt'
        });

        res.json(instructor.createdCourses);
    } catch (err) {
        console.error('getMyCourses error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE a course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: 'Course not found'});

        // Only the instructor can delete
        if (course.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized'});
        }

        await course.deleteOne();

        // Remove course from instructor's createdCourses
        const instructor = await User.findById(req.user.id);
        instructor.createdCourses = instructor.createdCourses.filter(
            cId => cId.toString() !== course._id.toString()
        );
        await instructor.save();

        res.json({ message: 'Course deleted successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};