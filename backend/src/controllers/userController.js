const dataSource = require('../config/datasource');
const { hashPassword } = require('../utils/hash');
const { buildPagination } = require('../utils/pagination');

exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const userRepository = dataSource.getRepository('User');
    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = userRepository.create({
      firstName,
      lastName,
      email,
      password: await hashPassword(password),
      role: ['admin', 'trainer'].includes(role ? role.toLowerCase() : '') ? role.toLowerCase() : 'member',
    });
    await userRepository.save(user);
    const { password: userPassword, ...rest } = user;
    res.status(201).json(rest);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page, limit } = req.query;
    const { take, skip } = buildPagination({ page, limit });
    const repository = dataSource.getRepository('User');
    const query = repository.createQueryBuilder('user');

    if (search) {
      query.andWhere('LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    const [users, total] = await query.skip(skip).take(take).getManyAndCount();
    const sanitized = users.map(({ password, ...rest }) => rest);
    res.json({ users: sanitized, total, page: parseInt(page || '1', 10), limit: take });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const userRepository = dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // const { password, ...rest } = user;
    const { password: userPassword, ...rest } = user;
    res.json(rest);
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const { password, ...rest } = req.user;
    res.json(rest);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userRepository = dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, email, password } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (password) user.password = await hashPassword(password);
    if (req.file) {
      user.profileImage = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    await userRepository.save(user);
    // const { password, ...rest } = user;
    const { password: userPassword, ...rest } = user;

    res.json({ message: 'Profile updated', user: rest });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userRepository = dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { id: parseInt(req.params.id, 10) } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await userRepository.remove(user);
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
