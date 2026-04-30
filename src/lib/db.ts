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
    // Don't throw here, so the app doesn't crash if tables already exist but check fails
  }
}