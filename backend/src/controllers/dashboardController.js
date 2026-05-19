const dataSource = require('../config/datasource');

exports.adminStats = async (req, res, next) => {
  try {
    const userRepository = dataSource.getRepository('User');
    const membershipRepository = dataSource.getRepository('Membership');
    const trainerRepository = dataSource.getRepository('User');

    const totalUsers = await userRepository.count();
    const totalMemberships = await membershipRepository.count();
    const totalTrainers = await trainerRepository.count({ where: { role: 'trainer' } });

    res.json({ totalUsers, totalMemberships, totalTrainers });
  } catch (error) {
    next(error);
  }
};

exports.memberDashboard = async (req, res, next) => {
  try {
    const assignmentRepository = dataSource.getRepository('MembershipAssignment');
    const workoutRepository = dataSource.getRepository('AssignedWorkout');
    const attendanceRepository = dataSource.getRepository('Attendance');

    const membershipAssignments = await assignmentRepository.find({
      where: { member: { id: req.user.id }, status: 'active' },
      relations: ['membership'],
    });
    const workouts = await workoutRepository.find({ where: { member: { id: req.user.id } }, relations: ['trainer', 'template'] });
    const attendance = await attendanceRepository.find({ where: { member: { id: req.user.id } } });

    res.json({ profile: req.user, memberships: membershipAssignments, workouts, attendance });
  } catch (error) {
    next(error);
  }
};

exports.trainerDashboard = async (req, res, next) => {
  try {
    const assignmentRepo = dataSource.getRepository('TrainerAssignment');
    const workoutRepository = dataSource.getRepository('AssignedWorkout');

    const assignments = await assignmentRepo.find({ where: { trainer: { id: req.user.id } }, relations: ['member'] });
    const workoutPlans = await workoutRepository.find({ where: { trainer: { id: req.user.id } }, relations: ['member', 'template'] });

    const membersById = new Map();
    assignments.forEach((assignment) => {
      if (assignment.member) membersById.set(assignment.member.id, assignment.member);
    });
    workoutPlans.forEach((workout) => {
      if (workout.member) membersById.set(workout.member.id, workout.member);
    });

    const assignedMembers = Array.from(membersById.values());
    res.json({ trainer: req.user, assignedMembers, workoutPlans });
  } catch (error) {
    next(error);
  }
};
