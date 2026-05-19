const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  createMembership,
  getMemberships,
  getMembershipById,
  updateMembership,
  deleteMembership,
  subscribeMembership,
} = require('../controllers/membershipController');
const router = express.Router();

router.get('/public/list', getMemberships);
router.use(authenticate);
router.post('/', authorize('admin', 'trainer'), createMembership);
router.get('/', authorize('admin', 'trainer', 'member'), getMemberships);
router.get('/:id', authorize('admin', 'trainer', 'member'), getMembershipById);
router.post('/:id/subscribe', authorize('member'), subscribeMembership);
router.put('/:id', authorize('admin', 'trainer'), updateMembership);
router.delete('/:id', authorize('admin', 'trainer'), deleteMembership);

module.exports = router;
