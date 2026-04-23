'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?limit=100');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      setSelectedUser(data);
    } catch (error) {
      console.error('Load user detail error:', error);
    }
  };

  if (loading) return <div className="empty-state">Боркунӣ...</div>;

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <h1>Админ Панел</h1>
          <p>Рӯйхати корбарон ва ҷавобҳо</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card total">
          <div className="icon">👥</div>
          <div className="label">Ҳамаи корбарон</div>
          <div className="value">{users.length}</div>
        </div>

        <div className="stat-card finished">
          <div className="icon">✅</div>
          <div className="label">Иҷрошуда</div>
          <div className="value">
            {users.filter(u => u.total_days_completed > 0).length}
          </div>
        </div>
      </div>

      {selectedUser ? (
        <UserDetail 
          user={selectedUser.user} 
          profile={selectedUser}
          onBack={() => setSelectedUser(null)}
        />
      ) : (
        <div className="recent-card">
          <div className="recent-header">
            <h2>📋 Рӯйхати корбарон ({users.length})</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => window.open('/api/admin/export?format=csv', '_blank')}
                style={{ 
                  background: 'var(--success)', 
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📥 Скачать CSV
              </button>
              <button onClick={loadUsers}>🔄 Обновить</button>
            </div>
          </div>

          <table className="sessions-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Ном</th>
                <th>Стрик</th>
                <th>Ҷавобҳо (0/5)</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} className="empty-state">Корбарон нест</td></tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} onClick={() => loadUserDetail(u.id)} style={{ cursor: 'pointer' }}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="user-name">{u.name}</div>
                      <div className="session-id">ID: {u.id}</div>
                    </td>
                    <td><strong style={{ color: 'var(--warning)' }}>{u.current_streak || 0}</strong></td>
                    <td>
                       <span className="badge active">
                         {u.today_answers_count || 0}/5
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserDetail({ user, profile, onBack }: any) {
  const labelMap: Record<string, string> = {
    'q1': 'Савол 1',
    'q2': 'Савол 2',
    'q3': 'Савол 3',
    'q4': 'Савол 4',
    'q5': 'Савол 5',
    'note': 'Дарс чи омухтед',
    'result': 'Натиҷа'
  };


  return (
    <div>
      <button onClick={onBack} style={{ 
        marginBottom: '20px', 
        background: 'var(--surface-light)', 
        border: '1px solid var(--border)',
        color: 'var(--text)',
        padding: '10px 20px',
        borderRadius: '10px',
        cursor: 'pointer'
      }}>
        ← Назад
      </button>

      <div className="recent-card">
        <div className="recent-header">
          <h2>Ҷавобҳои: {user.name}</h2>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <div className="history-section" style={{ marginTop: '16px' }}>
            <div className="history-list">
              {profile.recentAnswers?.length > 0 ? (
                profile.recentAnswers.map((ans: any) => (
                  <div key={ans.id} className="history-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {labelMap[ans.question_key] || ans.question_key}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(ans.created_at).toLocaleString('tg-TJ')}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text)', fontSize: '1.1rem' }}>
                      {ans.answer_text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="empty-state">Ҷавобҳо ҳанӯз нестанд</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

