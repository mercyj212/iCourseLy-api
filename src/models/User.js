const mongoose = require ('mongoose');
const userSchema = new mongoose.Schema({
    firstName:{ type: String, required: true, unique: true , trim: true},
    lastName: { type: String, required: true, unique: true , trim: true},
    userName: { type: String, required: true, unique: true , trim: true},
    email:{ type: String, required: true, unique: true , lowercase: true, trim: true},
    password:{ type: String, required: true },
    role: { type: String['student', 'instructor'], required: true },
    //avatar:{ url: String, required: true },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
