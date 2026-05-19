const { verifyToken } = require('../utils/jwt');
const dataSource = require('../config/datasource');

exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const userRepository = dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase(), // FIXED
    };

    console.log(`[AUTH] ${req.user.id} logged in as ${req.user.role}`);

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};