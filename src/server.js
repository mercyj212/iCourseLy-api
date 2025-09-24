const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/enroll', require('./routes/enrollRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log( `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);