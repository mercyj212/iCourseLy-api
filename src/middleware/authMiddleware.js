const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // now req.user._id exists
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
