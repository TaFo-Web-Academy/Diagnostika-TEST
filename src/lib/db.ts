import { sql } from '@vercel/postgres';

// Экспортируем sql, чтобы другие файлы могли его использовать
export { sql };

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      surname TEXT,
      age INTEGER,
      marital_status TEXT,
      promo_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS answers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      day_number INTEGER,
      question_index INTEGER,
      selected_option CHAR(1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}