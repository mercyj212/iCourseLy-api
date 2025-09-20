const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    //courseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true },
    description:{ type: String, required: true },
    category:  { type: String, required: true },
    price:{ type: Number, required: true },
    coverImage: { url: String, public_id: String },
    instructorId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    isPublished: { type: Boolean, required: true },

}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
