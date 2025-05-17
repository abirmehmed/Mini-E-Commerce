const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.userId };
    next();

  } catch (err) {
    if (err.message.includes('expired')) {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

module.exports = { authenticate };