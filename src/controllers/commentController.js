const Comment = require('../models/Comment');
const Lesson = require('../models/Lesson');

// Add a comment to a lesson
exports.addComment = async (req, res) => {
  try {
    const { lessonId, content } = req.body;
    const userId = req.user.id;

    // check if lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const comment = await Comment.create({
      lesson: lessonId,
      user: userId,
      content,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all comments for a lesson
exports.getComments = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const comments = await Comment.find({ lesson: lessonId })
      .populate('user', 'name email') // add user info
      .populate('replies.user', 'name email') // also show reply authors
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post a reply to a comment
exports.replyComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // push reply into the comment's replies array
    comment.replies.push({
      user: userId,
      content,
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // allow only owner or instructor to delete
    if (comment.user.toString() !== userId && req.user.role !== 'Instructor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
