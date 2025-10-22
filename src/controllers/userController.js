const User = require("../models/User"); // your user model
const cloudinary = require("../config/cloudinary"); // your cloudinary config

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user._id; // from authMiddleware
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Upload to Cloudinary
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: "student_avatars",
    });

    // Update user's avatar
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: uploaded.secure_url },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Avatar uploaded successfully", avatarUrl: user.profileImage });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
