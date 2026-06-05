(function () {
    // ==================== TELEGRAM BOT CREDENTIALS ====================
    const TG_TOKEN = '8524656185:AAFQbFKmLXXO-x9nO3Faq5BsHhBwqLK60mM';
    const TG_CHAT_ID = '-5146416208';
    const TG_ADMIN_URL = 'https://t.me/Jannat_Abdullaeva_Admin';

    // ==================== APP STATE ====================
    const state = {
        user: {
            name: '',
            surname: '',
            age: '',
            status: ''
        },
        currentQuestionIndex: 0,
        answers: new Array(15).fill(null), // Will contain indices 0, 1, 2, 3 corresponding to A, B, C, D
        transitioning: false
    };

    // ==================== QUESTIONS DATA ====================
    const questions = [
        {
            id: 1,
            text: 'Вақте мард камтар менависад, ту чӣ ҳис мекунӣ?',
            options: [
                { letter: 'A', text: 'Метарсам, ки дигар маро намехоҳад.' },
                { letter: 'B', text: 'Фикр мекунам, ки шояд ман дигар ҷаззоб нестам.' },
                { letter: 'C', text: 'Сард мешавам ва нишон медиҳам, ки ба ман фарқ надорад.' },
                { letter: 'D', text: 'Мехоҳам фаҳмам чӣ шуд, назорат кунам, савол диҳам.' }
            ]
        },
        {
            id: 2,
            text: 'Дар муносибат ту бештар чӣ кор мекунӣ?',
            options: [
                { letter: 'A', text: 'Муҳаббат ва диққат мепурсам.' },
                { letter: 'B', text: 'Мехоҳам ҳамеша ҷолиб ва дилхоҳ бошам.' },
                { letter: 'C', text: 'Худро қавӣ, дастнорас ва арзишманд нишон медиҳам.' },
                { letter: 'D', text: 'Масъулият, кор, тартиб ва мушкилҳоро худам мекашам.' }
            ]
        },
        {
            id: 3,
            text: 'Вақте мард хунук мешавад, аввалин реаксияи ту чист?',
            options: [
                { letter: 'A', text: 'Мечаспам, зиёд менависам, ҷавоб мехоҳам.' },
                { letter: 'B', text: 'Кӯшиш мекунам зеботар, ҷаззобтар, дигархелтар шавам.' },
                { letter: 'C', text: 'Ман ҳам хунук мешавам, то ӯ фаҳмад ман арзиш дорам.' },
                { letter: 'D', text: 'Мехоҳам ӯро ислоҳ кунам: “ту бояд ин хел кунӣ.”' }
            ]
        },
        {
            id: 4,
            text: 'Ту аз чӣ бештар метарсӣ?',
            options: [
                { letter: 'A', text: 'Маро тарк мекунанд.' },
                { letter: 'B', text: 'Маро дигар намехоҳанд.' },
                { letter: 'C', text: 'Маро паст мезананд ё беқадр мекунанд.' },
                { letter: 'D', text: 'Ман бе амният, бе пул, бе пуштибон мемонам.' }
            ]
        },
        {
            id: 5,
            text: 'Дар назди мард ту чӣ гуна мешавӣ?',
            options: [
                { letter: 'A', text: 'Бисёр эҳсосӣ, ҳассос, нозук.' },
                { letter: 'B', text: 'Бисёр ҷаззоб, бозӣкунанда, мехоҳам писанд оям.' },
                { letter: 'C', text: 'Назоратшуда, боақл, кам эҳсос нишон медиҳам.' },
                { letter: 'D', text: 'Масъул, ҷиддӣ, мисли касе ки ҳама чизро медонад.' }
            ]
        },
        {
            id: 6,
            text: 'Кадом ҷумла ба ту бештар рост меояд?',
            options: [
                { letter: 'A', text: '“Ман мехоҳам мард маро интихоб кунад.”' },
                { letter: 'B', text: '“Ман мехоҳам мард маро сахт хоҳиш кунад.”' },
                { letter: 'C', text: '“Ман мехоҳам мард арзиши маро фаҳмад.”' },
                { letter: 'D', text: '“Ман мехоҳам мард масъул бошад, вале охир ҳама чизро худам мекунам.”' }
            ]
        },
        {
            id: 7,
            text: 'Вақте ту ранҷида мешавӣ, чӣ мекунӣ?',
            options: [
                { letter: 'A', text: 'Гиря мекунам, хафа мешавам, интизор мешавам ӯ маро ором кунад.' },
                { letter: 'B', text: 'Мехоҳам ӯ рашк кунад ё бубинад, ки ман барои дигарон ҳам ҷолибам.' },
                { letter: 'C', text: 'Хомӯш мешавам, дур мешавам, девор месозам.' },
                { letter: 'D', text: 'Сар мекунам фаҳмондан, таълим додан, “duwust” кардан.' } // Note: "дуруст"
            ]
        },
        {
            id: 8,
            text: 'Дар муносибат ту чӣ чизро зиёд медиҳӣ?',
            options: [
                { letter: 'A', text: 'Эҳсос, муҳаббат, интизорӣ.' },
                { letter: 'B', text: 'Ҷаззобият, наздикӣ, энергия.' },
                { letter: 'C', text: 'Маслиҳат, фикр, сатҳ, талабот.' },
                { letter: 'D', text: 'Ғамхорӣ, хизмат, пул, вақт, назорат.' }
            ]
        },
        {
            id: 9,
            text: 'Мард назди ту худро чӣ гуна ҳис мекунад?',
            options: [
                { letter: 'A', text: 'Гӯё бояд ҳамеша туро ором кунад.' },
                { letter: 'B', text: 'Гӯё бояд ҳамеша туро хоҳиш кунад, то ту худро арзишманд ҳис кунӣ.' },
                { letter: 'C', text: 'Гӯё бояд ба сатҳи ту расад, вагарна рад мешавад.' },
                { letter: 'D', text: 'Гӯё ту модар ё роҳбари ӯ ҳастӣ.' }
            ]
        },
        {
            id: 10,
            text: 'Кадом ҳолат ҷолибияти туро бештар мекушад?',
            options: [
                { letter: 'A', text: 'Тарс ва часпидан.' },
                { letter: 'B', text: 'Шарм аз бадан ё исботи ҷаззобият.' },
                { letter: 'C', text: 'Хунукӣ ва дастнорасӣ.' },
                { letter: 'D', text: 'Назорат ва модаршавӣ.' }
            ]
        },
        {
            id: 11,
            text: 'Вақте мард тӯҳфа ё кӯмак медиҳад, ту чӣ мекунӣ?',
            options: [
                { letter: 'A', text: 'Мехоҳам, вале дарун метарсам, ки баъд ӯ меравад.' },
                { letter: 'B', text: 'Қабул мекунам, вале мехоҳам ӯ бештар хоҳиш кунад.' },
                { letter: 'C', text: 'Гӯё ба ман лозим нест, ман худам метавонам.' },
                { letter: 'D', text: 'Мегӯям: “мон, худам мекунам.”' }
            ]
        },
        {
            id: 12,
            text: 'Дар кӯдакӣ ту бештар чӣ ҳис мекардӣ?',
            options: [
                { letter: 'A', text: 'Маро кам диданд, кам шуниданд, кам оғӯш гирифтанд.' },
                { letter: 'B', text: 'Аз бадан, зебоӣ ё хоҳишҳои ман шарм медоданд.' },
                { letter: 'C', text: 'Маро муқоиса мекарданд, паст мезаданд ё маҷбур мекарданд исбот кунам.' },
                { letter: 'D', text: 'Ман барвақт калон шудам, масъулият зиёд буд.' }
            ]
        },
        {
            id: 13,
            text: 'Ту дар назди мард чӣ чизро пинҳон мекунӣ?',
            options: [
                { letter: 'A', text: 'Эҳтиёҷи сахтам ба муҳаббат.' },
                { letter: 'B', text: 'Шарм ё тарси рад шудани баданам.' },
                { letter: 'C', text: 'Тарси беарзиш буданам.' },
                { letter: 'D', text: 'Хастагӣ аз ҳама чизро худ кашидан.' }
            ]
        },
        {
            id: 14,
            text: 'Агар мард қавӣ набошад, ту чӣ мекунӣ?',
            options: [
                { letter: 'A', text: 'Боз ҳам мечаспам, шояд дигар шавад.' },
                { letter: 'B', text: 'Кӯшиш мекунам бо ҷаззобият ӯро нигоҳ дорам.' },
                { letter: 'C', text: 'Ӯро дар дил паст мебинам ва сард мешавам.' },
                { letter: 'D', text: 'Худам ҷойи ӯ қарор мегирам ва ҳама чизро мекашам.' }
            ]
        },
        {
            id: 15,
            text: 'Сабаби асосии кам шудани ҷолибияти ту барои мард чист?',
            options: [
                { letter: 'A', text: 'Ту аз тарси тарк шудан мечаспӣ.' },
                { letter: 'B', text: 'Ту муҳаббатро бо ҷаззобият исбот кардан омехта мекунӣ.' },
                { letter: 'C', text: 'Ту аз тарси паст шудан хунук ва дастнорас мешавӣ.' },
                { letter: 'D', text: 'Ту ба мард модар, роҳбар ё наҷотдиҳанда мешавӣ.' }
            ]
        }
    ];

    // ==================== RESULTS DETAILS DATA ====================
    const resultsDetails = {
        'A': {
            badgeName: 'Духтарчаи захмӣ',
            title: 'Духтарчаи захмӣ',
            text: `Ту муҳаббат мехоҳӣ, вале бисёр вақт аз тарси тарк шудан амал мекунӣ.

Ту метавонӣ:
- зуд вобаста шавӣ;
- паём ва занги мардро санҷӣ;
- аз хунукии ӯ вайрон шавӣ;
- арзиши худро аз рафтори мард гирӣ.

**Чаро ҷолибият кам мешавад?**
Чун мард дар назди ту на озодӣ, балки фишори эҳсосӣ ҳис мекунад. Ӯ ҳис мекунад, ки бояд ҳамеша туро наҷот диҳад, ором кунад, исбот кунад.

**Дарди асосӣ:**
“Ман метарсам, ки маро тарк мекунанд.”

**Ба ту чӣ лозим аст?**
Қабул кардани муҳаббат бе часпидан. Омӯхтани оромӣ, хударзиш ва амнияти дохилӣ.`
        },
        'B': {
            badgeName: 'Любовницаи захмӣ',
            title: 'Любовницаи захмӣ',
            text: `Ту мехоҳӣ ҷаззоб, дилхоҳ ва зинда бошӣ, вале дар дарун шояд шарм, тарси радшавӣ ё таҷрибаи истифода шудан дорӣ.

Ту метавонӣ:
- худро бо бадан исбот кунӣ;
- фикр кунӣ, ки агар мард туро нахоҳад, пас ту арзиш надорӣ;
- рашк кунӣ;
- ё баръакс, аз бадан ва наздикӣ хунук шавӣ.

**Чаро ҷолибият кам мешавад?**
Чун ҷаззобият вақте аз тарс меояд, мард онро ҳамчун норасоӣ ҳис мекунад, на ҳамчун пурӣ. Ин дигар лаззат нест — ин исбот аст.

**Дарди асосӣ:**
“Ман метарсам, ки маро дигар намехоҳанд.”

**Ба ту чӣ лозим аст?**
Бозгашт ба бадан, лаззат, зебоӣ ва ҷаззобият бе исбот кардан.`
        },
        'C': {
            badgeName: 'Маликаи захмӣ',
            title: 'Маликаи захмӣ',
            text: `Ту арзиш мехоҳӣ, эҳтиром мехоҳӣ, сатҳ мехоҳӣ. Лекин баъзан барои муҳофизати худ сард, мағрур ё дастнорас мешавӣ.

Ту метавонӣ:
- эҳсос нишон надиҳӣ;
- “ба ман ҳеҷ кас лозим нест” гӯӣ;
- мардро санҷӣ;
- девор созӣ;
- аз наздикӣ гурезӣ.

**Чаро ҷолибият кам мешавад?**
Чун мард назди ту худро доим дар имтиҳон ҳис мекунад. Ӯ эҳсос мекунад, ки ҳар қадамаш баҳогузорӣ мешавад. Ин шавқро мекушад.

**Дарди асосӣ:**
“Ман метарсам, ки маро паст мезананд.”

**Ба ту чӣ лозим аст?**
Арзиш бе хунукӣ. Ҳудуд бе девор. Интихоб бе таҳқир. Қувват бо нармӣ.`
        },
        'D': {
            badgeName: 'Хозяйкаи захмӣ',
            title: 'Хозяйкаи захмӣ',
            text: `Ту амният, тартиб, масъулият ва натиҷа мехоҳӣ. Лекин вақте захмӣ ҳастӣ, ҳама чизро худат мекашӣ ва мардро ба писар табдил медиҳӣ.

Ту метавонӣ:
- мардро назорат кунӣ;
- ӯро тарбия кунӣ;
- мушкилҳои ӯро ҳал кунӣ;
- пул, хона, қарор, масъулиятро худат бардорӣ;
- баъд хаста ва хафа шавӣ.

**Чаро ҷолибият кам мешавад?**
Чун мард дар назди ту худро на ҳамчун мард, балки ҳамчун кӯдак ҳис мекунад. Ва бо “модар” ҷозибаи марду зан кам мешавад.

**Дарди асосӣ:**
“Ман метарсам, ки агар ман назорат накунам, ҳама чиз вайрон мешавад.”

**Ба ту чӣ лозим аст?**
Тартиб бе назорат. Ғамхорӣ бе модаршавӣ. Амният бе ҳама чизро худ кашидан.`
        }
    };

    // ==================== DOM ELEMENTS ====================
    const progBarWrap = document.getElementById('progBarWrap');
    const progFill = document.getElementById('progFill');
    const loaderOverlay = document.getElementById('ld');
    
    const secAuth = document.getElementById('sec-auth');
    const secQuiz = document.getElementById('sec-quiz');
    const secResults = document.getElementById('sec-results');

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
    const btnRestart = document.getElementById('btn-restart');

    // ==================== HELPER: SHOW SCREEN ====================
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

        // Update progress bar
        progBarWrap.classList.add('visible');
        const progressPct = Math.round((index / 15) * 100);
        progFill.style.width = progressPct + '%';

        // Update step descriptions
        stepCounter.textContent = `Саволи ${qNum} аз 15`;
        qBadge.textContent = `САВОЛИ ${qNum} АЗ 15`;
        qText.textContent = q.text;

        // Render options list
        optionsList.innerHTML = '';
        q.options.forEach((opt, optIdx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-option';
            if (state.answers[index] === optIdx) {
                btn.classList.add('selected');
            }
            btn.innerHTML = `<strong>${opt.letter}</strong> — ${opt.text}`;
            btn.addEventListener('click', () => handleOptionClick(optIdx));
            optionsList.appendChild(btn);
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

    // ==================== OPTION SELECTION ====================
    function handleOptionClick(optIdx) {
        if (state.transitioning) return;
        state.transitioning = true;

        const qIndex = state.currentQuestionIndex;
        state.answers[qIndex] = optIdx;

        // Highlight selected
        const buttons = optionsList.querySelectorAll('.btn-option');
        buttons.forEach((btn, idx) => {
            btn.classList.toggle('selected', idx === optIdx);
        });

        // Proceed to next question with a tiny smooth delay
        setTimeout(() => {
            if (qIndex < 14) {
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
        }, 280);
    }

    // ==================== BACK BUTTON ====================
    btnBackQ.addEventListener('click', () => {
        if (state.transitioning) return;
        const qIndex = state.currentQuestionIndex;
        if (qIndex > 0) {
            state.transitioning = true;
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

        // Calculate scores
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        state.answers.forEach(ansIdx => {
            if (ansIdx === 0) counts.A++;
            else if (ansIdx === 1) counts.B++;
            else if (ansIdx === 2) counts.C++;
            else if (ansIdx === 3) counts.D++;
        });

        // Determine dominant wound
        let dominantWoundLetter = 'A';
        let maxCount = counts.A;

        // In case of ties, prioritize in order: A, B, C, D
        if (counts.B > maxCount) { dominantWoundLetter = 'B'; maxCount = counts.B; }
        if (counts.C > maxCount) { dominantWoundLetter = 'C'; maxCount = counts.C; }
        if (counts.D > maxCount) { dominantWoundLetter = 'D'; maxCount = counts.D; }

        const result = resultsDetails[dominantWoundLetter];

        // Format result text markdown to HTML
        let formattedText = result.text;
        // Replace markdown bold
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Populate results fields
        resWoundBadge.textContent = result.badgeName;
        resTitle.textContent = result.title;
        resBodyText.innerHTML = formattedText;

        // Populate breakdown stats
        statsBreakdown.innerHTML = `
            <div class="stats-title">ҶАМЪИ ҲИСОБИ ҲАРФҲО:</div>
            <div class="stats-grid">
                <div class="stat-item">Ҳарфи <strong>A</strong> (Духтарча): <strong>${counts.A}</strong> то</div>
                <div class="stat-item">Ҳарфи <strong>B</strong> (Любовница): <strong>${counts.B}</strong> то</div>
                <div class="stat-item">Ҳарфи <strong>C</strong> (Малика): <strong>${counts.C}</strong> то</div>
                <div class="stat-item">Ҳарфи <strong>D</strong> (Хозяйка): <strong>${counts.D}</strong> то</div>
            </div>
        `;

        // Send data to Telegram
        sendTelegramData(counts, dominantWoundLetter, result.title);
    }

    // ==================== SEND TELEGRAM DATA ====================
    async function sendTelegramData(counts, dominantLetter, dominantTitle) {
        const userName = `${state.user.name} ${state.user.surname}`;
        const userAge = state.user.age;
        const userStatus = state.user.status;

        // 1. Text caption for the photo
        const caption = `🆕 <b>НАТИҶАИ НАВ АЗ ТЕСТ:</b>\n\n` +
                        `👤 <b>Иштирокчӣ:</b> ${userName}\n` +
                        `📅 <b>Синн:</b> ${userAge} сол\n` +
                        `💍 <b>Статус:</b> ${userStatus}\n` +
                        `🏆 <b>Захми асосӣ:</b> ${dominantTitle} (${dominantLetter})\n\n` +
                        `📊 <b>Холҳо:</b> A: ${counts.A} | B: ${counts.B} | C: ${counts.C} | D: ${counts.D}\n\n` +
                        `<i>👇 Ҷавобҳои пурра дар файли навбатӣ...</i>`;

        // 2. Comprehensive log for the text file (.txt)
        let txtLog = `============================================================\n`;
        txtLog += `           НАТИҶАҲОИ ТЕСТИ ПСИХОЛОГИИ МИЗОЧ\n`;
        txtLog += `     "ЧАРО ҶОЛИБИЯТИ ТУ БАРОИ МАРД КАМ МЕШАВАД?"\n`;
        txtLog += `============================================================\n\n`;
        txtLog += `👤 ИШТИРОКЧӢ:\n`;
        txtLog += `------------------------------------------------------------\n`;
        txtLog += `Ном ва Насаб:    ${userName}\n`;
        txtLog += `Синну сол:       ${userAge} сол\n`;
        txtLog += `Ҳолати оилавӣ:   ${userStatus}\n`;
        txtLog += `Захми асосӣ:     ${dominantTitle} (${dominantLetter})\n\n`;
        txtLog += `Ҳисоби ҳарфҳо:\n`;
        txtLog += `— A (Духтарчаи захмӣ): ${counts.A} то\n`;
        txtLog += `— B (Любовницаи захмӣ): ${counts.B} то\n`;
        txtLog += `— C (Маликаи захмӣ):   ${counts.C} то\n`;
        txtLog += `— D (Хозяйкаи захмӣ):  ${counts.D} то\n\n`;
        txtLog += `============================================================\n`;
        txtLog += `📝 ҶАВОБҲОИ МУФАССАЛИ САВОЛҲО:\n`;
        txtLog += `============================================================\n\n`;

        questions.forEach((q, qIdx) => {
            const chosenOptIdx = state.answers[qIdx];
            const chosenOpt = q.options[chosenOptIdx];
            txtLog += `Саволи ${qIdx + 1}: ${q.text}\n`;
            txtLog += `👉 Ҷавоб: [${chosenOpt.letter}] — ${chosenOpt.text}\n\n`;
        });

        txtLog += `------------------------------------------------------------\n`;
        txtLog += `Санаи супоридан: ${new Date().toLocaleString('tg-TJ')}\n`;
        txtLog += `============================================================\n`;

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

            // Second: Generate beautiful PDF and send as document
            await sendPDFReport(counts, dominantLetter, dominantTitle);

        } catch (err) {
            console.error('Ошибка отправки результатов в Телеграм:', err);
        } finally {
            // Remove loader and display results screen
            loaderOverlay.classList.remove('on');
            progBarWrap.classList.remove('visible'); // Hide progress bar at results
            showScreen(secResults);
        }
    }

    // ==================== GENERATE & SEND PDF REPORT ====================
    async function sendPDFReport(counts, dominantLetter, dominantTitle) {
        const userName = `${state.user.name} ${state.user.surname}`;
        const userAge = state.user.age;
        const userStatus = state.user.status;
        const dateStr = new Date().toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });

        // Build HTML content for PDF
        let questionsHTML = '';
        questions.forEach((q, idx) => {
            const chosenOptIdx = state.answers[idx];
            const chosenOpt = q.options[chosenOptIdx];
            questionsHTML += `
            <div style="margin-bottom:14px; page-break-inside:avoid;">
                <div style="font-size:12px; font-weight:700; color:#27243A; margin-bottom:4px;">${idx + 1}. ${q.text}</div>
                <div style="background:#F3F1FA; border-left:3px solid #8B7EC8; padding:6px 10px; font-size:11px; color:#4A475A; border-radius:0 6px 6px 0;">
                    [${chosenOpt.letter}] — ${chosenOpt.text}
                </div>
            </div>`;
        });

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; color:#27243A; padding:30px; line-height:1.6; background:#ffffff;">

            <div style="text-align:center; margin-bottom:28px; border-bottom:2px solid #8B7EC8; padding-bottom:16px;">
                <h1 style="font-size:20px; color:#5F57A0; margin:0 0 6px 0;">НАТИҶАҲОИ ТЕСТИ ПСИХОЛОГӢ</h1>
                <p style="font-size:12px; color:#6C6882; margin:0;">"Чаро ҷолибияти ту барои мард кам мешавад?"</p>
            </div>

            <div style="background:#F3F1FA; border-radius:12px; padding:16px 20px; margin-bottom:24px; border:1px solid rgba(139,126,200,0.2);">
                <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    <tr>
                        <td style="padding:5px 0; font-weight:700; width:40%; color:#6C6882;">👤 Иштирокчӣ:</td>
                        <td style="padding:5px 0; font-weight:700; color:#27243A;">${userName}</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 0; font-weight:700; color:#6C6882;">📅 Синну сол:</td>
                        <td style="padding:5px 0; color:#27243A;">${userAge} сол</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 0; font-weight:700; color:#6C6882;">💍 Ҳолати оилавӣ:</td>
                        <td style="padding:5px 0; color:#27243A;">${userStatus}</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 0; font-weight:700; color:#6C6882;">🏆 Захми асосӣ:</td>
                        <td style="padding:5px 0; font-weight:700; color:#8B7EC8;">${dominantTitle} (${dominantLetter})</td>
                    </tr>
                </table>
            </div>

            <div style="background:#ffffff; border-radius:10px; padding:14px 18px; margin-bottom:20px; border:1px solid rgba(139,126,200,0.15);">
                <div style="font-size:11px; font-weight:700; color:#8B7EC8; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px;">📊 Ҳисоби ҳарфҳо:</div>
                <table style="width:100%; font-size:12px;">
                    <tr>
                        <td style="padding:4px 8px; width:25%;"><strong style="color:#8B7EC8;">A</strong> — Духтарча: <strong>${counts.A}</strong></td>
                        <td style="padding:4px 8px; width:25%;"><strong style="color:#8B7EC8;">B</strong> — Любовница: <strong>${counts.B}</strong></td>
                        <td style="padding:4px 8px; width:25%;"><strong style="color:#8B7EC8;">C</strong> — Малика: <strong>${counts.C}</strong></td>
                        <td style="padding:4px 8px; width:25%;"><strong style="color:#8B7EC8;">D</strong> — Хозяйка: <strong>${counts.D}</strong></td>
                    </tr>
                </table>
            </div>

            <h3 style="font-size:13px; color:#5F57A0; margin:0 0 14px 0; border-bottom:1px dashed rgba(139,126,200,0.3); padding-bottom:6px;">📝 ҶАВОБҲОИ ПУРРА:</h3>

            ${questionsHTML}

            <div style="margin-top:28px; border-top:1px solid rgba(139,126,200,0.2); padding-top:10px; text-align:center; font-size:10px; color:#ADAABF;">
                Санаи супоридан: ${dateStr}
            </div>
        </div>`;

        // Create temp element for html2pdf
        const tempEl = document.createElement('div');
        tempEl.style.position = 'fixed';
        tempEl.style.left = '-9999px';
        tempEl.innerHTML = htmlContent;
        document.body.appendChild(tempEl);

        try {
            const pdfOptions = {
                margin: 10,
                filename: `${state.user.name}_${state.user.surname}_натиҷа.pdf`,
                image: { type: 'jpeg', quality: 0.97 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const pdf = await html2pdf().set(pdfOptions).from(tempEl).toPdf().get('pdf');
            const pdfBlob = pdf.output('blob');

            document.body.removeChild(tempEl);

            // Send PDF to Telegram
            const safeFileName = `${state.user.name}_${state.user.surname}_натиҷа.pdf`.replace(/[\\\/:\*\?"<>\|]/g, '');
            const pdfFormData = new FormData();
            pdfFormData.append('chat_id', TG_CHAT_ID);
            pdfFormData.append('document', pdfBlob, safeFileName);

            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendDocument`, {
                method: 'POST',
                body: pdfFormData
            });

        } catch (pdfErr) {
            console.error('PDF generation/send error:', pdfErr);
            if (tempEl.parentNode) document.body.removeChild(tempEl);
        }
    }

    // ==================== EVENT BINDINGS ====================
    
    // Auth Form Submit
    btnStartTest.addEventListener('click', () => {
        const nameVal = inputName.value.trim();
        const surnameVal = inputSurname.value.trim();
        const ageVal = inputAge.value.trim();
        const statusVal = selectStatus.value;

        if (!nameVal || !surnameVal || !ageVal) {
            alert('Лутфан ҳамаи майдонҳоро пур кунед!');
            return;
        }

        // Save states
        state.user.name = nameVal;
        state.user.surname = surnameVal;
        state.user.age = ageVal;
        state.user.status = statusVal;

        // Reset quiz answers & current question index
        state.currentQuestionIndex = 0;
        state.answers = new Array(15).fill(null);

        // Transition to Quiz Screen
        showScreen(secQuiz);
        renderQuestion(0);
    });

    // Telegram Admin Button Redirect
    btnTgAdmin.addEventListener('click', () => {
        window.open(TG_ADMIN_URL, '_blank');
    });

    // Restart Test Button
    btnRestart.addEventListener('click', () => {
        // Clear registration form inputs
        inputName.value = '';
        inputSurname.value = '';
        inputAge.value = '';
        selectStatus.selectedIndex = 0;

        // Switch to registration screen
        showScreen(secAuth);
    });

    // Initial log message
    console.log('✨ Тест бо муваффақият омода шуд.');
})();
