const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Игнорируем запросы к favicon
app.use((req, res, next) => {
  if (req.path === '/favicon.ico') {
    res.status(204).end();
  } else {
    next();
  }
});

// ========== ВОПРОСЫ ТЕСТА ==========
const questions = [
  {
    id: 1,
    text: "Вақте мард сард мешавад ё кам менависад, ту бештар чӣ ҳис мекунӣ?",
    options: [
      { text: "А) асабонӣ мешавам ва дарун-дарун месӯзам", value: 0 },
      { text: "Б) фикр мекунам шояд айби ман аст", value: 1 },
      { text: "В) худро зуд нодаркор ҳис мекунам", value: 2 }
    ]
  },
  {
    id: 2,
    text: "Дар муносибат бештар кадом ҳолат туро мешиканад?",
    options: [
      { text: "А) хомӯшӣ ва дуршавӣ", value: 0 },
      { text: "Б) беэътиноӣ ва сардӣ", value: 1 },
      { text: "В) ҳисси он ки маро интихоб намекунанд", value: 2 }
    ]
  },
  {
    id: 3,
    text: "Вақте дилат дард мекунад, ту одатан чӣ мекунӣ?",
    options: [
      { text: "А) зиёд менависам, мефаҳмонам, исбот мекунам", value: 0 },
      { text: "Б) хомӯш мешавам, вале аз дарун месӯзам", value: 1 },
      { text: "В) гиря мекунам, худро паст ҳис мекунам", value: 2 }
    ]
  },
  {
    id: 4,
    text: "Кадом ҷумла бештар ба ту монанд аст?",
    options: [
      { text: "А) \"Чаро маро намефаҳманд?\"", value: 0 },
      { text: "Б) \"Ман бисёр медиҳам, аммо қадр намекунанд\"", value: 1 },
      { text: "В) \"Шояд ман кофӣ нестам\"", value: 2 }
    ]
  },
  {
    id: 5,
    text: "Ту бештар аз чӣ метарсӣ?",
    options: [
      { text: "А) ки маро партоянд", value: 0 },
      { text: "Б) ки маро дӯст надоранд", value: 1 },
      { text: "В) ки танҳо монам", value: 2 }
    ]
  },
  {
    id: 6,
    text: "Дар даруни ту бештар кадом ҳолат зинда аст?",
    options: [
      { text: "А) рашк ва нооромӣ", value: 0 },
      { text: "Б) хастагӣ ва холигӣ", value: 1 },
      { text: "В) беқадрӣ ва шикастагӣ", value: 2 }
    ]
  },
  {
    id: 7,
    text: "Агар рост ҷавоб диҳӣ, ту имрӯз бештар ба чӣ ниёз дорӣ?",
    options: [
      { text: "А) оромӣ", value: 0 },
      { text: "Б) қувват", value: 1 },
      { text: "В) баргаштан ба худ", value: 2 }
    ]
  }
];

const results = {
  1: {
    title: "ТАРСИ РАДШАВӢ",
    description: "Ту зуд мешиканӣ, чун даруни ту аз хомӯшӣ ва дуршавӣ метарсад. Ту ҳаттан мардро не, балки ҳисси партофта шуданро аз нав зиндагӣ мекунӣ. Барои ҳамин як паём, як беэътиноӣ, як сардӣ туро аз дарун метасонанд.",
    step: "Қадами аввал: ту бояд пеш аз ҳама системаи асабатро ором кунӣ ва бифаҳмӣ, ки ҳар хомӯшӣ радшавии ту нест."
  },
  2: {
    title: "ҶУДОӢ АЗ ХУД",
    description: "Ту худро дар муносибат гум кардаӣ. Эҳтимол бисёр вақт барои дигарон зиндагӣ мекунӣ, аммо худро намешунавӣ. Барои ҳамин дар дарун холигӣ, хастагӣ ва саргардонӣ ҳаст.",
    step: "Қадами аввал: ту бояд ба худ баргардӣ — ба эҳсос, хоҳиш, ҳақиқат ва арзиши худ."
  },
  3: {
    title: "БЕҚАДРИИ АМИҚ",
    description: "Дарди асосии ту — \"ман кофӣ нестам\" аст. Барои ҳамин ту зуд худро бо дигарон муқоиса мекунӣ, мехоҳӣ исбот шавӣ ва аз нодида гирифта шудан мешиканӣ.",
    step: "Қадами аввал: ту бояд решаи беқадриро бинӣ ва барномаи кӯҳнаи \"ман камам\"-ро бишканӣ."
  }
};

