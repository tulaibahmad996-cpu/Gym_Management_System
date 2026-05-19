const dataSource = require('../config/datasource');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const userRepository = dataSource.getRepository('User');
    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const normalizedRole = role ? role.toLowerCase() : 'member';
    const user = userRepository.create({
      firstName,
      lastName,
      email,
      password: await hashPassword(password),
      role: ['admin', 'trainer'].includes(normalizedRole) ? normalizedRole : 'member',
    });
    await userRepository.save(user);

    const token = generateToken({ id: user.id, role: user.role });
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userRepository = dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const normalizedRole = user.role ? user.role.toLowerCase() : 'member';
    const token = generateToken({ id: user.id, role: normalizedRole });
    res.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: normalizedRole, profileImage: user.profileImage }, token });
  } catch (error) {
    next(error);
  }
};
