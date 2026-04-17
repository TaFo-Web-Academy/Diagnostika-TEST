// ========== КЛИЕНТСКАЯ ЛОГИКА ТЕСТА ==========

const TELEGRAM_LINK = 'https://t.me/jannat_abdullaeva_kanal';
let sessionId = null;
let userName = null;
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];

// DOM элементы
const mainContent = document.getElementById('mainContent');
const progressBar = document.getElementById('progressBar');
const counter = document.getElementById('counter');
const nextBtn = document.getElementById('nextBtn');

// ========== API ФУНКЦИИ ==========

async function startSession() {
  // Проверить есть ли сохранённая сессия
  const savedSessionId = localStorage.getItem('test_sessionId');
  const savedUserName = localStorage.getItem('test_userName') || '';
  
  const response = await fetch('/api/session/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      sessionId: savedSessionId || undefined,
      userName: savedUserName || undefined
    })
  });
  
  const data = await response.json();
  sessionId = data.sessionId;
  userName = data.userName || savedUserName;
  localStorage.setItem('test_sessionId', sessionId);
  
  currentQuestionIndex = data.currentQuestion;
  selectedAnswers = data.answers || [];
  
  return data;
}

async function fetchQuestions() {
  const response = await fetch('/api/questions');
  questions = await response.json();
}

async function submitAnswer(answerIndex) {
  selectedAnswers[currentQuestionIndex] = answerIndex;
  
  const response = await fetch('/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, answerIndex })
  });
  
  const data = await response.json();
  
  if (data.status === 'finished') {
    showResult(data.resultType);
  } else {
    currentQuestionIndex = data.nextQuestion;
    renderQuestion();
  }
}

async function recordClick() {
  try {
    await fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, linkType: 'telegram' })
    });
  } catch (e) {
    console.log('Click recorded (offline mode)');
  }
}

// ========== RENDER ФУНКЦИИ ==========

function renderNameInput() {
  mainContent.innerHTML = `
    <div class="question-text">Ном нависед</div>
    <div class="options-container">
      <input type="text" id="nameInput" class="name-input" 
             placeholder="Номи шумо" maxlength="50" />
    </div>
  `;
  
  const nameInput = document.getElementById('nameInput');
  nameInput.focus();
  
  nextBtn.textContent = 'Огов';
  nextBtn.disabled = true;
  
  nameInput.addEventListener('input', () => {
    nextBtn.disabled = nameInput.value.trim().length < 2;
  });
  
  nextBtn.onclick = async () => {
    const name = nameInput.value.trim();
    if (name.length >= 2) {
      userName = name;
      localStorage.setItem('test_userName', name);
      await startSessionWithName(name);
    }
  };
}

async function startSessionWithName(name) {
  await fetch('/api/session/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userName: name })
  });
  
  nextBtn.textContent = 'Давом додан';
  nextBtn.disabled = true;
  renderQuestion();
}

async function submitAnswer(answerIndex) {
  selectedAnswers[currentQuestionIndex] = answerIndex;
  
  const response = await fetch('/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, answerIndex })
  });
  
  const data = await response.json();
  
  if (data.status === 'finished') {
    showResult(data.resultType);
  } else {
    currentQuestionIndex = data.nextQuestion;
    renderQuestion();
  }
}

async function recordClick() {
  try {
    await fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, linkType: 'telegram' })
    });
  } catch (e) {
    console.log('Click recorded (offline mode)');
  }
}

// ========== RENDER ФУНКЦИИ ==========

function renderQuestion() {
  const q = questions[currentQuestionIndex];
  if (!q) return;
  
  // Обновить прогресс
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  counter.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
  
  // Кнопка "Давом додан" - активна только если выбран ответ
  const savedAnswer = selectedAnswers[currentQuestionIndex];
  nextBtn.disabled = savedAnswer === undefined;
  
  // Рендер вопроса
  mainContent.innerHTML = `
    <div class="question-text">${q.text}</div>
    <div class="options-container">
      ${q.options.map((opt, i) => `
        <button class="option-btn ${savedAnswer === opt.value ? 'selected' : ''}" 
                data-value="${opt.value}">
          ${opt.text}
        </button>
      `).join('')}
    </div>
  `;
  
  // Добавить обработчики на кнопки
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      const value = parseInt(btn.dataset.value);
      selectedAnswers[currentQuestionIndex] = value;
      nextBtn.disabled = false;
    });
  });
}

