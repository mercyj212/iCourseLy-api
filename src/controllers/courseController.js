const Course = require('../models/Course');

// CREATE a new course
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, price, coverImage } = req.body;
        const instructorId = req.user.id;
        
        const course = await Course.create({
            title,
            description,
            category,
            price,
            coverImage,
            instructor: instructorId
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// GET all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findById(req.params.id)
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        .populate('Instructor', 'name email')
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
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized'});
        }

        const { title, description, category, price,coverImage} = req.body;
        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.price = price || course.price;
        course.coverImage = coverImage || course.coverImage;

        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE a course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: 'Course not found'});

        // Only the instructor can delete
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized'});
        }

        await course.deleteOne();
        res.json({ message: 'Course deleted successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};