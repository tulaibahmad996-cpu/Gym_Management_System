const dataSource = require('../config/datasource');

exports.getAssignedMembers = async (req, res, next) => {
  try {
    const assignmentRepo = dataSource.getRepository('TrainerAssignment');
    const trainerId = Number(req.user.id);

    const assignments = await assignmentRepo.find({
      where: { trainer: { id: trainerId } },
      relations: ['member'],
    });

    const members = assignments
      .map((a) => a.member)
      .filter(Boolean);

    res.json({
      success: true,
      members,
      total: members.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.createWorkout = async (req, res, next) => {
  try {
    const assignmentRepo = dataSource.getRepository('TrainerAssignment');
    const assignedRepo = dataSource.getRepository('AssignedWorkout');

    const memberId = Number(req.body.memberId);
    const trainerId = req.user.role === 'trainer' ? Number(req.user.id) : Number(req.body.trainerId);

    if (!memberId || !trainerId) return res.status(400).json({ message: 'memberId and trainerId are required' });

    if (req.user.role === 'trainer') {
      const assignment = await assignmentRepo.findOne({ where: { trainer: { id: req.user.id }, member: { id: memberId } } });
      if (!assignment) return res.status(403).json({ message: 'Trainer can only create workouts for assigned members' });
    }

    const created = assignedRepo.create({
      template: req.body.templateId ? { id: Number(req.body.templateId) } : null,
      member: { id: memberId },
      trainer: { id: trainerId },
      status: req.body.status || 'Planned',
      scheduledAt: req.body.scheduledAt || null,
      notes: req.body.notes || null,
    });

    await assignedRepo.save(created);
    const saved = await assignedRepo.findOne({ where: { id: created.id }, relations: ['template', 'member', 'trainer'] });

    res.status(201).json({ success: true, message: 'Assigned workout created', workout: saved });
  } catch (err) {
    next(err);
  }
};

exports.updateWorkoutStatus = async (req, res, next) => {
  try {
    const assignedRepo = dataSource.getRepository('AssignedWorkout');
    const workout = await assignedRepo.findOne({ where: { id: parseInt(req.params.id, 10) }, relations: ['trainer'] });

    if (!workout) return res.status(404).json({ message: 'Assigned workout not found' });
    if (req.user.role === 'trainer' && workout.trainer.id !== req.user.id) return res.status(403).json({ message: 'Trainer can only update their own workouts' });

    workout.status = req.body.status || workout.status;
    await assignedRepo.save(workout);

    res.json({ success: true, message: 'Status updated', workout });
  } catch (err) {
    next(err);
  }
};

exports.getMyWorkouts = async (req, res, next) => {
  try {
    const assignedRepo = dataSource.getRepository('AssignedWorkout');
    const workouts = await assignedRepo.find({ where: { trainer: { id: req.user.id } }, relations: ['member', 'template'] });
    res.json({ success: true, workouts });
  } catch (err) {
    next(err);
  }
};