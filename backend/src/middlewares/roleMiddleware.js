exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    const roles = allowedRoles.map(r => r.toLowerCase());

    console.log(`[ROLE CHECK] ${userRole} vs ${roles}`);

    if (!req.user || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

// SIMPLE SHORTCUTS
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

exports.isTrainer = (req, res, next) => {
  if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Trainer only' });
  }
  next();
};

exports.isMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};