const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, bypassAuth } = require('../middleware/auth');

const router = express.Router();

// Simple test endpoint without authentication
router.post('/test-simple', async (req, res) => {
  try {
    console.log('=== SIMPLE TEST POST ===');
    
    // Get the first user from database
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    let user;
    if (isSQLite) {
      const result = await new Promise((resolve, reject) => {
        db.get('SELECT id, username, email FROM users LIMIT 1', (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      user = result;
    } else {
      const result = await db.query('SELECT id, username, email FROM users LIMIT 1');
      user = result.rows[0];
    }
    
    if (!user) {
      return res.status(404).json({ error: 'No users found in database' });
    }
    
    console.log('Found user:', user);
    
    const { content } = req.body || { content: 'Test post from simple endpoint' };
    
    // Create post with proper null handling
    if (isSQLite) {
      const result = await dbRun(
        `INSERT INTO posts (user_id, content, image_url)
         VALUES (?, ?, ?)`,
        [user.id, content, null]
      );
      
      const postId = result.rows[0].id;
      
      res.status(201).json({
        message: 'Simple test post created successfully',
        postId: postId,
        user: user
      });
    } else {
      // PostgreSQL - use explicit NULL
      const result = await db.query(
        `INSERT INTO posts (user_id, content, image_url)
         VALUES ($1, $2, NULL)
         RETURNING id`,
        [user.id, content]
      );
      
      const postId = result.rows[0].id;
      
      res.status(201).json({
        message: 'Simple test post created successfully',
        postId: postId,
        user: user
      });
    }
  } catch (error) {
    console.error('Simple test post error:', error);
    res.status(500).json({ 
      error: 'Simple test post failed',
      details: error.message
    });
  }
});

// Test endpoint with bypass authentication
router.post('/test-bypass', bypassAuth, async (req, res) => {
  try {
    console.log('=== TEST BYPASS POST ===');
    console.log('User from bypass auth:', req.user);
    
    const { content } = req.body || { content: 'Test post from bypass auth' };
    const isSQLite = process.env.NODE_ENV !== 'production';

    console.log('About to insert post with user_id:', req.user.id);
    
    if (isSQLite) {
      const result = await dbRun(
        `INSERT INTO posts (user_id, content, image_url)
         VALUES (?, ?, ?)`,
        [req.user.id, content, null]
      );

      console.log('Insert result:', result);
      const postId = result.rows[0].id;
      console.log('Post ID:', postId);
      
      res.status(201).json({
        message: 'Test post created successfully with bypass auth',
        postId: postId,
        user: req.user
      });
    } else {
      // PostgreSQL - use explicit NULL
      const db = getPool();
      const result = await db.query(
        `INSERT INTO posts (user_id, content, image_url)
         VALUES ($1, $2, NULL)
         RETURNING id`,
        [req.user.id, content]
      );

      console.log('Insert result:', result);
      const postId = result.rows[0].id;
      console.log('Post ID:', postId);
      
      res.status(201).json({
        message: 'Test post created successfully with bypass auth',
        postId: postId,
        user: req.user
      });
    }
  } catch (error) {
    console.error('Test bypass post error:', error);
    res.status(500).json({ 
      error: 'Test bypass post failed',
      details: error.message
    });
  }
});

// Test endpoint to check database connection
router.get('/test', async (req, res) => {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const db = getPool();
    const isSQLite = process.env.NODE_ENV !== 'production';
    
    console.log('Database type:', isSQLite ? 'SQLite' : 'PostgreSQL');
    
    if (isSQLite) {
      // Test SQLite connection
      const result = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM posts', (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      console.log('SQLite test result:', result);
    } else {
      // Test PostgreSQL connection
      const result = await db.query('SELECT COUNT(*) as count FROM posts');
      console.log('PostgreSQL test result:', result.rows[0]);
    }
    
    res.json({ 
      status: 'Database connection successful',
      environment: process.env.NODE_ENV,
      databaseType: isSQLite ? 'SQLite' : 'PostgreSQL'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

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
    // PostgreSQL - convert ? placeholders to $1, $2, etc.
    let postgresSQL = sql;
    for (let i = params.length; i > 0; i--) {
      postgresSQL = postgresSQL.replace(/\?/g, `$${i}`);
    }
    
    console.log('PostgreSQL converted SQL:', postgresSQL);
    console.log('PostgreSQL params:', params);
    
    const result = await db.query(postgresSQL, params);
    console.log('PostgreSQL result:', result.rows);
    return { rows: result.rows };
  }
};

const dbRun = async (sql, params = []) => {
  const db = getPool();
  const isSQLite = process.env.NODE_ENV !== 'production';
  
  console.log('dbRun - Environment:', process.env.NODE_ENV);
  console.log('dbRun - SQL:', sql);
  console.log('dbRun - Params:', params);
  
  if (isSQLite) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('SQLite run error:', err);
          reject(err);
        } else {
          console.log('SQLite run result:', { lastID: this.lastID, changes: this.changes });
          resolve({ 
            rows: [{ id: this.lastID }],
            rowCount: this.changes 
          });
        }
      });
    });
  } else {
    // PostgreSQL - convert ? placeholders to $1, $2, etc. and add RETURNING id
    let postgresSQL = sql;
    for (let i = params.length; i > 0; i--) {
      postgresSQL = postgresSQL.replace(/\?/g, `$${i}`);
    }
    
    // Add RETURNING id if it's an INSERT statement
    if (postgresSQL.trim().toUpperCase().startsWith('INSERT') && !postgresSQL.includes('RETURNING')) {
      postgresSQL = postgresSQL.replace(/;$/, '') + ' RETURNING id;';
    }
    
    console.log('PostgreSQL converted SQL:', postgresSQL);
    console.log('PostgreSQL params:', params);
    
    const result = await db.query(postgresSQL, params);
    console.log('PostgreSQL run result:', result);
    return { 
      rows: result.rows.length > 0 ? result.rows : [],
      rowCount: result.rowCount 
    };
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
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const { content } = req.body;
    const isSQLite = process.env.NODE_ENV !== 'production';

    // Validate that content is provided
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Post content is required' });
    }

    console.log('About to insert post with user_id:', req.user.id);
    
    if (isSQLite) {
      const result = await dbRun(
        `INSERT INTO posts (user_id, content, image_url)
         VALUES (?, ?, ?)`,
        [req.user.id, content, null]
      );

      console.log('Insert result:', result);
      const postId = result.rows[0].id;
      console.log('Post ID:', postId);
      
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

      console.log('Post result:', postResult);
      const post = postResult.rows[0];

      res.status(201).json({
        message: 'Post created successfully',
        post: post
      });
    } else {
      // PostgreSQL - use explicit NULL
      const db = getPool();
      const result = await db.query(
        `INSERT INTO posts (user_id, content, image_url)
         VALUES ($1, $2, NULL)
         RETURNING id`,
        [req.user.id, content]
      );

      console.log('Insert result:', result);
      const postId = result.rows[0].id;
      console.log('Post ID:', postId);
      
      // Get the created post with user info
      const postResult = await db.query(`
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
        WHERE p.id = $1
      `, [postId]);

      console.log('Post result:', postResult);
      const post = postResult.rows[0];

      res.status(201).json({
        message: 'Post created successfully',
        post: post
      });
    }
  } catch (error) {
    console.error('Create post error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to create post',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
    });
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