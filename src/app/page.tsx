'use client';

import { useState, useEffect } from 'react';

const TELEGRAM_LINK = 'https://t.me/jannat_abdullaeva_kanal';

interface Option {
  text: string;
  value: number;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<'loading' | 'active' | 'finished' | 'name_input'>('loading');
  const [resultType, setResultType] = useState<number | null>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch questions
        const qRes = await fetch('/api/questions');
        const qData = await qRes.json();
        setQuestions(qData);

        // Check local session
        const savedId = localStorage.getItem('test_sessionId');
        const savedName = localStorage.getItem('test_userName') || '';
        setUserName(savedName);

        const sRes = await fetch('/api/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: savedId || undefined,
            userName: savedName || undefined
          })
        });

        const sData = await sRes.json();
        setSessionId(sData.sessionId);
        localStorage.setItem('test_sessionId', sData.sessionId);

        if (sData.status === 'finished') {
          setResultType(sData.resultType);
          setStatus('finished');
        } else if (!sData.userName && sData.status !== 'finished') {
          setStatus('name_input');
        } else {
          setCurrentIndex(sData.currentQuestion);
          // Convert array of answers back to map if needed, 
          // but API returns currentQuestion which is enough for positioning
          setStatus('active');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        // Fallback to name input so the user sees something even if API fails
        setStatus('name_input');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleStartWithName = async () => {
    if (userName.trim().length < 2) return;
    
    setLoading(true);
    try {
      localStorage.setItem('test_userName', userName);
      await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userName: userName })
      });
      setStatus('active');
    } catch (error) {
      console.error('Error starting session with name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (value: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: value
    });
  };

  const handleNext = async () => {
    const answerIndex = selectedAnswers[currentIndex];
    if (answerIndex === undefined) return;

    setLoading(true);
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answerIndex })
      });
      const data = await res.json();

      if (data.status === 'finished') {
        setResultType(data.resultType);
        setStatus('finished');
      } else {
        setCurrentIndex(data.nextQuestion);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordClick = async () => {
    try {
      await fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, linkType: 'telegram' })
      });
    } catch (e) {
      console.log('Click recording error');
    }
  };

  const getResultData = (type: number) => {
    const name = userName || '';
    const results: Record<number, any> = {
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
  };

  if (loading && status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Боркунӣ...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Диагностикаи РОЙГОН</h1>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${status === 'finished' ? 100 : (currentIndex / (questions.length || 7)) * 100}%` }}
          />
        </div>
        <div className="question-counter">
          {status === 'finished' ? '7/7' : `${currentIndex + 1}/${questions.length}`}
        </div>
      </header>

      <main>
        {status === 'name_input' && (
          <div>
            <div className="question-text">Номи худронависед</div>
            <div className="options-container">
              <input 
                type="text" 
                className="name-input" 
                placeholder="Номи шумо" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={50}
                autoFocus
              />
            </div>
          </div>
        )}

        {status === 'active' && questions[currentIndex] && (
          <div>
            <div className="question-text">{questions[currentIndex].text}</div>
            <div className="options-container">
              {questions[currentIndex].options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn ${selectedAnswers[currentIndex] === opt.value ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(opt.value)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'finished' && resultType !== null && (
          <div className="result-card">
            {(() => {
              const res = getResultData(resultType);
              return (
                <>
                  <h2 className="result-title">{res.title}</h2>
                  <p className="result-description">{res.description}</p>
                  <div className="result-step">
                    <strong>{res.stepTitle}</strong><br /><br />
                    {res.step}
                  </div>
                  <a 
                    href={TELEGRAM_LINK} 
                    className="telegram-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={recordClick}
                  >
                    Дарсхои РОЙГОН
                  </a>
                </>
              );
            })()}
          </div>
        )}
      </main>

      <footer className="app-footer">
        {status === 'name_input' && (
          <button 
            className="primary-btn" 
            disabled={userName.trim().length < 2 || loading}
            onClick={handleStartWithName}
          >
            {loading ? 'Огоз...' : 'Давом додан'}
          </button>
        )}
        
        {status === 'active' && (
          <button 
            className="primary-btn" 
            disabled={selectedAnswers[currentIndex] === undefined || loading}
            onClick={handleNext}
          >
            {loading ? 'Инбор...' : 'Давом додан'}
          </button>
        )}
      </footer>
    </div>
  );
}
