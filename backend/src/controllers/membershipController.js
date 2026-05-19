const dataSource = require('../config/datasource');
const { In } = require('typeorm');
const { buildPagination } = require('../utils/pagination');

exports.createMembership = async (req, res, next) => {
  try {
    const membershipRepository = dataSource.getRepository('Membership');
    const membership = membershipRepository.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      duration: req.body.duration,
    });
    await membershipRepository.save(membership);
    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
};

exports.getMemberships = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const { take, skip } = buildPagination({ page, limit });
    const repository = dataSource.getRepository('Membership');
    const query = repository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.assignments', 'assignment')
      .leftJoinAndSelect('assignment.member', 'member');

    if (search) {
      query.andWhere(
        'LOWER(membership.title) LIKE :search OR LOWER(membership.description) LIKE :search OR LOWER(member.firstName) LIKE :search OR LOWER(member.lastName) LIKE :search',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    if (status) {
      query.andWhere('assignment.status = :status', { status: status.toLowerCase() });
    }

    const [memberships, total] = await query.skip(skip).take(take).getManyAndCount();
    res.json({ memberships, total, page: parseInt(page || '1', 10), limit: take });
  } catch (error) {
    next(error);
  }
};

exports.getMembershipById = async (req, res, next) => {
  try {
    const repository = dataSource.getRepository('Membership');
    const membership = await repository.findOne({
      where: { id: parseInt(req.params.id, 10) },
      relations: ['assignments', 'assignments.member'],
    });
    if (!membership) return res.status(404).json({ message: 'Membership not found' });
    res.json(membership);
  } catch (error) {
    next(error);
  }
};

const parseDuration = (duration) => {
  if (!duration) return null;
  const value = parseInt(duration, 10);
  if (Number.isNaN(value)) return null;

  const lower = duration.toLowerCase();
  const start = new Date();
  const end = new Date(start);
  if (lower.includes('day')) {
    end.setDate(end.getDate() + value);
  } else if (lower.includes('week')) {
    end.setDate(end.getDate() + value * 7);
  } else if (lower.includes('month')) {
    end.setMonth(end.getMonth() + value);
  } else if (lower.includes('year')) {
    end.setFullYear(end.getFullYear() + value);
  } else {
    return null;
  }

  return end.toISOString().split('T')[0];
};

exports.subscribeMembership = async (req, res, next) => {
  try {
    const membershipRepository = dataSource.getRepository('Membership');
    const assignmentRepository = dataSource.getRepository('MembershipAssignment');

    const membership = await membershipRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!membership) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }

    const existingAssignment = await assignmentRepository.findOne({
      where: { member: { id: req.user.id }, status: 'active' },
      relations: ['membership'],
    });

    if (existingAssignment) {
      if (existingAssignment.membership.id === membership.id) {
        return res.status(400).json({ message: 'You already have this active membership' });
      }
      return res.status(400).json({ message: 'You already have an active membership. Please cancel it before subscribing to a new plan.' });
    }

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = parseDuration(membership.duration);

    const assignment = assignmentRepository.create({
      membership: { id: membership.id },
      member: { id: req.user.id },
      status: 'active',
      startDate,
      endDate,
    });

    await assignmentRepository.save(assignment);
    res.status(201).json({ message: 'Subscription successful', assignment });
  } catch (error) {
    next(error);
  }
};

exports.updateMembership = async (req, res, next) => {
  try {
    const repository = dataSource.getRepository('Membership');
    const membership = await repository.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    Object.assign(membership, {
      title: req.body.title || membership.title,
      description: req.body.description || membership.description,
      price: req.body.price || membership.price,
      duration: req.body.duration || membership.duration,
    });

    await repository.save(membership);
    res.json(membership);
  } catch (error) {
    next(error);
  }
};

exports.deleteMembership = async (req, res, next) => {
  try {
    const repository = dataSource.getRepository('Membership');
    const membership = await repository.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!membership) return res.status(404).json({ message: 'Membership not found' });
    await repository.remove(membership);
    res.json({ message: 'Membership deleted' });
  } catch (error) {
    next(error);
  }
};

exports.assignMembersToMembership = async (req, res, next) => {
  try {
    const membershipRepository = dataSource.getRepository('Membership');
    const assignmentRepository = dataSource.getRepository('MembershipAssignment');
    const userRepository = dataSource.getRepository('User');

    const membership = await membershipRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
      relations: ['assignments', 'assignments.member'],
    });

    if (!membership) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }

    const memberIds = Array.isArray(req.body.memberIds)
      ? req.body.memberIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
      : [];

    const force = req.body.force === true || req.body.force === 'true';

    if (!memberIds.length) {
      return res.status(400).json({ message: 'memberIds must be a non-empty array' });
    }

    const members = await userRepository.find({
      where: { id: In(memberIds), role: 'member' },
    });

    if (members.length !== memberIds.length) {
      return res.status(404).json({ message: 'Some members were not found or are not members' });
    }

    const activeAssignments = await assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.membership', 'membership')
      .leftJoinAndSelect('assignment.member', 'member')
      .where('assignment.status = :status', { status: 'active' })
      .andWhere('assignment.memberId IN (:...memberIds)', { memberIds })
      .getMany();

    const conflicting = activeAssignments.filter((assignment) => assignment.membership.id !== membership.id);

    if (conflicting.length && !force) {
      return res.status(400).json({
        message: 'Some members already have an active membership assignment',
        conflicts: conflicting.map((assignment) => ({ memberId: assignment.member.id, membershipId: assignment.membership.id })),
      });
    }

    if (force) {
      await Promise.all(conflicting.map(async (assignment) => {
        assignment.status = 'expired';
        await assignmentRepository.save(assignment);
      }));
    }

    const existingMemberIds = membership.assignments.map((assignment) => assignment.member.id);
    const toRemove = membership.assignments.filter((assignment) => !memberIds.includes(assignment.member.id));
    const toAdd = memberIds.filter((memberId) => !existingMemberIds.includes(memberId));

    if (toRemove.length) {
      await assignmentRepository.remove(toRemove);
    }

    const newAssignments = toAdd.map((memberId) => assignmentRepository.create({
      membership: { id: membership.id },
      member: { id: memberId },
      status: 'active',
      startDate: req.body.startDate || new Date().toISOString().slice(0, 10),
      endDate: req.body.endDate || null,
    }));

    if (newAssignments.length) {
      await assignmentRepository.save(newAssignments);
    }

    const updatedMembership = await membershipRepository.findOne({
      where: { id: membership.id },
      relations: ['assignments', 'assignments.member'],
    });

    res.json({ message: 'Members assigned successfully', membership: updatedMembership });
  } catch (error) {
    next(error);
  }
};
