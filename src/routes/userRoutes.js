const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadAvatar, getCurrentUser } = require("../controllers/userController");

// Upload student avatar
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

// Get current user
router.get("/me", authMiddleware, getCurrentUser);


module.exports = router;
