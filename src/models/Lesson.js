const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },

    // Uploaded video file (Cloudinary)
    video: {
      url: { type: String },       // Cloudinary URL
      public_id: { type: String }  // Cloudinary public_id (for deletion/replacement)
    },

    // External video link (e.g., YouTube, Vimeo)
    videoLink: {
      url: { type: String }
    },

    resources: { type: String },
    duration: { type: String, required: true },
    isPublished: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
