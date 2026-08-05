const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper function to run SQL queries returning a Promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper function to get a single row
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper function to get all matching rows
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize Tables
async function initDb() {
  db.serialize(async () => {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        student_id TEXT,
        dorm_room TEXT,
        name_khmer TEXT,
        name_latin TEXT,
        gender TEXT,
        date_of_birth TEXT,
        profile_photo TEXT,
        high_school TEXT,
        province TEXT,
        exam_year TEXT,
        grade TEXT,
        major TEXT,
        degree_level TEXT,
        class_code TEXT,
        academic_status TEXT,
        generation TEXT,
        academic_year TEXT,
        phone TEXT,
        telegram TEXT,
        guardian_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist if table was already created
    const profileColumns = [
      'student_id TEXT',
      'dorm_room TEXT',
      'name_khmer TEXT',
      'name_latin TEXT',
      'gender TEXT',
      'date_of_birth TEXT',
      'profile_photo TEXT',
      'high_school TEXT',
      'province TEXT',
      'exam_year TEXT',
      'grade TEXT',
      'major TEXT',
      'degree_level TEXT',
      'class_code TEXT',
      'academic_status TEXT',
      'generation TEXT',
      'academic_year TEXT',
      'phone TEXT',
      'telegram TEXT',
      'guardian_phone TEXT'
    ];

    for (const colDef of profileColumns) {
      try {
        await run(`ALTER TABLE users ADD COLUMN ${colDef}`);
      } catch (e) {
        // Column already exists
      }
    }

    // Categories table
    await run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'BookOpen'
      )
    `);

    // Books table
    await run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT UNIQUE,
        category_id INTEGER,
        description TEXT,
        cover_url TEXT,
        pdf_url TEXT,
        digital_content TEXT,
        copies_total INTEGER DEFAULT 1,
        copies_available INTEGER DEFAULT 1,
        publisher TEXT,
        publish_year INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Ensure columns exist if table was already created
    try {
      await run('ALTER TABLE books ADD COLUMN pdf_url TEXT');
    } catch (e) {}
    try {
      await run('ALTER TABLE books ADD COLUMN digital_content TEXT');
    } catch (e) {}
    try {
      await run('ALTER TABLE books ADD COLUMN read_count INTEGER DEFAULT 0');
    } catch (e) {}
    try {
      await run('ALTER TABLE books ADD COLUMN is_featured INTEGER DEFAULT 0');
    } catch (e) {}

    // Active Readers Tracking Table (For Live Real-time Transient Reading Sessions only)
    await run(`
      CREATE TABLE IF NOT EXISTS active_readers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        session_id TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);

    // Drop persistent reading logs table so read history data is NOT stored in DB
    try {
      await run('DROP TABLE IF EXISTS reading_logs');
    } catch (e) {}

    // Borrowings table
    await run(`
      CREATE TABLE IF NOT EXISTS borrowings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME NOT NULL,
        return_date DATETIME,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, returned, overdue
        admin_notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);

    console.log('[DB] Database tables initialized successfully.');
  });
}

// Run database initialization automatically on load
initDb();

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};
