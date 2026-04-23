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

        // Check if we have user in query params (after registration)
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
      setAssignment(data.assignment);
      setAnswers(data.answers.reduce((acc: any, ans: any) => {
        acc[ans.question_key] = ans.answer_text;
        return acc;
      }, {}));
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
      console.log('Registering user:', trimmedName);
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });
      
      const data = await res.json();
      console.log('Registration response:', data);

      if (!res.ok || data.error) {
        console.error('Registration failed:', data);
        alert('Хатогии сабт: ' + (data.error || 'Хатогии номаълум'));
        return;
      }

      if (!data.user || !data.user.id) {
        console.error('Invalid user data received:', data);
        alert('Хатогӣ: Сервер маълумоти нодуруст фиристод');
        return;
      }
      
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userId', data.user.id.toString());
      setUserId(data.user.id);
      setUserName(data.user.name);
    } catch (error: any) {
      console.error('Register error:', error);
      alert('Хатогӣ дар пайвастшавӣ: ' + error.message);
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
      // Сохраняем все ответы
      for (const [key, value] of Object.entries(answers)) {
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
      setTimeout(() => setSaved(false), 3000);
      loadAssignment(); // Refresh assignment status
    } catch (error) {
      console.error('Save answers error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Боркунӣ...</p>
      </div>
    );
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
              {isSaving ? '...' : 'Оғоз кардан'}
            </button>
          </div>
        ) : assignment ? (
          <div className="assignment-content">
            <div className="assignment-header">
              <h2 className="assignment-title">{assignment.title || 'Машқи имрӯз'}</h2>
              <span className={`status-badge ${assignment.status}`}>
                {assignment.status === 'completed' ? '✅ Иҷро шуд' : '⏳ Дар ҳол'}
              </span>
            </div>

            <div 
              className="assignment-body" 
              dangerouslySetInnerHTML={{ __html: assignment.content }}
            />

            {assignment.status !== 'completed' && (
              <div className="answers-form">
                <h3>Ҷавобҳои шумо:</h3>
                
                <div className="answer-item">
                  <label>1. Ман имрӯз дарди худро чӣ қадар равшан дидам? (1-10)</label>
                  <input 
                    type="number" min="1" max="10"
                    value={answers.q1 || ''}
                    onChange={(e) => handleAnswerChange('q1', e.target.value)}
                    placeholder="1-10"
                  />
                </div>

                <div className="answer-item">
                  <label>2. Ман имрӯз бо худ чӣ қадар рост будам? (1-10)</label>
                  <input 
                    type="number" min="1" max="10"
                    value={answers.q2 || ''}
                    onChange={(e) => handleAnswerChange('q2', e.target.value)}
                    placeholder="1-10"
                  />
                </div>

                <div className="answer-item">
                  <label>3. Ман фаҳмидам, ки сардии ӯ танҳо trigger аст? (1-10)</label>
                  <input 
                    type="number" min="1" max="10"
                    value={answers.q3 || ''}
                    onChange={(e) => handleAnswerChange('q3', e.target.value)}
                    placeholder="1-10"
                  />
                </div>

                <div className="answer-item">
                  <label>4. Ман машқи имрӯзро чӣ қадар пурра иҷро кардам? (1-10)</label>
                  <input 
                    type="number" min="1" max="10"
                    value={answers.q4 || ''}
                    onChange={(e) => handleAnswerChange('q4', e.target.value)}
                    placeholder="1-10"
                  />
                </div>

                <div className="answer-item">
                  <label>5. Ман хоҳиши контрол ё истерикаро чӣ қадар идора кардам? (1-10)</label>
                  <input 
                    type="number" min="1" max="10"
                    value={answers.q5 || ''}
                    onChange={(e) => handleAnswerChange('q5', e.target.value)}
                    placeholder="1-10"
                  />
                </div>

                <div className="answer-item">
                  <label>Қайдҳои шахсӣ (ихтиёрӣ):</label>
                  <textarea 
                    className="note-area"
                    placeholder="Чӣ дард метавонед нависед..."
                    value={answers.note || ''}
                    onChange={(e) => handleAnswerChange('note', e.target.value)}
                    rows={3}
                  />
                </div>

                <button 
                  className="save-btn"
                  onClick={handleSaveAnswers}
                  disabled={isSaving || saved}
                >
                  {isSaving ? 'Сабт...' : saved ? '✅ Сабт шуд!' : 'Сабот кардан'}
                </button>
              </div>
            )}

            {assignment.status === 'completed' && (
              <div className="completed-message">
                <p>✅ Машқи имрӯз ба анҷом расид! Бародарӣ барои ф oj!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="assignment-content">
            <p>Машқи имрӯз ёфт нашуд.</p>
          </div>
        )}
      </main>
    </div>
  );
}
