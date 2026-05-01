import { sql } from '@vercel/postgres';

export { sql };

export async function initDb() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS ravoni_users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        surname TEXT,
        age INTEGER,
        marital_status TEXT,
        gender TEXT,
        promo_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Migration: ensure gender column exists (for existing tables)
    try {
      await sql`ALTER TABLE ravoni_users ADD COLUMN IF NOT EXISTS gender TEXT;`;
    } catch (e) {
      // Column might already exist or other issue, ignore
    }

    // Create answers table
    await sql`
      CREATE TABLE IF NOT EXISTS ravoni_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        day_number INTEGER,
        question_index INTEGER,
        selected_option TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database Init Error:', error);
  }
}