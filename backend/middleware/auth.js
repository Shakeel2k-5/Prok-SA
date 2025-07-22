const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

// Helper function to handle database queries
const dbGet = async (sql, params = []) => {
  try {
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    console.log('dbGet - NODE_ENV:', process.env.NODE_ENV);
    console.log('dbGet - isSQLite:', isSQLite);
    console.log('dbGet - SQL:', sql);
    console.log('dbGet - Params:', params);
    
    if (isSQLite) {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) {
            console.error('SQLite error:', err);
            reject(err);
          } else {
            console.log('SQLite result:', row);
            resolve({ rows: row ? [row] : [] });
          }
        });
      });
    } else {
      console.log('Using PostgreSQL query');
      const result = await db.query(sql, params);
      console.log('PostgreSQL result:', result.rows);
      return { rows: result.rows };
    }
  } catch (error) {
    console.error('dbGet error:', error);
    throw error;
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    console.log('=== AUTHENTICATE TOKEN ===');
    console.log('Headers:', req.headers);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth header:', authHeader);
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV);

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      if (!decoded.userId) {
        console.error('Token does not contain userId:', decoded);
        return res.status(401).json({ error: 'Invalid token format' });
      }
      
      // Get user from database
      const result = await dbGet(
        'SELECT id, username, email, first_name, last_name, bio, avatar_url FROM users WHERE id = ?',
        [decoded.userId]
      );

      console.log('Database result:', result);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = result.rows[0];
      console.log('User set:', req.user);
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      throw jwtError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ error: 'Database connection error' });
    }
    
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