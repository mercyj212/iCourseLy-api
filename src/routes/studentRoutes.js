const express = require('express');
const { getStudentDashboard } = require('../controllers/studentController');
const router = express.Router();

// Student Dashboard route
router.get('/:studentId/dashboard', getStudentDashboard);

module.exports = router;