// Генерация нового ID сессии
function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

// ========== API РОУТЫ ==========

// 0. Получить вопросы теста
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// 1. Начать новую сессию или получить существующую
app.post('/api/session/start', (req, res) => {
  const { sessionId, userName } = req.body;
  
  if (sessionId) {
    // Проверить существование сессии
    db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) {
        // Обновить имя если новое
        if (userName && !row.user_name) {
          db.run('UPDATE sessions SET user_name = ? WHERE id = ?', [userName, sessionId]);
        }
        return res.json({ 
          sessionId: row.id, 
          userName: row.user_name,
          currentQuestion: row.current_q,
          answers: JSON.parse(row.answers),
          status: row.status,
          resultType: row.result_type
        });
      } else {
        // Сессия не найдена — создаём новую
        const newId = generateSessionId();
        db.run('INSERT INTO sessions (id, user_name) VALUES (?, ?)', [newId, userName || null], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ 
            sessionId: newId, 
            userName: userName,
            currentQuestion: 0,
            answers: [],
            status: 'active'
          });
        });
      }
    });
  } else {
    // Нет sessionId — создаём новую
    const newId = generateSessionId();
    db.run('INSERT INTO sessions (id, user_name) VALUES (?, ?)', [newId, userName || null], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        sessionId: newId, 
        userName: userName,
        currentQuestion: 0,
        answers: [],
        status: 'active'
      });
    });
  }
});

