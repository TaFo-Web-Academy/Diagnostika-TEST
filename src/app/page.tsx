'use client';

import { useState, useEffect } from 'react';

const API_BASE = '';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  const [assignment, setAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const savedName = localStorage.getItem('userName');
        const savedId = localStorage.getItem('userId');
        
        if (savedName && savedId) {
          setUserName(savedName);
          setUserId(parseInt(savedId));
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const newUserId = params.get('user_id');
        const newUserName = params.get('name');
        
        if (newUserId && newUserName) {
          localStorage.setItem('userName', newUserName);
          localStorage.setItem('userId', newUserId);
          setUserName(newUserName);
          setUserId(parseInt(newUserId));
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadAssignment();
  }, [userId]);

  const loadAssignment = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/assignments?user_id=${userId}`);
      const data = await res.json();
      if (data.assignment) {
        setAssignment(data.assignment);
        setAnswers(data.answers.reduce((acc: any, ans: any) => {
          acc[ans.question_key] = ans.answer_text;
          return acc;
        }, {}));
        if (data.assignment.status === 'completed') {
          setSaved(true);
        }
      }
    } catch (error) {
      console.error('Load assignment error:', error);
    }
  };

  const handleRegister = async () => {
    const trimmedName = userName.trim();
    if (trimmedName.length < 2) {
      alert('Ном бояд ҳадди ақал 2 ҳарф бошад');
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });
      
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user.id.toString());
        setUserId(data.user.id);
        setUserName(data.user.name);
      }
    } catch (error: any) {
      alert('Хатогӣ!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAnswers = async () => {
    if (!userId || !assignment || saved) return;
    
    setIsSaving(true);
    try {
      for (const [key, value] of Object.entries(answers)) {
        if (!value) continue;
        await fetch(`${API_BASE}/api/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            assignmentId: assignment.id,
            questionKey: key,
            answerText: value
          })
        });
      }
      
      setSaved(true);
      setTimeout(() => {
        loadAssignment();
      }, 1000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="loading">Боркунӣ...</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>КАДАМИ АМАЛИ ИМРӮЗ</h1>
      </header>

      <main>
        {!userId ? (
          <div className="register-section">
            <p className="register-prompt">Барои оғоз номи худро ворид кунед:</p>
            <input 
              type="text" 
              className="name-input" 
              placeholder="Номи шумо" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={50}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            />
            <button 
              className="primary-btn"
              onClick={handleRegister}
              disabled={userName.trim().length < 2 || isSaving}
            >
              {isSaving ? 'Оғоз...' : 'Оғоз кардан'}
            </button>
          </div>
        ) : assignment ? (
          <div className="assignment-content">
            {/* Карточка задания */}
            <div className="assignment-card">
              <div className="assignment-header">
                <h2 className="assignment-title">{assignment.title}</h2>
                {saved && <span className="status-badge completed">Иҷро шуд ✅</span>}
              </div>

              <div 
                className="assignment-body" 
                dangerouslySetInnerHTML={{ __html: assignment.content }}
              />
            </div>

            {/* Форма ответов */}
            <div className="answers-section">
              <h3 className="section-title">Ҷавобҳои шумо:</h3>
              
              <div className="questions-list">
                {[
                  { key: 'q1', label: '1. Ман имрӯз дарди худро чӣ қадар равшан дидам? худро бахо дихед аз 1 то 10' },
                  { key: 'q2', label: '2. Ман имрӯз бо худ чӣ қадар рост будам? худро бахо дихед аз 1 то 10 ' },
                  { key: 'q3', label: '3. Ман фаҳмидам, ки сардии ӯ танҳо trigger аст? худро бахо дихед аз 1 то 10 ' },
                  { key: 'q4', label: '4. Ман машқи имрӯзро чӣ қадар пурра иҷро кардам? худро бахо дихед аз 1 то 10 ' },
                  { key: 'q5', label: '5. Ман хоҳиши контрол ё истерикаро чӣ қадар идора кардам? худро бахо дихед аз 1 то 10' }
                ].map(q => (
                  <div key={q.key} className="answer-item">
                    <label>{q.label}</label>
                    <input 
                      type="number" min="1" max="10"
                      value={answers[q.key] || ''}
                      onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                      placeholder="1-10"
                      disabled={saved}
                    />
                  </div>
                ))}
              </div>

              <div className="answer-item" style={{ marginTop: '24px' }}>
                <label className="field-label">Имруз шумо аз дарс чи омухтед ?</label>
                <textarea 
                  className="note-area"
                  placeholder="Нависед..."
                  value={answers.note || ''}
                  onChange={(e) => handleAnswerChange('note', e.target.value)}
                  disabled={saved}
                />
              </div>

              <div className="result-section" style={{ marginTop: '32px' }}>
                <h3 className="section-title">НАТИЧАИ ШУМО :</h3>
                
                <div className="example-box">
                  <span className="example-tag">Намуна:</span>
                  <p>Бояд худро ба 3 рафтор кор кунам, ки ман дӯст дорам:</p>
                  <ul>
                    <li>1. Худро эҳтиром кунам ва ба қадри худ шунидам.</li>
                    <li>2. Шогирдӣ диҳам ба қадри заҳмати худамон.</li>
                    <li>3. Мушкилиҳои худро ба ҷойи худ медҳанд.</li>
                  </ul>
                </div>

                <div className="answer-item" style={{ marginTop: '16px' }}>
                  <textarea 
                    className="note-area result-area"
                    placeholder="Натичаи худро нависед..."
                    value={answers.result || ''}
                    onChange={(e) => handleAnswerChange('result', e.target.value)}
                    disabled={saved}
                  />
                </div>
              </div>

              {!saved ? (
                <button 
                  className="primary-btn save-btn"
                  onClick={handleSaveAnswers}
                  disabled={isSaving}
                  style={{ marginTop: '32px' }}
                >
                  {isSaving ? 'Дар ҳоли сабт...' : 'Сабт кардан'}
                </button>
              ) : (
                <div className="completion-card">
                  <div className="success-icon">✅</div>
                  <p>Сабт карда шуд! То фардо мунтазир бошед, машқи нав дастрас мешавад.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="waiting-card">
            <p>Машқи нав ба зудӣ дастрас мешавад.</p>
          </div>
        )}
      </main>
    </div>
  );
}
