const express = require('express');
const { body, validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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
    return db.query(sql, params);
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
    const result = await db.query(sql, params);
    return { rows: result.rows };
  }
};

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbGet(
      `SELECT id, username, first_name, last_name, bio, avatar_url, created_at
       FROM users WHERE id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get user's posts count
    const postsResult = await dbGet(
      'SELECT COUNT(*) as posts_count FROM posts WHERE user_id = ?',
      [id]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        postsCount: parseInt(postsResult.rows[0].posts_count)
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

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
    return db.query(sql, params);
  }
};

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, bio } = req.body;

    await dbRun(
      `UPDATE users 
       SET first_name = ?, last_name = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName, bio || '', req.user.id]
    );

    // Get updated user data
    const result = await dbGet(
      `SELECT id, username, email, first_name, last_name, bio, avatar_url
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    const user = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbQuery(
      `SELECT 
        p.id,
        p.content,
        p.image_url,
        p.likes_count,
        p.created_at,
        p.updated_at,
        u.id as user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC`,
      [id]
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to get user posts' });
  }
});

module.exports = router; 