// 2. Отправить ответ на текущий вопрос
app.post('/api/answer', (req, res) => {
  const { sessionId, answerIndex } = req.body; // answerIndex: 0,1,2 (A,B,V)
  if (!sessionId || answerIndex === undefined) {
    return res.status(400).json({ error: 'sessionId and answerIndex required' });
  }

  db.get('SELECT * FROM sessions WHERE id = ? AND status = "active"', [sessionId], (err, session) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!session) return res.status(404).json({ error: 'Session not found or already finished' });

    let answers = JSON.parse(session.answers);
    const currentQ = session.current_q;
    
    // Если ответ для текущего вопроса уже был, заменяем, иначе добавляем
    if (answers.length > currentQ) {
      answers[currentQ] = answerIndex;
    } else {
      answers.push(answerIndex);
    }

    const nextQ = currentQ + 1;
    const totalQuestions = 7;
    let newStatus = 'active';
    let resultType = null;

    // Проверка, завершён ли тест
    if (nextQ >= totalQuestions) {
      newStatus = 'finished';
      // Подсчёт результатов
      const counts = { A: 0, B: 0, V: 0 };
      answers.forEach(idx => {
        if (idx === 0) counts.A++;
        else if (idx === 1) counts.B++;
        else if (idx === 2) counts.V++;
      });
      // Определяем тип результата
      let maxType = 'A';
      if (counts.B > counts.A && counts.B > counts.V) maxType = 'B';
      else if (counts.V > counts.A && counts.V > counts.B) maxType = 'V';
      
      const typeMap = { 'A': 1, 'B': 2, 'V': 3 };
      resultType = typeMap[maxType] || 1;
    }

    db.run(
      `UPDATE sessions 
       SET answers = ?, current_q = ?, status = ?, result_type = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [JSON.stringify(answers), nextQ, newStatus, resultType, sessionId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Если тест завершён — записать результат в отдельную таблицу
        if (newStatus === 'finished') {
          db.run('INSERT INTO results (session_id, result_type) VALUES (?, ?)', [sessionId, resultType]);
        }
        
        res.json({ 
          success: true, 
          nextQuestion: nextQ, 
          status: newStatus,
          resultType: resultType 
        });
      }
    );
  });
});

// 3. Получить текущий прогресс (для восстановления)
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Session not found' });
    res.json({
      sessionId: row.id,
      currentQuestion: row.current_q,
      answers: JSON.parse(row.answers),
      status: row.status,
      resultType: row.result_type
    });
  });
});

// 4. Записать клик по ссылке (Telegram)
app.post('/api/click', (req, res) => {
  const { sessionId, linkType } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  
  db.run('INSERT INTO clicks (session_id, link_type) VALUES (?, ?)', [sessionId, linkType || 'telegram'], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 5. (Опционально) Админ-статистика
app.get('/api/admin/stats', (req, res) => {
  const queries = {
    totalSessions: `SELECT COUNT(*) as count FROM sessions`,
    finishedSessions: `SELECT COUNT(*) as count FROM sessions WHERE status = 'finished'`,
    notFinishedSessions: `SELECT COUNT(*) as count FROM sessions WHERE status = 'active'`,
    resultsBreakdown: `SELECT result_type, COUNT(*) as count FROM sessions WHERE status = 'finished' GROUP BY result_type`,
    clicksCount: `SELECT COUNT(*) as count FROM clicks`,
    dailyStats: `SELECT DATE(s.created_at) as date, COUNT(DISTINCT s.id) as sessions, COUNT(DISTINCT CASE WHEN s.status = 'finished' THEN s.id END) as finished, COUNT(DISTINCT c.id) as clicks FROM sessions s LEFT JOIN clicks c ON s.id = c.session_id WHERE s.created_at >= datetime('now', '-10 days') GROUP BY DATE(s.created_at) ORDER BY date ASC`,
    hourlyStats: `SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count FROM sessions WHERE created_at >= datetime('now', '-7 days') GROUP BY hour ORDER BY hour`,
    bothFinishedAndClicked: `SELECT COUNT(DISTINCT s.id) as count FROM sessions s INNER JOIN clicks c ON s.id = c.session_id WHERE s.status = 'finished'`
  };
  
  const stats = {};
  db.get(queries.totalSessions, (err, row) => { stats.totalSessions = row?.count || 0; });
  db.get(queries.finishedSessions, (err, row) => { stats.finishedSessions = row?.count || 0; });
  db.get(queries.notFinishedSessions, (err, row) => { stats.notFinishedSessions = row?.count || 0; });
  db.all(queries.resultsBreakdown, (err, rows) => { stats.resultsBreakdown = rows; });
  db.get(queries.clicksCount, (err, row) => { stats.clicksCount = row?.count || 0; });
  db.all(queries.dailyStats, (err, rows) => { stats.dailyStats = rows; });
  db.all(queries.hourlyStats, (err, rows) => { stats.hourlyStats = rows; });
  db.get(queries.bothFinishedAndClicked, (err, row) => { stats.bothFinishedAndClicked = row?.count || 0; });
  
  setTimeout(() => res.json(stats), 100); // небольшая задержка, чтобы все запросы выполнились
});

// 6. Админ-панель
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 7. Последние сессии для админки
app.get('/api/admin/recent', (req, res) => {
  db.all('SELECT * FROM sessions ORDER BY created_at DESC LIMIT 15000', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// 8. Поиск по ID (user_name)
app.get('/api/admin/search', (req, res) => {
  const { query } = req.query;
  if (!query || query.length < 2) {
    return res.json([]);
  }
  
  // Ищем по ID или user_name
  db.all(`SELECT * FROM sessions WHERE id LIKE ? OR user_name LIKE ? ORDER BY created_at DESC LIMIT 20`, 
    [`%${query}%`, `%${query}%`], 
    (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// 9. Экспорт всех данных (CSV)
app.get('/api/admin/export', (req, res) => {
  const { format } = req.query;
  
  db.all('SELECT * FROM sessions ORDER BY created_at DESC', (err, sessions) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (format === 'csv') {
      // CSV export
      const headers = ['ID', 'Имя', 'Дата', 'Вопрос', 'Статус', 'Результат'];
      let csv = headers.join(',') + '\n';
      
      const resultNames = { 1: 'Тарси радшавӣ', 2: 'Ҷудоӣ аз худ', 3: 'Беқадрии амиқ' };
      
      sessions.forEach(s => {
        const row = [
          s.id,
          s.user_name || '',
          s.created_at || '',
          s.current_q,
          s.status,
          resultNames[s.result_type] || ''
        ].join(',');
        csv += row + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=diagnostics_export.csv');
      res.send(csv);
    } else {
      // JSON export
      res.json(sessions);
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});