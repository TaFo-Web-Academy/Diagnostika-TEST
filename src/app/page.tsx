'use client';

import { useState, useEffect, useMemo } from 'react';

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

  const totalScore = useMemo(() => {
    return ['q1', 'q2', 'q3', 'q4', 'q5'].reduce((acc, key) => {
      return acc + (parseInt(answers[key]) || 0);
    }, 0);
  }, [answers]);

  if (loading) return <div className="loading">Боркунӣ...</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ҚАДАМИ АМАЛИ ИМРӮЗ</h1>
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
            <div className="assignment-card">
              <h2 className="section-title">Қадам ба қадам:</h2>
              
              <div className="step-item">
                <p><strong>Қадами 1.</strong> Як ҳолати охиринро навис, ки дар он туро сардӣ, дуршавӣ ё шубҳа шикаст.</p>
                <p><strong>Қадами 2.</strong> Зери он навис:</p>
                <ul className="sub-list">
                  <li>- он вақт ман чӣ ҳис кардам?</li>
                  <li>- ман аз чӣ тарсидам?</li>
                  <li>- ман дар бораи худам чӣ хулосаи бад баровардам?</li>
                </ul>
                <textarea 
                  className="note-area"
                  placeholder="Нависед дар инчо . ."
                  value={answers.note || ''}
                  onChange={(e) => handleAnswerChange('note', e.target.value)}
                  disabled={saved}
                  style={{ marginTop: '12px' }}
                />
              </div>

              <div className="step-item" style={{ marginTop: '20px' }}>
                <p><strong>Қадами 3.</strong> 3 бор дар рӯз 10 нафаси чуқур бикаш.</p>
              </div>

              <div className="step-item" style={{ marginTop: '12px' }}>
                <p><strong>Қадами 4.</strong> Вақте хоҳиши тафтиш, ҷанг ё паёми изтиробӣ омад, 10 дақиқа таваққуф кун.</p>
              </div>

              <div className="step-item" style={{ marginTop: '12px' }}>
                <p><strong>Қадами 5.</strong> Ин ҷумлаҳоро баланд ё дар дил бигӯ:</p>
                <div className="quote-box">
                  “Ин дарди имрӯз нест.”<br/>
                  “Ман ҳозир кӯдак нестам.”<br/>
                  “Ман метавонам дардро ҳис кунам, бе он ки он маро идора кунад.”
                </div>
              </div>
            </div>

            <div className="answers-section">
              <h2 className="section-title">4. НАТИҶАИ ДАРС</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Аз 1 то 10 ба худ баҳо деҳ:</p>
              
              <div className="questions-list">
                {[
                  { key: 'q1', label: 'Ман имрӯз дарди худро чӣ қадар равшан дидам?' },
                  { key: 'q2', label: 'Ман имрӯз бо худ чӣ қадар рост будам?' },
                  { key: 'q3', label: 'Ман фаҳмидам, ки сардии ӯ танҳо trigger аст, реша кӯҳнатар аст?' },
                  { key: 'q4', label: 'Ман машқи имрӯзро чӣ қадар пурра иҷро кардам?' },
                  { key: 'q5', label: 'Ман хоҳиши контрол ё истерикаро имрӯз чӣ қадар идора кардам?' }
                ].map((q, idx) => (
                  <div key={q.key} className="eval-row">
                    <span className="eval-label">{idx + 1}. {q.label}</span>
                    <div className="eval-input-group">
                      <input 
                        type="number" min="0" max="10"
                        value={answers[q.key] || ''}
                        onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                        placeholder="0"
                        disabled={saved}
                      />
                      <span className="eval-total">/10</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total-score-card">
                <span className="score-label">Бали умумии рӯз:</span>
                <span className="score-value">{totalScore}/50</span>
              </div>

              {!saved ? (
                <button 
                  className="primary-btn save-btn"
                  onClick={handleSaveAnswers}
                  disabled={isSaving}
                  style={{ marginTop: '24px' }}
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
