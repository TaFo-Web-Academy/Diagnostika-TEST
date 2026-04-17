import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
  // Создаём таблицы если их нет
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_name VARCHAR(255),
      current_q INTEGER DEFAULT 0,
      answers JSONB DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'active',
      result_type INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(64) REFERENCES sessions(id),
      result_type INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(64) REFERENCES sessions(id),
      link_type VARCHAR(20) DEFAULT 'telegram',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Создаём индексы
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_results_session ON results(session_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_clicks_session ON clicks(session_id)`;
}

// Экспорт для использования в API
export { sql };