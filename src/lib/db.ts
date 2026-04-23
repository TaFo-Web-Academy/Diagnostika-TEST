import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
  // Таблица пользователей
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      telegram_id VARCHAR(100) UNIQUE,
      phone VARCHAR(20),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      subscription_status VARCHAR(20) DEFAULT 'free',
      subscription_start TIMESTAMP,
      subscription_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Таблица шаблонов заданий
  await sql`
    CREATE TABLE IF NOT EXISTS assignment_templates (
      id SERIAL PRIMARY KEY,
      day_number INTEGER NOT NULL UNIQUE,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Таблица назначенных заданий
  await sql`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      template_id INTEGER REFERENCES assignment_templates(id),
      assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
      status VARCHAR(20) DEFAULT 'pending',
      completed_at TIMESTAMP,
      score INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, assigned_date)
    )
  `;

  // Таблица ответов пользователей
  await sql`
    CREATE TABLE IF NOT EXISTS user_answers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
      question_key VARCHAR(100),
      answer_text TEXT,
      answer_score INTEGER DEFAULT 0,
      is_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, assignment_id, question_key)
    )
  `;

  // Таблица прогресса пользователя
  await sql`
    CREATE TABLE IF NOT EXISTS user_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      total_days_completed INTEGER DEFAULT 0,
      last_completed_date DATE,
      level INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Оставляем старые таблицы для совместимости (sessions, results, clicks)
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_name VARCHAR(255),
      current_q INTEGER DEFAULT 0,
      answers JSONB DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'active',
      result_type INTEGER,
      user_note TEXT,
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

  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at)`;

  // Индексы для новых таблиц
  await sql`CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_assignments_user_date ON assignments(user_id, assigned_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_answers_user ON user_answers(user_id)`;

  // Автозагрузка шаблонов заданий если их нет
  const templatesCount = await sql`SELECT COUNT(*) as count FROM assignment_templates`;
  if (Number(templatesCount.rows[0]?.count || 0) === 0) {
    await sql`
      INSERT INTO assignment_templates (day_number, title, content) VALUES
      (1, 'КҲАДАМИ 1: ҲАЛЛИ ШАБОНА', 
       '<h3>Як ҳолати охиринро навис, ки дар он туро сардӣ, дуршавӣ ё шубҳа шикаст.</h3>
        <p>Зери он навис:</p>
        <ul><li>он вақт ман чӣ ҳис кардам?</li><li>ман аз чӣ тарсидам?</li><li>ман дар бораи худам чӣ хулосаи бад баровардам?</li></ul>
        <p>3 бор дар рӯз 10 нафаси чуқур бикаш.</p>'),
      (2, 'КҲАДАМИ 2: МОНАЊАТИИ ШАБ', 
       '<h3>Вақте хоҳиши тафтиш, ҷанг ё паёми изтиробӣ омад, 10 дақиқа таваққуф кун.</h3>
        <p>Ин ҷумлаҳоро баланд ё дар дил бигӯ:</p>
        <ul><li>"Ин дарди имрӯз нест."</li><li>"Ман ҳозир кӯдак нестам."</li><li>"Ман метавонам дардро ҳис кунам, бе он ки он маро идора кунад."</li></ul>'),
      (3, 'КҲАДАМИ 3: ЭЪТИБОРИ ХУД', 
       '<p>Ман дар як ҳафта 10 дақиқа ба ҳар як аз ин ҷумлаҳо таваҷҷӯъ кардам:</p>
        <ol><li>Ба худ дар бораи як хусусият, ки мепӯшонад,тамоман рост гӯям.</li><li>Дар бораи худ чӣ тасминот дорам?</li><li>Оё ман худро мединам? Ягонаи ман касӣ мебошад?</li></ol>'),
      (4, 'КҲАДАМИ 4: БОЗГАШТИ БА ҲАЁТ', 
       '<p>Бояд худро ба 3 рафтор кор кунам, ки ман дӯст дорам:</p>
        <ol><li>Худро эҳтиром кунам ва ба қадри худ шунидам.</li><li>Шогирдӣ диҳам ба қадри заҳмати худамон.</li><li>Мушкилиҳои худро ба ҷойи худ медҳанд.</li></ol>'),
      (5, 'КҲАДАМИ 5: БОРОИ ЪИЛМ', 
       '<p>Аз худ пурсед:</p>
        <ul><li>Оё ман дарк мекунам, ки барои дигарон муҳим ам?</li><li>Оё ман мединам, ки чӣ хоҳам?</li><li>Оё ман барои худ ҳис мекунам, ки чи пеш меравад?</li></ul>'),
      (6, 'КҲАДАМИ 6: НАМОИШИ ОН ЧИ МЕХОҲАМ', 
       '<p>Бо худ ва болои ман бояд иброз дорам:</p>
        <ol><li>Чӣ компромисс лозим аст?</li><li>Чӣ талабот дорам?</li><li>Чӣ мехоҳам, як шумораи калимо баён кунам?</li></ol>'),
      (7, 'КҲАДАМИ 7: ХУЛОСАИ ҲАФТА', 
       '<p>Дар як ҳафта ман ба ояндои худ чӣ медиҳам? Медонам, ки бо як шахси сабуксу... возможно андак дард мешавам. Бояд худро дар сатҳи зиндагӣ идора кунам!</p>')
      ON CONFLICT (day_number) DO NOTHING;
    `;
  }

  // Автосоздание прогресса для существующих пользователей
  await sql`
    INSERT INTO user_progress (user_id)
    SELECT id FROM users
    WHERE id NOT IN (SELECT user_id FROM user_progress)
    ON CONFLICT (user_id) DO NOTHING
  `;

  // Автоматическое создание assignment на сегодня для пользователей у которых его нет
  await sql`
    INSERT INTO assignments (user_id, template_id, assigned_date, status)
    SELECT 
      u.id as user_id,
      COALESCE(
        (SELECT id FROM assignment_templates 
         WHERE day_number = EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 1 
         LIMIT 1),
        (SELECT id FROM assignment_templates ORDER BY day_number LIMIT 1)
      ) as template_id,
      CURRENT_DATE as assigned_date,
      'pending' as status
    FROM users u
    WHERE NOT EXISTS (
      SELECT 1 FROM assignments a 
      WHERE a.user_id = u.id AND a.assigned_date = CURRENT_DATE
    )
    ON CONFLICT (user_id, assigned_date) DO NOTHING
  `;
}

// Экспорт для использования в API
export { sql };