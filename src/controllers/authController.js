const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// =================== TOKEN HELPERS ===================
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

// =================== REGISTER USER ===================
exports.registerUser = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ userName, email, password, role });

    // Email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationTokenExpires = Date.now() + parseInt(process.env.EMAIL_TOKEN_EXPIRES || 86400000); // 24h

    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <h2>Welcome to iCourseLy</h2>
        <p>Hi ${userName},</p>
        <p>Thanks for signing up! Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      verificationUrl
    });
  } catch (err) {
    console.error('registerUser error:', err);
    res.status(500).json({ message: err.message });
  }
};

// =================== EMAIL VERIFICATION ===================
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('verifyEmail error:', err);
    res.status(500).json({ message: err.message });
  }
};

// =================== RESEND VERIFICATION EMAIL ===================
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationTokenExpires = Date.now() + parseInt(process.env.EMAIL_TOKEN_EXPIRES || 86400000);

    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email (Resent)",
      html: `
        <h2>Welcome back to iCourseLy</h2>
        <p>Hi ${user.userName},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.json({ message: 'Verification email resent successfully', verificationUrl });
  } catch (err) {
    console.error('resendVerificationEmail error:', err);
    res.status(500).json({ message: err.message });
  }
};

// =================== LOGIN USER ===================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

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

// =================== FORGOT PASSWORD ===================
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetTokenExpires = Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES || 3600000); // 1h

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password - iCourseLy</h2>
        <p>You requested a password reset.</p>
        <p>Please reset your password by clicking the link below:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.json({ message: 'Password reset email sent', resetUrl });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ message: err.message });
  }
};

// =================== RESET PASSWORD ===================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return res.status(400).json({ message: 'Reset token is required in URL' });
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token. Please request a new password reset.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
};

// =================== REFRESH TOKEN ===================
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

// =================== GET USER PROFILE ===================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ message: err.message });
  }
};
