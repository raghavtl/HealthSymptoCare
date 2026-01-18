const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "../database");
const dbPath = path.join(dbDir, "healthsymptocare.db");

let db;
let dbAsync;

async function initDB() {
  if (dbAsync) return dbAsync; // prevent multiple init

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbAsync = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create users table
  await dbAsync.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Auto-create admin
  const adminEmail = "admin@healthcare.com";
  const adminPassword = "Admin@123";

  const admin = await dbAsync.get(
    "SELECT id FROM users WHERE email = ?",
    [adminEmail]
  );

  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await dbAsync.run(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      ["Admin", adminEmail, hash, "admin"]
    );
    console.log("✅ Default admin created");
  }

  console.log("✅ SQLite DB initialized");
  return dbAsync;
}

// initialize immediately
initDB();

module.exports = {
  dbAsync
};
