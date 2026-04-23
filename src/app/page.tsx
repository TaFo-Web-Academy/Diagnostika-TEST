'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = '';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  // Assignment state
  const [assignment, setAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const router = useRouter();

  // Initialize user
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

        // Check query params
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

  // Load assignment
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
      } else {
        alert('Хатогии сабт: ' + (data.error || 'Хатогии номаълум'));
      }
    } catch (error: any) {
      alert('Хатогии пайвастшавӣ: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAnswers = async () => {
    if (!userId || !assignment) return;
    
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
      loadAssignment(); 
    } catch (error) {
      console.error('Save answers error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Боркунӣ...</div>;
  }

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
        ) : assignment?.status === 'completed' ? (
          <div className="waiting-card">
            <div className="waiting-icon">🌟</div>
            <h2 className="waiting-title">Офарин, {userName}!</h2>
            <p className="waiting-text">
              Машқи имрӯз бо муваффақият иҷро шуд. То фардо мунтазир бошед, машқи нав дастрас мешавад.
            </p>
            <div className="status-badge completed">✅ Иҷро шуд</div>
          </div>
        ) : assignment ? (
          <div className="assignment-content">
            <div className="assignment-header">
              <h2 className="assignment-title">{assignment.title}</h2>
              <span className="status-badge">⏳ Дар ҳол</span>
            </div>

            <div 
              className="assignment-body" 
              dangerouslySetInnerHTML={{ __html: assignment.content }}
            />

            <div className="answers-form">
              <h3>Ҷавобҳои шумо:</h3>
              
              {[
                { key: 'q1', label: '1. Ман имрӯз дарди худро чӣ қадар равшан дидам? (1-10)' },
                { key: 'q2', label: '2. Ман имрӯз бо худ чӣ қадар рост будам? (1-10)' },
                { key: 'q3', label: '3. Ман фаҳмидам, ки сардии ӯ танҳо trigger аст? (1-10)' },
                { key: 'q4', label: '4. Ман машқи имрӯзро чӣ қадар пурра иҷро кардам? (1-10)' },
                { key: 'q5', label: '5. Ман хоҳиши контрол ё истерикаро чӣ қадар идора кардам? (1-10)' }
              ].map(q => (
                <div key={q.key} className="answer-item">
                  <label>{q.label}</label>
                  <input 
                    type="number" min="1" max="10"
                    value={answers[q.key] || ''}
                    onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                    placeholder="1-10"
                  />
                </div>
              ))}

              <div className="answer-item">
                <label>Қайдҳои шахсӣ (ихтиёрӣ):</label>
                <textarea 
                  className="note-area"
                  placeholder="Чӣ дард метавонед нависед..."
                  value={answers.note || ''}
                  onChange={(e) => handleAnswerChange('note', e.target.value)}
                />
              </div>

              <button 
                className="save-btn"
                onClick={handleSaveAnswers}
                disabled={isSaving}
              >
                {isSaving ? 'Сабт...' : 'Сабт кардан'}
              </button>
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
