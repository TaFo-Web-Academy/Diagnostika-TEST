-- Миграция: создание таблиц для системы курса

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  subscription_status VARCHAR(20) DEFAULT 'free', -- free, premium, banned
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица ежедневных заданий (предзагруженные)
CREATE TABLE IF NOT EXISTS assignment_templates (
  id SERIAL PRIMARY KEY,
  day_number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица назначенных заданий пользователям (ежедневно)
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES assignment_templates(id),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
  completed_at TIMESTAMP,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, assigned_date)
);

-- Таблица ответов пользователей
CREATE TABLE IF NOT EXISTS user_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  question_key VARCHAR(100), -- например: "q1", "q2", "note"
  answer_text TEXT,
  answer_score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, assignment_id, question_key)
);

-- Таблица прогресса (для streaks, total_points)
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
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_assignments_user_date ON assignments(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_user_answers_user ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_assignment ON user_answers(assignment_id);

-- Вставка тестовых шаблонов заданий (первые 7 дней)
INSERT INTO assignment_templates (day_number, title, content) VALUES
(1, 'КҲАДАМИ 1: ҲАЛЛИ ШАБОНА', 
'<h3>Як ҳолати охиринро навис, ки дар он туро сардӣ, дуршавӣ ё шубҳа шикаст.</h3>
<p>Зери он навис:</p>
<ul>
  <li>он вақт ман чӣ ҳис кардам?</li>
  <li>ман аз чӣ тарсидам?</li>
  <li>ман дар бораи худам чӣ хулосаи бад баровардам?</li>
</ul>
<p>3 бор дар рӯз 10 нафаси чуқур бикаш.</p>'),

(2, 'КҲАДАМИ 2: МОНАЊАТИИ ШАБ', 
'<h3>Вақте хоҳиши тафтиш, ҷанг ё паёми изтиробӣ омад, 10 дақиқа таваққуф кун.</h3>
<p>Ин ҷумлаҳоро баланд ё дар дил бигӯ:</p>
<ul>
  <li>"Ин дарди имрӯз нест."</li>
  <li>"Ман ҳозир кӯдак нестам."</li>
  <li>"Ман метавонам дардро ҳис кунам, бе он ки он маро идора кунад."</li>
</ul>'),

(3, 'КҲАДАМИ 3: ЭЪТИБОРИ ХУД', 
'<p>Ман дар як ҳафта 10 дақиқа ба ҳар як аз ин ҷумлаҳо таваҷҷӯъ кардам:</p>
<ol>
  <li>Ба худ дар бораи як хусусият, ки мепӯшонад, тамоман рост гӯям.</li>
  <li>Дар бораи худ чӣ тасминот дорам?</li>
  <li>Оё ман худро ме sitoyam? Ягонаи ман касӣ мебошад?</li>
</ol>'),

(4, 'КҲАДАМИ 4: БОЗГАШТИ БА ҲАЁТ', 
'<p>Бояд худро ба 3 рафтор кор кунам, ки ман дӯст дорам:</p>
<ol>
  <li>Худро абас кунам ва ба қадри худ шунидам.</li>
  <li>Шогирдӣ диҳам ба қадри заҳмати худамон.</li>
  <li>Мушкилиҳои худро ба ҷойи худ медҳанд.</li>
</ol>'),

(5, 'КҲАДАМИ 5: БОРОИ ЪИЛМ', 
'<p>Аз худ пурсед:</p>
<ul>
  <li>Оё ман дарк мекунам, ки барои дигарон муҳим ам?</li>
  <li>Оё ман мединам, ки чӣ хоҳам?</li>
  <li>Оё ман барои худ ҳис мекунам, ки чи пеш меравад?</li>
</ul>'),

(6, 'КҲАДАМИ 6: НАМОИШИ ОН ЧИ МЕХОҲАМ', 
'<p>Бо худ ва болои ман бояд иброз дорам:</p>
<ol>
  <li>Чӣ компромисс лозим аст?</li>
  <li>Чӣ талабот дорам?</li>
  <li>Чӣ мехоҳам, як шумораи калимо баён кунам?</li>
</ol>'),

(7, 'КҲАДАМИ 7: ХУЛОСАИ ҲАФТА', 
'<p>Дар як ҳафта ман ба ояндои худ чӣ медиҳам? Медонам, ки бо як шахси сабуксу可能要 андак дард мешавам. Бояд худро дар сатҳи зиндагӣ идора кунам!</p>')
ON CONFLICT (day_number) DO NOTHING;
