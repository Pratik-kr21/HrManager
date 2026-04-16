const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, updateLeaveStatus, getAnalytics } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/analytics', getAnalytics);
router.route('/').get(getLeaves).post(applyLeave);
router.put('/:id/status', updateLeaveStatus);

module.exports = router;
