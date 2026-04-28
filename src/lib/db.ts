import { sql } from '@vercel/postgres';

export { sql };

export async function initDb() {
  // Создаем НОВЫЕ таблицы с уникальным префиксом ravoni_
  await sql`
    CREATE TABLE IF NOT EXISTS ravoni_users (
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
    CREATE TABLE IF NOT EXISTS ravoni_answers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ravoni_users(id),
      day_number INTEGER,
      question_index INTEGER,
      selected_option CHAR(1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}