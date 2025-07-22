const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

// Helper function to handle database queries
const dbGet = async (sql, params = []) => {
  try {
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    console.log('dbGet - Environment:', process.env.NODE_ENV);
    console.log('dbGet - Database type:', isSQLite ? 'SQLite' : 'PostgreSQL');
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
    console.log('\n=== AUTHENTICATE TOKEN START ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth header:', authHeader);
    console.log('Token present:', !!token);
    console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('Attempting to verify JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT decoded successfully:', decoded);
    
    if (!decoded.userId) {
      console.error('Token does not contain userId:', decoded);
      return res.status(401).json({ error: 'Invalid token format' });
    }

    console.log('Looking for user with ID:', decoded.userId);
    
    // Get user from database
    const result = await dbGet(
      'SELECT id, username, email, first_name, last_name, bio, avatar_url FROM users WHERE id = ?',
      [decoded.userId]
    );

    console.log('Database query completed');
    console.log('Number of rows returned:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('No user found with ID:', decoded.userId);
      
      // Check what users exist in the database
      try {
        const allUsers = await dbGet('SELECT id, username, email FROM users LIMIT 5');
        console.log('Available users in database:', allUsers.rows);
      } catch (err) {
        console.error('Error checking available users:', err);
      }
      
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = result.rows[0];
    console.log('User found and set:', req.user);
    console.log('=== AUTHENTICATE TOKEN SUCCESS ===\n');
    next();
  } catch (error) {
    console.error('=== AUTHENTICATE TOKEN ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('=== AUTHENTICATE TOKEN ERROR END ===\n');
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Bypass authentication for testing (temporary)
const bypassAuth = async (req, res, next) => {
  console.log('=== BYPASS AUTH ===');
  console.log('Bypassing authentication for testing');
  
  try {
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    if (isSQLite) {
      // For SQLite, get the first user
      const result = await new Promise((resolve, reject) => {
        db.get('SELECT id, username, email, first_name, last_name, bio, avatar_url FROM users LIMIT 1', (err, row) => {
          if (err) reject(err);
          else resolve({ rows: row ? [row] : [] });
        });
      });
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
        console.log('Bypass auth - User set:', req.user);
        next();
      } else {
        res.status(401).json({ error: 'No users found in database' });
      }
    } else {
      // For PostgreSQL, get the first user
      const result = await db.query('SELECT id, username, email, first_name, last_name, bio, avatar_url FROM users LIMIT 1');
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
        console.log('Bypass auth - User set:', req.user);
        next();
      } else {
        res.status(401).json({ error: 'No users found in database' });
      }
    }
  } catch (error) {
    console.error('Bypass auth error:', error);
    res.status(500).json({ error: 'Bypass authentication failed' });
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
  bypassAuth,
  generateToken
}; 