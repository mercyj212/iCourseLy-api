const comment = require('../models/Comment');
const Lesson = require('../models/Lesson');

exports.addComment = async (req, res) => {
    try {
        const { lessonId, content } = req.body;
        const userId = req.user.id;

        // checks if lesson exists 
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found'});

        const comment = await Comment.create({ 
            lesson: lessonId,
            user: userId,
            content
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get comment for a lesson
exports.getComments = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const comments = await Comment.find({ lesson: lessonId})
        .populate('user', 'name email') // populates user info
        .sort({ createdAt: -1});

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// Post a reply to a comment
exports.replyComment = async (req, res) => {
    try {
        const { commentId, content } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Only allow owner or instructor to delete
        if (comment.user.toString() !== userId && req.user.role !== 'Instructor') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await comment.user.deleteOne();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};