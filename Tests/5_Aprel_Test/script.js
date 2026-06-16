(function () {
    // ==================== TELEGRAM BOT CREDENTIALS ====================
    const TG_TOKEN = '8524656185:AAFQbFKmLXXO-x9nO3Faq5BsHhBwqLK60mM';
    const TG_CHAT_ID = '-5146416208';
    const TG_ADMIN_URL = 'https://t.me/+wHJobpqzszxmZDUy';
    const TG_ANALYTICS_CHAT_ID = '-5146416208';

    // ==================== APP STATE ====================
    const state = {
        user: {
            id: '',
            name: '',
            surname: '',
            age: '',
            status: '',
            dominantTitle: 'Pre-Course Survey'
        },
        currentQuestionIndex: 0,
        answers: new Array(20).fill(null), // Holds string responses typed by user
        transitioning: false
    };

    // ==================== QUESTIONS DATA ====================
    const questions = [
        { id: 1, text: 'Ҳозир дар муносибат ё никоҳ бештар чӣ шуморо дард медиҳад?' },
        { id: 2, text: 'Агар як ҷумла гӯед, мушкили асосии шумо бо шавҳар/мард чист?' },
        { id: 3, text: 'Шумо бештар аз чӣ метарсед: хиёнат, тарк шудан, рад шудан, танҳо мондан ё беқадр шудан?' },
        { id: 4, text: 'Вақте шавҳар/мард сард мешавад, дар даруни шумо чӣ ҳис бедор мешавад?' },
        { id: 5, text: 'Дар чунин ҳолат шумо одатан чӣ кор мекунед?' },
        { id: 6, text: 'Кадом фикр дар саратон бештар такрор мешавад?' },
        { id: 7, text: 'Шумо аз шавҳар/мард бештар чӣ мехоҳед?' },
        { id: 8, text: 'Шумо мехоҳед ӯ дар рафтораш чӣ чизро дигар кунад?' },
        { id: 9, text: 'Дар асл шумо дар муносибат чӣ ҳис кардан мехоҳед?' },
        { id: 10, text: 'Шумо аз чӣ халос шудан мехоҳед?' },
        { id: 11, text: 'Кадом ҳолат шуморо бештар мешиканад?' },
        { id: 12, text: 'Шумо кай худро беарзиш ҳис мекунед?' },
        { id: 13, text: 'Дар кӯдакӣ чӣ чиз ба шумо намерасид: меҳр, диққат, муҳофизат, қабул, падар, амният ё сухани хуб?' },
        { id: 14, text: 'Ба фикри шумо, решаи дарди имрӯзаатон аз куҷост?' },
        { id: 15, text: 'Шумо пештар барои ҳал кардани ин дард чӣ кор кардед?' },
        { id: 16, text: 'Чӣ чиз ба шумо каме кӯмак кард?' },
        { id: 17, text: 'Чӣ чиз умуман кӯмак накард?' },
        { id: 18, text: 'Агар шумо ба курс ё дарс дохил шавед, аз он чӣ натиҷа гирифтан мехоҳед?' },
        { id: 19, text: 'Шумо мехоҳед баъди 7 ё 21 рӯз худро чӣ гуна бинед?' },
        { id: 20, text: 'Агар ман барои шумо як дарси амиқ созам, кадом мавзӯъро ҳатман мехоҳед, ки дар он бошад?' }
    ];

    // ==================== DOM ELEMENTS ====================
    const progBarWrap = document.getElementById('progBarWrap');
    const progFill = document.getElementById('progFill');
    const loaderOverlay = document.getElementById('ld');
    
    const secIntro = document.getElementById('sec-intro');
    const secAuth = document.getElementById('sec-auth');
    const secQuiz = document.getElementById('sec-quiz');
    const secResults = document.getElementById('sec-results');
    const btnGoRegister = document.getElementById('btn-go-register');

    // Registration inputs & action
    const inputName = document.getElementById('u-name');
    const inputSurname = document.getElementById('u-surname');
    const inputAge = document.getElementById('u-age');
    const selectStatus = document.getElementById('u-status');
    const btnStartTest = document.getElementById('btn-start-test');

    // Quiz elements
    const btnBackQ = document.getElementById('btn-back-q');
    const stepCounter = document.getElementById('stepCounter');
    const qCard = document.getElementById('qCard');
    const qBadge = document.getElementById('qBadge');
    const qText = document.getElementById('qText');
    const optionsList = document.getElementById('optionsList');

    // Results elements
    const resWoundBadge = document.getElementById('resWoundBadge');
    const resTitle = document.getElementById('resTitle');
    const resBodyText = document.getElementById('resBodyText');
    const statsBreakdown = document.getElementById('statsBreakdown');
    const btnTgAdmin = document.getElementById('btn-tg-admin');

    // ==================== NAVIGATION / SCREEN SWITCHING ====================
    function showScreen(targetScreen) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(scr => {
            scr.classList.remove('active');
        });
        
        // Show target
        targetScreen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==================== RENDER QUESTION ====================
    function renderQuestion(index) {
        state.currentQuestionIndex = index;
        const q = questions[index];
        const qNum = index + 1;
        const totalQs = questions.length;

        // Update progress bar
        progBarWrap.classList.add('visible');
        const progressPct = Math.round((index / totalQs) * 100);
        progFill.style.width = progressPct + '%';

        // Update step descriptions
        stepCounter.textContent = `Саволи ${qNum} аз ${totalQs}`;
        qBadge.textContent = `САВОЛИ ${qNum} АЗ ${totalQs}`;
        qText.textContent = q.text;

        // Render textarea and Next button dynamically inside optionsList
        const savedValue = state.answers[index] || '';
        optionsList.innerHTML = `
            <textarea id="answerTextarea" class="answer-textarea" placeholder="Ҷавоби худро ин ҷо нависед..." rows="4">${savedValue}</textarea>
            <button class="btn btn-primary btn-full btn-next-q" id="btnNextQ" style="margin-top: 15px;">
                Давом додан
                <svg class="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
        `;

        const textarea = document.getElementById('answerTextarea');
        const btnNext = document.getElementById('btnNextQ');

        textarea.focus();

        // Check initial state
        btnNext.disabled = (textarea.value.trim().length === 0);

        // Track text changes
        textarea.addEventListener('input', () => {
            btnNext.disabled = (textarea.value.trim().length === 0);
        });

        // Next button click listener
        btnNext.addEventListener('click', () => {
            const val = textarea.value.trim();
            if (val.length > 0) {
                handleAnswerSubmit(val);
            }
        });

        // Toggle back button visibility
        if (index === 0) {
            btnBackQ.style.opacity = '0.3';
            btnBackQ.style.pointerEvents = 'none';
        } else {
            btnBackQ.style.opacity = '1';
            btnBackQ.style.pointerEvents = 'all';
        }
    }

    // ==================== SUBMIT ANSWER ====================
    function handleAnswerSubmit(answerText) {
        if (state.transitioning) return;
        state.transitioning = true;

        const qIndex = state.currentQuestionIndex;
        state.answers[qIndex] = answerText;

        // Proceed to next question with a tiny smooth delay
        setTimeout(() => {
            if (qIndex < questions.length - 1) {
                // Fade out question card temporarily
                qCard.style.opacity = '0';
                qCard.style.transform = 'translateY(10px)';
                qCard.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

                setTimeout(() => {
                    renderQuestion(qIndex + 1);
                    qCard.style.opacity = '1';
                    qCard.style.transform = 'translateY(0)';
                    state.transitioning = false;
                }, 250);
            } else {
                // Complete test
                progFill.style.width = '100%';
                state.transitioning = false;
                processResults();
            }
        }, 200);
    }

    // ==================== BACK BUTTON ====================
    btnBackQ.addEventListener('click', () => {
        if (state.transitioning) return;
        const qIndex = state.currentQuestionIndex;
        if (qIndex > 0) {
            state.transitioning = true;

            // Save current value if any before going back
            const textarea = document.getElementById('answerTextarea');
            if (textarea) {
                state.answers[qIndex] = textarea.value.trim() || null;
            }

            qCard.style.opacity = '0';
            qCard.style.transform = 'translateY(10px)';
            qCard.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

            setTimeout(() => {
                renderQuestion(qIndex - 1);
                qCard.style.opacity = '1';
                qCard.style.transform = 'translateY(0)';
                state.transitioning = false;
            }, 250);
        }
    });

    // ==================== PROCESS RESULTS ====================
    function processResults() {
        loaderOverlay.classList.add('on');

        // Populate results fields
        resWoundBadge.textContent = 'Қабул шуд';
        resTitle.textContent = 'Анкета бо муваффақият қабул шуд!';
        resBodyText.innerHTML = `
            Ташаккур барои ҷавобҳои самимии шумо!<br><br>
            Ҷавобҳои шумо бо муваффақият ба қайд гирифта шуданд ва барои таҳлили инфиродӣ фиристода шуданд. Ин ба мо кӯмак мекунад, ки курси равоншиносиро маҳз барои ҳалли мушкилоти воқеии шумо омода кунем.<br><br>
            Барои гирифтани видео-дарси ҳадия ва маълумоти бештар, лутфан ба канали Telegram-и мо ҳамроҳ шавед.
        `;

        if (statsBreakdown) {
            statsBreakdown.style.display = 'none';
        }

        // Send data to Telegram
        sendTelegramData();
    }

    // ==================== SEND TELEGRAM DATA ====================
    async function sendTelegramData() {
        const userName = `${state.user.name} ${state.user.surname}`;
        const userAge = state.user.age;
        const userStatus = state.user.status;

        // 1. Text caption for the photo/message
        const caption = `🆕 <b>ҶАВОБҲОИ АНКЕТАИ НАВ (КУРСИ ПУЛӢ):</b>\n\n` +
                        `👤 <b>Иштирокчӣ:</b> ${userName}\n` +
                        `📅 <b>Синн:</b> ${userAge} сол\n` +
                        `💍 <b>Статус:</b> ${userStatus}\n` +
                        `🆔 <b>ID:</b> ${state.user.id}\n\n` +
                        `<i>👇 Матни пурраи ҷавобҳои корбар дар файли CSV-и зерин замима шудааст:</i>`;

        try {
            // First: Send photo with details in caption by uploading local enigma_.png
            let photoFormData = new FormData();
            let hasPhoto = false;
            try {
                const photoResponse = await fetch('enigma_.png');
                if (photoResponse.ok) {
                    const photoBlob = await photoResponse.blob();
                    photoFormData.append('chat_id', TG_CHAT_ID);
                    photoFormData.append('photo', photoBlob, 'enigma_.png');
                    photoFormData.append('caption', caption);
                    photoFormData.append('parse_mode', 'HTML');
                    hasPhoto = true;
                }
            } catch (imageErr) {
                console.warn('Could not load local enigma_.png, sending text fallback:', imageErr);
            }

            if (hasPhoto) {
                await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: photoFormData
                });
            } else {
                // Fallback to sendMessage if photo loading failed
                await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TG_CHAT_ID,
                        text: caption,
                        parse_mode: 'HTML'
                    })
                });
            }

            // Second: Generate beautiful CSV and send as document
            await sendCSVReport();

        } catch (err) {
            console.error('Ошибка отправки результатов в Телеграм:', err);
        } finally {
            // Remove loader and display results screen
            loaderOverlay.classList.remove('on');
            progBarWrap.classList.remove('visible'); // Hide progress bar at results
            showScreen(secResults);
        }
    }

    // ==================== GENERATE & SEND CSV REPORT ====================
    async function sendCSVReport() {
        const userName = `${state.user.name} ${state.user.surname}`;
        const userAge = state.user.age;
        const userStatus = state.user.status;

        // Create CSV Content with UTF-8 BOM (\uFEFF) so Excel reads Cyrillic characters correctly
        const BOM = '\uFEFF';
        let csvContent = `МАЪЛУМОТИ ИШТИРОКЧӢ (ANKETAI KURS)\n`;
        csvContent += `Ном ва Насаб;"${userName.replace(/"/g, '""')}"\n`;
        csvContent += `Синну сол;${userAge} сол\n`;
        csvContent += `Ҳолати оилавӣ;"${userStatus.replace(/"/g, '""')}"\n`;
        csvContent += `ID;${state.user.id}\n`;
        csvContent += `Сана;"${new Date().toLocaleString('tg-TJ').replace(/"/g, '""')}"\n\n`;

        csvContent += `ҶАВОБҲОИ АНКЕТА\n`;
        csvContent += `№;Савол;Ҷавоби корбар\n`;

        questions.forEach((q, idx) => {
            const userAnsText = state.answers[idx] || 'Ҷавоб дода нашудааст';
            const escapedQuestion = q.text.replace(/"/g, '""');
            const escapedAnswer = userAnsText.replace(/"/g, '""');
            csvContent += `${idx + 1};"${escapedQuestion}";"${escapedAnswer}"\n`;
        });

        const csvBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const safeFileName = `${state.user.name}_${state.user.surname}_anketa.csv`
            .replace(/[\\\/:\*\?"<>\| ]/g, '_');

        try {
            const csvFormData = new FormData();
            csvFormData.append('chat_id', TG_CHAT_ID);
            csvFormData.append('document', csvBlob, safeFileName);
            csvFormData.append('caption', `Natijahoi anketa (CSV): ${userName} | ID: ${state.user.id}`);

            const tgRes = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendDocument`, {
                method: 'POST',
                body: csvFormData
            });
            const tgJson = await tgRes.json();
            if (!tgJson.ok) {
                console.error('Telegram CSV send failed:', tgJson.description);
            } else {
                console.log('CSV sent to Telegram successfully!');
            }
        } catch (csvErr) {
            console.error('CSV generation/send error:', csvErr);
        }
    }

    // ==================== ANALYTICS (silent Telegram events) ====================
    async function sendAnalytics(eventName, extra) {
        try {
            const now = new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
            let messageText = '';
            if (eventName === 'visit') {
                messageText = `👀 <b>АНАЛИТИКА: Корбар сайтро кушод</b> | ${now}`;
            } else if (eventName === 'test_start') {
                messageText = `▶️ <b>АНАЛИТИКА: Оғози анкета</b> | ${now}\n\n` +
                              `👤 <b>Иштирокчӣ:</b> ${state.user.name} ${state.user.surname}\n` +
                              `📅 <b>Синн:</b> ${state.user.age} сол\n` +
                              `💍 <b>Статус:</b> ${state.user.status}\n` +
                              `🆔 <b>ID:</b> ${state.user.id}`;
            } else if (eventName === 'channel_click') {
                messageText = `📢 <b>АНАЛИТИКА: Гузариш ба канал</b> | ${now}\n\n` +
                              `👤 <b>Иштирокчӣ:</b> ${state.user.name} ${state.user.surname}\n` +
                              `📅 <b>Синн:</b> ${state.user.age} сол\n` +
                              `💍 <b>Статус:</b> ${state.user.status}\n` +
                              `🏆 <b>ID:</b> ${state.user.id}`;
            }
            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TG_ANALYTICS_CHAT_ID,
                    text: messageText,
                    parse_mode: 'HTML'
                })
            });
        } catch(e) { /* silent */ }
    }

    // ==================== EVENT BINDINGS ====================

    // Intro -> Registration screen
    btnGoRegister.addEventListener('click', () => {
        showScreen(secAuth);
    });

    // Auth Form Submit
    btnStartTest.addEventListener('click', async () => {
        const nameVal = inputName.value.trim();
        const surnameVal = inputSurname.value.trim();
        const ageVal = inputAge.value.trim();
        const statusVal = selectStatus.value;

        if (!nameVal || !surnameVal || !ageVal) {
            alert('Лутфан ҳамаи майдонҳоро пур кунед!');
            return;
        }

        btnStartTest.disabled = true;
        const originalText = btnStartTest.textContent;
        btnStartTest.textContent = 'Лутфан мунтазир шавед...';

        // Sequential ID from localStorage: 1, 2, 3, 4, 5...
        const storedId = parseInt(localStorage.getItem('anketa_kurs_user_id') || '0', 10);
        const nextId = storedId + 1;
        localStorage.setItem('anketa_kurs_user_id', nextId);

        // Save states
        state.user.id = nextId;
        state.user.name = nameVal;
        state.user.surname = surnameVal;
        state.user.age = ageVal;
        state.user.status = statusVal;

        // Reset quiz answers & current question index
        state.currentQuestionIndex = 0;
        state.answers = new Array(20).fill(null);

        // Track test start
        sendAnalytics('test_start', `${nameVal} ${surnameVal}`);

        // Transition to Quiz Screen
        showScreen(secQuiz);
        renderQuestion(0);

        btnStartTest.disabled = false;
        btnStartTest.textContent = originalText;
    });

    // Channel Button Click + Analytics
    btnTgAdmin.addEventListener('click', () => {
        const userName = `${state.user.name} ${state.user.surname}`.trim() || 'Номаълум';
        sendAnalytics('channel_click', userName);
        window.open(TG_ADMIN_URL, '_blank');
    });

    // Track page visit on load
    sendAnalytics('visit');

    // Initial log message
    console.log('✨ Анкета бо муваффақият омода шуд.');
})();
