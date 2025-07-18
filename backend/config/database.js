const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let pool;
let db;

const connectDB = async () => {
  try {
    // Use SQLite for local development, PostgreSQL for production
    if (process.env.NODE_ENV === 'production') {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      // Test the connection
      const client = await pool.connect();
      console.log('✅ PostgreSQL database connected successfully');
      client.release();
    } else {
      // Use SQLite for local development
      const dbPath = path.join(__dirname, '../data/prok.db');
      db = new sqlite3.Database(dbPath);
      
      console.log('✅ SQLite database connected successfully');
    }

    // Create tables if they don't exist
    await createTables();
    
    return process.env.NODE_ENV === 'production' ? pool : db;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

const createTables = async () => {
  if (process.env.NODE_ENV === 'production') {
    const client = await pool.connect();
    
    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          bio TEXT,
          avatar_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Posts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          image_url VARCHAR(255),
          likes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Likes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS likes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, post_id)
        )
      `);

      console.log('✅ PostgreSQL tables created/verified');
    } catch (error) {
      console.error('❌ Error creating PostgreSQL tables:', error);
      throw error;
    } finally {
      client.release();
    }
  } else {
    // SQLite tables
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Users table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Posts table
        db.run(`
          CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT NOT NULL,
            image_url TEXT,
            likes_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `);

        // Likes table
        db.run(`
          CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            post_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
            UNIQUE(user_id, post_id)
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating SQLite tables:', err);
            reject(err);
          } else {
            console.log('✅ SQLite tables created/verified');
            resolve();
          }
        });
      });
    });
  }
};

const getPool = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!pool) {
      throw new Error('Database not connected. Call connectDB() first.');
    }
    return pool;
  } else {
    if (!db) {
      throw new Error('Database not connected. Call connectDB() first.');
    }
    return db;
  }
};

module.exports = {
  connectDB,
  getPool,
  createTables
}; 