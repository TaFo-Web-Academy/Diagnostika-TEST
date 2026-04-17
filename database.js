const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'test_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка открытия БД:', err.message);
  } else {
    console.log('📀 База данных открыта:', dbPath);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    current_q INTEGER DEFAULT 0,
    answers TEXT DEFAULT '[]',
    status TEXT DEFAULT 'active',
    result_type INTEGER
  )`);

  // Миграция: добавить колонку user_name если её нет
  db.run(`ALTER TABLE sessions ADD COLUMN user_name TEXT`, (err) => {
    // Игнорируем ошибку если колонка уже существует
  });

  db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    result_type INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES sessions(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    link_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;