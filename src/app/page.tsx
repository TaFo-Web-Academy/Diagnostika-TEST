'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = '';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'assignment' | 'profile'>('assignment');
  
  // Assignment state
  const [assignment, setAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

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
          setActiveTab('assignment');
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
          setActiveTab('assignment');
        } else {
          // Show name input
          setUserName(savedName || '');
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

  // Load profile when tab changes
  useEffect(() => {
    if (activeTab === 'profile' && userId) {
      loadProfile();
    }
  }, [activeTab, userId]);

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

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile?user_id=${userId}`);
      const data = await res.json();
      setProfile(data.user);
      setProgress(data.progress);
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const handleRegister = async () => {
    if (userName.trim().length < 2) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName.trim() })
      });
      const data = await res.json();
      
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userId', data.user.id);
      setUserId(data.user.id);
      setUserName(data.user.name);
      setActiveTab('assignment');
    } catch (error) {
      console.error('Register error:', error);
      alert('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
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
      loadProfile();    // Update profile stats
    } catch (error) {
      console.error('Save answers error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab: 'assignment' | 'profile') => {
    setActiveTab(tab);
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
        
        {userId && (
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'assignment' ? 'active' : ''}`}
              onClick={() => handleTabChange('assignment')}
            >
              ⏰ Машқи ҳаррӯза
            </button>
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              👤 Профил
            </button>
          </div>
        )}
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
        ) : activeTab === 'assignment' && assignment ? (
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
        ) : activeTab === 'profile' && profile ? (
          <div className="profile-content">
            <div className="profile-header">
              <h2>Салом, {profile.name}!</h2>
              <div className="stats-row">
                <div className="stat-box">
                  <span className="stat-value">{progress?.current_streak || 0}</span>
                  <span className="stat-label">Ҳафтаи зинда</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{progress?.total_days_completed || 0}</span>
                  <span className="stat-label">Кунҷҳо</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{progress?.total_points || 0}</span>
                  <span className="stat-label">Андоз</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">Ур.{progress?.level || 1}</span>
                  <span className="stat-label">Сатҳ</span>
                </div>
              </div>
            </div>

            <div className="history-section">
              <h3>Таърихи машқот</h3>
              <div className="history-list">
                {progress?.assignments?.map((a: any, idx: number) => (
                  <div key={a.id} className={`history-item ${a.status}`}>
                    <span className="date">{new Date(a.assigned_date).toLocaleDateString('tg-TJ')}</span>
                    <span className="title">{a.title}</span>
                    <span className={`status ${a.status}`}>
                      {a.status === 'completed' ? `✅ ${a.score} балл` : '⏳'}
                    </span>
                  </div>
                )) || <p>Ҳанӯз машқе анҷом дода нашудааст.</p>}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
