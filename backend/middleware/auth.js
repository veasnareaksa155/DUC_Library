const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'duc_library_secret_key_2026';
const ORM = require('../googleSheetsORM');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    
    // Check session status if session_id is present
    if (decodedUser.session_id) {
      try {
        const allSessions = await ORM.getAll('UserSessions') || [];
        const session = allSessions.find(s => s.id === decodedUser.session_id);
        
        if (!session || session.status !== 'active') {
          return res.status(401).json({ message: 'Session terminated. Please login again.' });
        }
      } catch (e) {
        console.error('Session validation error:', e);
      }
    }
    
    req.user = decodedUser;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAdmin
};
