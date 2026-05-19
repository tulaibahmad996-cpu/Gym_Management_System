const dataSource = require('../config/datasource');
const { In } = require('typeorm');

exports.getAdminStats = async (req, res, next) => {
  try {
    const userRepository = dataSource.getRepository('User');
    const membershipRepository = dataSource.getRepository('Membership');
    const assignmentRepository = dataSource.getRepository('MembershipAssignment');
    const workoutRepository = dataSource.getRepository('AssignedWorkout');
    const templateRepository = dataSource.getRepository('WorkoutTemplate');

    const totalMembers = await userRepository.count({ where: { role: 'member' } });
    const totalTrainers = await userRepository.count({ where: { role: 'trainer' } });
    const totalMembershipPlans = await membershipRepository.count();
    const activeMembershipAssignments = await assignmentRepository.count({ where: { status: 'active' } });
    const totalWorkouts = await workoutRepository.count();
    const totalTemplates = await templateRepository.count();

    res.json({
      totalMembers,
      totalTrainers,
      totalMembershipPlans,
      activeMembershipAssignments,
      totalWorkouts,
      totalTemplates,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrainers = async (req, res, next) => {
  try {
    const userRepository = dataSource.getRepository('User');
    const assignmentRepository = dataSource.getRepository('TrainerAssignment');

    const trainers = await userRepository.find({ where: { role: 'trainer' } });
    const trainerIds = trainers.map((trainer) => trainer.id);
    const assignments = await assignmentRepository.find({
      where: { trainer: In(trainerIds) },
      relations: ['member', 'trainer'],
    });

    const trainerMap = new Map();
    trainers.forEach((trainer) => {
      const { password, ...rest } = trainer;
      trainerMap.set(trainer.id, { ...rest, members: [] });
    });

    assignments.forEach((assignment) => {
      const trainer = trainerMap.get(assignment.trainer.id);
      if (trainer) {
        trainer.members.push({ id: assignment.member.id, firstName: assignment.member.firstName, lastName: assignment.member.lastName, email: assignment.member.email });
      }
    });

    res.json({ trainers: Array.from(trainerMap.values()) });
  } catch (error) {
    next(error);
  }
};

exports.assignMembersToTrainer = async (req, res, next) => {
  try {
    const { trainerId, memberIds } = req.body;
    const userRepository = dataSource.getRepository('User');
    const assignmentRepository = dataSource.getRepository('TrainerAssignment');

    if (!trainerId || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: 'trainerId and memberIds are required' });
    }

    const trainer = await userRepository.findOne({ where: { id: Number(trainerId), role: 'trainer' } });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const cleanMemberIds = Array.from(new Set(memberIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))));
    const members = await userRepository.find({ where: { id: In(cleanMemberIds), role: 'member' } });

    if (members.length !== cleanMemberIds.length) {
      return res.status(404).json({ message: 'Some members were not found or are not members' });
    }

    const existingAssignments = await assignmentRepository.find({
      where: { trainer: { id: trainer.id } },
      relations: ['member'],
    });

    const existingMemberIds = existingAssignments.map((assignment) => assignment.member.id);
    // Only add new members, don't remove existing ones
    const toAdd = cleanMemberIds.filter((memberId) => !existingMemberIds.includes(memberId));

    const newAssignments = toAdd.map((memberId) => assignmentRepository.create({
      trainer: { id: trainer.id },
      member: { id: memberId },
    }));

    if (newAssignments.length) {
      await assignmentRepository.save(newAssignments);
    }

    const updatedAssignments = await assignmentRepository.find({
      where: { trainer: { id: trainer.id } },
      relations: ['member'],
    });

    res.json({
      success: true,
      message: `${newAssignments.length} new member(s) added successfully`,
      trainer: {
        id: trainer.id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        email: trainer.email,
        members: updatedAssignments.map((assignment) => ({
          id: assignment.member.id,
          firstName: assignment.member.firstName,
          lastName: assignment.member.lastName,
          email: assignment.member.email,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
