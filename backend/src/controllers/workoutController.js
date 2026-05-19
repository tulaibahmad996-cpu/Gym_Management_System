const dataSource = require('../config/datasource');
const { In } = require('typeorm');
const { buildPagination } = require('../utils/pagination');

// Workout Templates - reusable
exports.createTemplate = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('WorkoutTemplate');
    const template = repo.create({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user ? { id: req.user.id } : null,
    });
    await repo.save(template);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

exports.getTemplates = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const { take, skip } = buildPagination({ page, limit });
    const repo = dataSource.getRepository('WorkoutTemplate');
    const query = repo.createQueryBuilder('template');
    if (search) {
      query.where('LOWER(template.name) LIKE :search OR LOWER(template.description) LIKE :search', { search: `%${search.toLowerCase()}%` });
    }
    const [templates, total] = await query.skip(skip).take(take).getManyAndCount();
    res.json({ templates, total, page: parseInt(page || '1', 10), limit: take });
  } catch (error) {
    next(error);
  }
};

exports.getTemplateById = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('WorkoutTemplate');
    const template = await repo.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('WorkoutTemplate');
    const template = await repo.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    Object.assign(template, {
      name: req.body.name || template.name,
      description: req.body.description || template.description,
    });
    await repo.save(template);
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('WorkoutTemplate');
    const template = await repo.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    await repo.remove(template);
    res.json({ message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};

// Assigned Workouts - linked to member, trainer, and optional template
exports.createAssignedWorkout = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('AssignedWorkout');
    const userRepo = dataSource.getRepository('User');

    const memberId = Number(req.body.memberId);
    const trainerId = req.user.role === 'trainer' ? Number(req.user.id) : Number(req.body.trainerId);

    if (!memberId || !trainerId) return res.status(400).json({ message: 'memberId and trainerId are required' });

    const member = await userRepo.findOne({ where: { id: memberId, role: 'member' } });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const trainer = await userRepo.findOne({ where: { id: trainerId, role: 'trainer' } });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    const assignment = repo.create({
      name: req.body.name || null,
      description: req.body.description || null,
      template: req.body.templateId ? { id: Number(req.body.templateId) } : null,
      member: { id: memberId },
      trainer: { id: trainerId },
      status: req.body.status || 'Planned',
      scheduledAt: req.body.scheduledAt || null,
      notes: req.body.notes || null,
    });

    await repo.save(assignment);
    const saved = await repo.findOne({ where: { id: assignment.id }, relations: ['template', 'member', 'trainer'] });
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

exports.getAssignedWorkouts = async (req, res, next) => {
  try {
    const { search, status, memberId, trainerId, page, limit } = req.query;
    const { take, skip } = buildPagination({ page, limit });
    const repo = dataSource.getRepository('AssignedWorkout');
    const query = repo
      .createQueryBuilder('aw')
      .leftJoinAndSelect('aw.template', 'template')
      .leftJoinAndSelect('aw.member', 'member')
      .leftJoinAndSelect('aw.trainer', 'trainer');

    if (search) {
      query.andWhere('LOWER(template.name) LIKE :search OR LOWER(aw.notes) LIKE :search OR LOWER(member.firstName) LIKE :search OR LOWER(trainer.firstName) LIKE :search', { search: `%${search.toLowerCase()}%` });
    }
    if (status) query.andWhere('aw.status = :status', { status });
    if (memberId) query.andWhere('aw.memberId = :memberId', { memberId: parseInt(memberId, 10) });
    if (trainerId) query.andWhere('aw.trainerId = :trainerId', { trainerId: parseInt(trainerId, 10) });

    const [items, total] = await query.skip(skip).take(take).getManyAndCount();
    res.json({ workouts: items, total, page: parseInt(page || '1', 10), limit: take });
  } catch (error) {
    next(error);
  }
};

exports.getAssignedWorkoutById = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('AssignedWorkout');
    const item = await repo.findOne({ where: { id: parseInt(req.params.id, 10) }, relations: ['template', 'member', 'trainer'] });
    if (!item) return res.status(404).json({ message: 'Assigned workout not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateAssignedWorkout = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('AssignedWorkout');
    const item = await repo.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!item) return res.status(404).json({ message: 'Assigned workout not found' });

    if (req.body.status) item.status = req.body.status;
    if (req.body.scheduledAt) item.scheduledAt = req.body.scheduledAt;
    if (req.body.notes) item.notes = req.body.notes;

    await repo.save(item);
    const updated = await repo.findOne({ where: { id: item.id }, relations: ['template', 'member', 'trainer'] });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignedWorkout = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('AssignedWorkout');
    const item = await repo.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!item) return res.status(404).json({ message: 'Assigned workout not found' });
    await repo.remove(item);
    res.json({ message: 'Assigned workout deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getMyAssignedWorkouts = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { take, skip } = buildPagination({ page, limit });
    const repo = dataSource.getRepository('AssignedWorkout');
    const [items, total] = await repo.createQueryBuilder('aw')
      .leftJoinAndSelect('aw.template', 'template')
      .leftJoinAndSelect('aw.trainer', 'trainer')
      .where('aw.memberId = :memberId', { memberId: req.user.id })
      .skip(skip)
      .take(take)
      .getManyAndCount();
    res.json({ workouts: items, total, page: parseInt(page || '1', 10), limit: take });
  } catch (error) {
    next(error);
  }
};

// Backwards compatible aliases for member routes
exports.getMyWorkouts = exports.getMyAssignedWorkouts;

exports.completeWorkout = async (req, res, next) => {
  try {
    const repo = dataSource.getRepository('AssignedWorkout');
    const item = await repo.findOne({ where: { id: parseInt(req.params.id, 10) }, relations: ['member'] });
    if (!item) return res.status(404).json({ message: 'Assigned workout not found' });
    if (item.member.id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    item.status = 'Completed';
    await repo.save(item);
    res.json(item);
  } catch (error) {
    next(error);
  }
};