function showResult(resultType) {
  progressBar.style.width = '100%';
  counter.textContent = '7/7';
  
  const result = getResultData(resultType);
  
  mainContent.innerHTML = `
    <div class="result-card">
      <h2 class="result-title">${result.title}</h2>
      <p class="result-description">${result.description}</p>
      <div class="result-step">
        <strong>${result.stepTitle}</strong><br><br>
        ${result.step}
      </div>
      <a href="${TELEGRAM_LINK}" class="telegram-link" id="telegramLink" target="_blank">
        Дарсхои РОЙГОН
      </a>
    </div>
  `;
  
  nextBtn.style.display = 'none';
  
  // Записать клик при нажатии на ссылку
  document.getElementById('telegramLink').addEventListener('click', () => {
    recordClick();
  });
}

function getResultData(type) {
  const name = userName || '';
  const results = {
    1: {
      title: "ТАРСИ РАДШАВӢ",
      description: name ? `${name}, ту зуд мешиканӣ, чун даруни ту аз хомӯшӣ ва дуршавӣ метарсад. Ту ҳаттан мардро не, балки ҳисси партофта шуданро аз нав зиндагӣ мекунӣ. Барои ҳамин як паём, як беэътиноӣ, як сардӣ туро аз дарун метасонанд.` : "Ту зуд мешиканӣ, чун даруни ту аз хомӯшӣ ва дуршавӣ метарсад. Ту ҳаттан мардро не, балки ҳисси партофта шуданро аз нав зиндагӣ мекунӣ. Барои ҳамин як паём, як беэътиноӣ, як сардӣ туро аз дарун метасонанд.",
      stepTitle: "Қадами аввал:",
      step: name ? `${name}, ту бояд пеш аз ҳама системаи асабатро ором кунӣ ва бифаҳмӣ, ки ҳар хомӯшӣ радшавии ту нест.` : "Ту бояд пеш аз ҳама системаи асабатро ором кунӣ ва бифаҳмӣ, ки ҳар хомӯшӣ радшавии ту нест."
    },
    2: {
      title: "ҶУДОӢ АЗ ХУД",
      description: name ? `${name}, ту худро дар муносибат гум кардаӣ. Эҳтимол бисёр вақт барои дигарон зиндагӣ мекунӣ, аммо худро намешунавӣ. Барои ҳамин дар дарун холигӣ, хастагӣ ва саргардонӣ ҳаст.` : "Ту худро дар муносибат гум кардаӣ. Эҳтимол бисёр вақт барои дигарон зиндагӣ мекунӣ, аммо худро намешунавӣ. Барои ҳамин дар дарун холигӣ, хастагӣ ва саргардонӣ ҳаст.",
      stepTitle: "Қадами аввал:",
      step: name ? `${name}, ту бояд ба худ баргардӣ — ба эҳсос, хоҳиш, ҳақиқат ва арзиши худ.` : "Ту бояд ба худ баргардӣ — ба эҳсос, хоҳиш, ҳақиқат ва арзиши худ."
    },
    3: {
      title: "БЕҚАДРИИ АМИҚ",
      description: name ? `${name}, дарди асосии ту — "ман кофӣ нестам" аст. Барои ҳамин ту зуд худро бо дигарон муқоиса мекунӣ, мехоҳӣ исбот шавӣ ва аз нодида гирифта шудан мешиканӣ.` : "Дарди асосии ту — \"ман кофӣ нестам\" аст. Барои ҳамин ту зуд худро бо дигарон муқоиса мекунӣ, мехоҳӣ исбот шавӣ ва аз нодида гирифта шудан мешиканӣ.",
      stepTitle: "Қадами аввал:",
      step: name ? `${name}, ту бояд решаи беқадриро бинӣ ва барномаи кӯҳнаи "ман камам"-ро бишканӣ.` : "Ту бояд решаи беқадриро бинӣ ва барномаи кӯҳнаи \"ман камам\"-ро бишканӣ."
    }
  };
  
  return results[type] || results[1];
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

nextBtn.addEventListener('click', () => {
  const answer = selectedAnswers[currentQuestionIndex];
  if (answer !== undefined) {
    submitAnswer(answer);
  }
});

// ========== ИНИЦИАЛИЗАЦИЯ ==========

async function init() {
  try {
    await fetchQuestions();
    const session = await startSession();
    
    // Если нет имени - показать экран ввода имени
    if (!session.userName && session.status !== 'finished') {
      renderNameInput();
    } else if (session.status === 'finished') {
      showResult(session.resultType);
    } else {
      nextBtn.textContent = 'Давом додан';
      nextBtn.disabled = true;
      renderQuestion();
    }
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    mainContent.innerHTML = '<p style="text-align:center;color:red;">Хатогӣ рух дод. Лутфан саҳифаро нав кунед.</p>';
  }
}

init();
