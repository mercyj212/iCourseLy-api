import express from 'express';
import { getStudentDashboard } from '../controllers/studentController';
const router = express.Router();

// Student Dashboard route
router.get('/dashboard/:studentId', getStudentDashboard);

export default router;