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

    console.log('=== USER LOOKUP DEBUG ===');
    console.log('Looking for user with ID:', decoded.userId);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Get user from database
    const result = await dbGet(
      'SELECT id, username, email, first_name, last_name, bio, avatar_url FROM users WHERE id = ?',
      [decoded.userId]
    );

    console.log('Database query result:', result);
    console.log('Number of rows returned:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('No user found with ID:', decoded.userId);
      // Let's also check what users exist in the database
      try {
        const allUsers = await dbGet('SELECT id, username, email FROM users LIMIT 5');
        console.log('Available users in database:', allUsers.rows);
      } catch (err) {
        console.error('Error checking available users:', err);
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    console.log('User found and set:', req.user);
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