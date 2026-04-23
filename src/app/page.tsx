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

  const conclusion = useMemo(() => {
    if (totalScore <= 20) return 'ту ҳоло бештар дар дард ҳастӣ, на дар фаҳмиш';
    if (totalScore <= 35) return 'ту бедор шуда истодаӣ, вале ҳанӯз реша пурра равшан нест';
    return 'ту аллакай дардро дида истодаӣ ва метавонӣ шифоро сар кунӣ';
  }, [totalScore]);

  if (loading) return <div className="loading">Боркунӣ...</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ТЕСТИ ХУД-САНҶӢ ДАР ОХИРИ ДАРС</h1>
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
            <div className="answers-section">
              <h2 className="section-title">ЧЕНИ НАТИҶАИ ДАРС</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Аз 1 то 10 баҳогузорӣ кун:</p>
              
              <div className="questions-list">
                {[
                  { key: 'q1', label: 'Ман фаҳмидам, ки дарди ман фақат аз имрӯз нест.' },
                  { key: 'q2', label: 'Ман тавонистам trigger-и худро аз решаи кӯҳна ҷудо кунам.' },
                  { key: 'q3', label: 'Ман рост фаҳмидам, ки даруни ман бештар тарс аст, на фақат “муҳаббат”.' },
                  { key: 'q4', label: 'Ман имрӯз ҳиссиёти худро бе фиреб навиштам ё дидам.' },
                  { key: 'q5', label: 'Ман медонам, ки ба ҷои истерика имрӯз чӣ қадами дуруст кунам.' }
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
                <div style={{ flex: 1 }}>
                  <h3 className="score-label" style={{ fontSize: '0.9rem', marginBottom: '4px', opacity: 0.8 }}>ХУЛОСАИ ХУД-САНҶӢ:</h3>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: '#fff', lineHeight: '1.4' }}>
                    {conclusion}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                   <div className="score-value">{totalScore}/50</div>
                </div>
              </div>

              <div className="reflection-section" style={{ marginTop: '32px' }}>
                <label className="field-label" style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', lineHeight: '1.4' }}>
                  Аз ин дарси имрузаи РОЙГОН дар Телеграм, шумо чи гирифтед аз он барои худ ?
                </label>
                <textarea 
                  className="note-area"
                  placeholder="Дар ин чо фахмиши худро оид ба Курс нависед . ."
                  value={answers.note || ''}
                  onChange={(e) => handleAnswerChange('note', e.target.value)}
                  disabled={saved}
                />
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
                  <p>Сабт карда шуд! Ташаккур барои иштирок.</p>
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
