const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { adminStats, memberDashboard, trainerDashboard } = require('../controllers/dashboardController');
const router = express.Router();

router.use(authenticate);
router.get('/admin', authorize('admin'), adminStats);
router.get('/member', authorize('member', 'trainer', 'admin'), memberDashboard);
router.get('/trainer', authorize('trainer', 'admin'), trainerDashboard);

module.exports = router;
