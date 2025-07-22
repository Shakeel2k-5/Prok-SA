const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

// Helper function to handle database queries
const dbGet = async (sql, params = []) => {
  const db = getPool();
  const isSQLite = process.env.NODE_ENV !== 'production';
  
  if (isSQLite) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: row ? [row] : [] });
        }
      });
    });
  } else {
    const result = await db.query(sql, params);
    return { rows: result.rows };
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    // Get user from database
    const result = await dbGet(
      'SELECT id, username, email, first_name, last_name, bio, avatar_url FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
}; 