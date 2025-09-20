const mongoose = require('mongoose');

const lessonsSchema = new mongoose.Schema({
    courseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    content:{ type: String, required: true },
    video: { url: String, required: true},
    videoLink:{ url: String, required: true },
    duration:{ type: String, required: true },
    isPublished: { type: Boolean, required: true },

}, { timestamps: true });

module.exports = mongoose.model('Lessons', lessonsSchema);
