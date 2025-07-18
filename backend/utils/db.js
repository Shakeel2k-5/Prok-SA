const { getPool } = require('../config/database');

class DatabaseHelper {
  constructor() {
    this.db = getPool();
    this.isSQLite = process.env.NODE_ENV !== 'production';
  }

  async query(sql, params = []) {
    if (this.isSQLite) {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows });
          }
        });
      });
    } else {
      return this.db.query(sql, params);
    }
  }

  async get(sql, params = []) {
    if (this.isSQLite) {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: row ? [row] : [] });
          }
        });
      });
    } else {
      const result = await this.db.query(sql, params);
      return { rows: result.rows };
    }
  }

  async run(sql, params = []) {
    if (this.isSQLite) {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
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
      return this.db.query(sql, params);
    }
  }
}

module.exports = DatabaseHelper; 