const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const { authenticateToken, generateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Helper function to convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
const convertToPostgresParams = (sql, params) => {
  let postgresSql = sql;
  for (let i = 0; i < params.length; i++) {
    postgresSql = postgresSql.replace(/\?/, `$${i + 1}`);
  }
  return postgresSql;
};

// Helper function to handle database queries
const dbQuery = async (sql, params = []) => {
  const db = getPool();
  const isSQLite = process.env.NODE_ENV !== 'production';
  
  if (isSQLite) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    });
  } else {
    const postgresSql = convertToPostgresParams(sql, params);
    return db.query(postgresSql, params);
  }
};

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
    const postgresSql = convertToPostgresParams(sql, params);
    const result = await db.query(postgresSql, params);
    return { rows: result.rows };
  }
};

const dbRun = async (sql, params = []) => {
  const db = getPool();
  const isSQLite = process.env.NODE_ENV !== 'production';
  
  if (isSQLite) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            rows: [{ id: this.lastID }],
            rowCount: this.changes 
          });
        }
      });
    });
  } else {
    // For PostgreSQL, add RETURNING id if it's an INSERT statement
    let postgresSql = convertToPostgresParams(sql, params);
    if (postgresSql.trim().toUpperCase().startsWith('INSERT') && !postgresSql.includes('RETURNING')) {
      postgresSql += ' RETURNING id';
    }
    const result = await db.query(postgresSql, params);
    return { 
      rows: result.rows,
      rowCount: result.rowCount 
    };
  }
};

// Debug endpoint to test SQL conversion
router.get('/debug-sql', (req, res) => {
  const testSql = 'SELECT id FROM users WHERE email = ? OR username = ?';
  const testParams = ['test@example.com', 'testuser'];
  const convertedSql = convertToPostgresParams(testSql, testParams);
  
  res.json({
    originalSql: testSql,
    params: testParams,
    convertedSql: convertedSql,
    environment: process.env.NODE_ENV
  });
});

// Simple login for existing user (for testing)
router.post('/simple-login', async (req, res) => {
  try {
    console.log('=== SIMPLE LOGIN ===');
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    if (!isSQLite) {
      // Find the existing user
      const result = await db.query('SELECT id, username, email, first_name, last_name, bio, avatar_url FROM users WHERE id = 1');
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = result.rows[0];
      const token = generateToken(user.id);
      
      console.log('Generated token for user:', user.id);
      
      res.json({
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          bio: user.bio,
          avatarUrl: user.avatar_url
        }
      });
    } else {
      res.json({ message: 'This endpoint is for production only' });
    }
  } catch (error) {
    console.error('Simple login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message
    });
  }
});

// Get token for default user (for testing)
router.get('/get-default-token', async (req, res) => {
  try {
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    if (!isSQLite) {
      // Find the default user
      const result = await db.query('SELECT id, username, email FROM users WHERE email = ?', ['shakeelabdullahgce@gmail.com']);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Default user not found. Create user first.' });
      }
      
      const user = result.rows[0];
      const token = generateToken(user.id);
      
      res.json({
        message: 'Token generated for default user',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.json({ message: 'This endpoint is for production only' });
    }
  } catch (error) {
    console.error('Get default token error:', error);
    res.status(500).json({ error: 'Failed to get token' });
  }
});

// Create default user for production (temporary fix)
router.post('/create-default-user', async (req, res) => {
  try {
    console.log('=== CREATING DEFAULT USER ===');
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    if (!isSQLite) {
      // Check if user already exists
      const existingUser = await db.query('SELECT id FROM users WHERE email = ?', ['shakeelabdullahgce@gmail.com']);
      
      if (existingUser.rows.length > 0) {
        return res.json({ 
          message: 'User already exists',
          userId: existingUser.rows[0].id
        });
      }
      
      // Create default user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = await db.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, bio)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
      `, ['Shakeel2k5', 'shakeelabdullahgce@gmail.com', hashedPassword, 'Shakeel Abdullah', 'A.K', '']);
      
      const userId = result.rows[0].id;
      console.log('Created user with ID:', userId);
      
      res.json({ 
        message: 'Default user created successfully',
        userId: userId,
        credentials: {
          email: 'shakeelabdullahgce@gmail.com',
          password: 'password123'
        }
      });
    } else {
      res.json({ message: 'This endpoint is for production only' });
    }
  } catch (error) {
    console.error('Create default user error:', error);
    res.status(500).json({ 
      error: 'Failed to create default user',
      details: error.message
    });
  }
});

// Test endpoint to check what users exist in database
router.get('/check-users', async (req, res) => {
  try {
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    if (isSQLite) {
      const result = await new Promise((resolve, reject) => {
        db.all('SELECT id, username, email FROM users LIMIT 10', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      res.json({ users: result, count: result.length });
    } else {
      const result = await db.query('SELECT id, username, email FROM users LIMIT 10');
      res.json({ users: result.rows, count: result.rows.length });
    }
  } catch (error) {
    console.error('Check users error:', error);
    res.status(500).json({ error: 'Failed to check users' });
  }
});

// Test endpoint to check JWT token without database lookup
router.get('/test-jwt', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET not set' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      status: 'JWT decoded successfully',
      decoded: decoded,
      hasUserId: !!decoded.userId
    });
  } catch (error) {
    console.error('JWT test error:', error);
    res.status(401).json({ 
      error: 'JWT verification failed',
      details: error.message
    });
  }
});

// Test endpoint to check JWT token
router.get('/test-token', authenticateToken, async (req, res) => {
  try {
    res.json({
      status: 'Token is valid',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Token test error:', error);
    res.status(500).json({ error: 'Token test failed' });
  }
});

// Register user
router.post('/register', [
  body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, bio } = req.body;

    // Check if user already exists
    const existingUser = await dbQuery(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await dbRun(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, bio)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, passwordHash, firstName, lastName, bio || '']
    );

    const userId = result.rows[0].id;
    
    // Get the created user
    const userResult = await dbGet(
      `SELECT id, username, email, first_name, last_name, bio, avatar_url
       FROM users WHERE id = ?`,
      [userId]
    );

    const user = userResult.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await dbGet(
      'SELECT id, username, email, password_hash, first_name, last_name, bio, avatar_url FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        bio: req.user.bio,
        avatarUrl: req.user.avatar_url
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

module.exports = router; 