const User = require("../models/User"); // your user model
const cloudinary = require("../config/cloudinary"); // your cloudinary config

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: uploaded.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
