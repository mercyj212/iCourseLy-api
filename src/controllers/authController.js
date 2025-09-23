
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Helper: Generate short-lived access token
 * payload: { id, role }
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

/**
 * Helper: Generate long-lived refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user
 * Expects: { name, email, password, role? }
 */
exports.registerUser = async (req, res) => {

  try {
    const { userName, email, password, role } = req.body;

    // basic validation
    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Create user (assumes User model hashes password in a pre-save hook)
    const user = new User({ userName, email, password, role });
    await user.save();

    // generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // send refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // return user (without password) and access token
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({ accessToken, user: safeUser });
  } catch (err) {
    console.error('registerUser error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Login existing user
 * Expects: { email, password }
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // If your User model has matchPassword method - prefer that
    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      isMatch = await user.matchPassword(password);
    } else {
      // fallback
      const bcrypt = require('bcryptjs');
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ accessToken, user: safeUser });
  } catch (err) {
    console.error('loginUser error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Refresh access token using refresh cookie
 * Expects refresh token in httpOnly cookie: 'refreshToken'
 * Returns: { accessToken }
 */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    console.error('refreshToken error:', err);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

/**
 * Get user profile (protected route - requires auth middleware)
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ message: err.message });
  }
};
