const express = require('express');
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

// Get all posts with user info
router.get('/', async (req, res) => {
  try {
    const result = await dbQuery(`
      SELECT 
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
      ORDER BY p.created_at DESC
    `);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('=== POST /api/posts ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { content } = req.body;

    // Validate that content is provided
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const result = await dbRun(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES (?, ?, ?)`,
      [req.user.id, content, null]
    );

    const postId = result.rows[0].id;
    
    // Get the created post with user info
    const postResult = await dbGet(`
      SELECT 
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
      WHERE p.id = ?
    `, [postId]);

    const post = postResult.rows[0];

    res.status(201).json({
      message: 'Post created successfully',
      post: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, imageUrl } = req.body;

    // Validate content is provided
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Post content is required' });
    }

    // Check if post exists and belongs to user
    const existingPost = await dbGet(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const result = await dbRun(
      `UPDATE posts 
       SET content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [content, imageUrl || null, id, req.user.id]
    );

    res.json({
      message: 'Post updated successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists and belongs to user
    const existingPost = await dbGet(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    await dbRun('DELETE FROM posts WHERE id = ?', [id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like/unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const post = await dbGet('SELECT id FROM posts WHERE id = ?', [id]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already liked the post
    const existingLike = await dbGet(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [req.user.id, id]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await dbRun(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [req.user.id, id]
      );
      await dbRun(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?',
        [id]
      );
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await dbRun(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [req.user.id, id]
      );
      await dbRun(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [id]
      );
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
});

module.exports = router; 