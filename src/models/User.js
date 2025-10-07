const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userName: { 
        type: String, 
        required: [true, 'Please add a name'],
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true, 
        lowercase: true, 
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'],
    },
    role: { 
        type: String,
        enum: ['student', 'instructor', 'admin'], 
        required: true,
        default: 'student',
    },

    // Track enrolled courses
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],

    // Show instructor created courses
    createdCourses: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course'
        }
    ],

    // Admin approval for instructors
    isApproved: {
        type: Boolean,
        default: false
    },

    // Email verification fields
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,

    // Password reset fields
    passwordResetToken: String,
    passwordResetTokenExpires: Date,

    avatar: 
    { 
        type: String, 
        default: "https://cdn-icons-png.flaticon.com/512/847/847969.png" 
    }

}, { timestamps: true });

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};



module.exports = mongoose.model('User', userSchema);
