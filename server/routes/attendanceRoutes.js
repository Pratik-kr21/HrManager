const express = require('express');
const router = express.Router();
const { getAttendance, checkIn, checkOut, getMyWeek } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/my-week', getMyWeek);
router.get('/', getAttendance);
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);

module.exports = router;
