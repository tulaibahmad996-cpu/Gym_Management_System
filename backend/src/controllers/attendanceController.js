const dataSource = require('../config/datasource');
const { buildPagination } = require('../utils/pagination');

exports.createAttendance = async (req, res, next) => {
  try {
    const attendanceRepository = dataSource.getRepository('Attendance');
    const userRepository = dataSource.getRepository('User');
    const member = await userRepository.findOne({ where: { id: parseInt(req.body.memberId, 10) } });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const attendance = attendanceRepository.create({
      member,
      date: req.body.date,
      status: req.body.status || 'Present',
      note: req.body.note,
    });
    await attendanceRepository.save(attendance);
    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const { search, status, memberId, page, limit } = req.query;
    const { take, skip } = buildPagination({ page, limit });
    const repository = dataSource.getRepository('Attendance');
    const query = repository.createQueryBuilder('attendance').leftJoinAndSelect('attendance.member', 'member');

    if (memberId) query.andWhere('attendance.memberId = :memberId', { memberId: parseInt(memberId, 10) });
    if (status) query.andWhere('attendance.status = :status', { status });
    if (search) query.andWhere('LOWER(member.firstName) LIKE :search OR LOWER(member.lastName) LIKE :search', {
      search: `%${search.toLowerCase()}%`,
    });

    const [attendanceList, total] = await query.skip(skip).take(take).getManyAndCount();
    res.json({ attendance: attendanceList, total, page: parseInt(page || '1', 10), limit: take });
  } catch (error) {
    next(error);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const repository = dataSource.getRepository('Attendance');
    const attendance = await repository.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

    attendance.status = req.body.status || attendance.status;
    attendance.note = req.body.note || attendance.note;
    attendance.date = req.body.date || attendance.date;
    await repository.save(attendance);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const repository = dataSource.getRepository('Attendance');
    const attendance = await repository.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    await repository.remove(attendance);
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    next(error);
  }
};
