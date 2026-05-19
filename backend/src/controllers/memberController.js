const dataSource = require('../config/datasource');

exports.getMyMembership = async (req, res, next) => {
  try {
    const assignmentRepository = dataSource.getRepository('MembershipAssignment');
    const assignment = await assignmentRepository.findOne({
      where: { member: { id: req.user.id }, status: 'active' },
      relations: ['membership'],
    });
    if (!assignment) {
      return res.json({ message: 'No active membership' });
    }
    res.json({
      id: assignment.id,
      status: assignment.status,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      membership: assignment.membership,
    });
  } catch (error) {
    next(error);
  }
};
