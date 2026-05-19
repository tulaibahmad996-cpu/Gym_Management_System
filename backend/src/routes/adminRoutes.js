const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const {
  createMembership,
  getMemberships,
  getMembershipById,
  updateMembership,
  deleteMembership,
  assignMembersToMembership,
} = require('../controllers/membershipController');
const {
  getAdminStats,
  getTrainers,
  assignMembersToTrainer,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/dashboard/stats', getAdminStats);

router.get('/memberships', getMemberships);
router.post('/memberships', createMembership);
router.put('/memberships/:id', updateMembership);
router.delete('/memberships/:id', deleteMembership);
router.post('/memberships/:id/assign-members', assignMembersToMembership);

router.get('/trainers', getTrainers);
router.post('/trainers/assign-members', assignMembersToTrainer);

module.exports = router;
