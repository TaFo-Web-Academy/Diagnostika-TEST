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
            {users.filter(u => parseInt(u.today_answers_count) >= 5).length}
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
            <h2 style={{ marginBottom: '16px' }}>📋 Рӯйхати корбарон ({users.length})</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button 
                onClick={() => window.open('/api/admin/export?format=csv', '_blank')}
                style={{ background: 'var(--success)' }}
              >
                📥 Скачать CSV
              </button>
              <button onClick={loadUsers} style={{ background: 'var(--surface-light)' }}>🔄 Обновить</button>
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
                       <span className={parseInt(u.today_answers_count) >= 5 ? "badge active" : "badge"} style={{ background: parseInt(u.today_answers_count) >= 5 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)' }}>
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
    'q1': 'Савол 1 (Дарди имрӯз)',
    'q2': 'Савол 2 (Триггер)',
    'q3': 'Савол 3 (Тарс)',
    'q4': 'Савол 4 (Бе фиреб)',
    'q5': 'Савол 5 (Қадами дуруст)',
    'note': 'ФАҲМИШИ КУРС (Reflection)',
  };

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '20px', width: 'auto', background: 'var(--surface-light)' }}>
        ← Ба қафо
      </button>

      <div className="recent-card">
        <div className="recent-header" style={{ padding: '24px 24px 0' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Ҷавобҳои: {user.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>ID: {user.id}</p>
        </div>

        <div style={{ padding: '24px' }}>
          <div className="history-list">
            {profile.recentAnswers?.length > 0 ? (
              profile.recentAnswers.map((ans: any) => (
                <div key={ans.id} className="history-item" style={{ background: ans.question_key === 'note' ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.02)', border: ans.question_key === 'note' ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '800', color: ans.question_key === 'note' ? 'var(--primary-light)' : 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                      {labelMap[ans.question_key] || ans.question_key}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(ans.created_at).toLocaleDateString('tg-TJ')}
                    </span>
                  </div>
                  <p style={{ fontSize: '1.1rem', color: '#fff', whiteSpace: 'pre-wrap' }}>
                    {ans.answer_text}
                  </p>
                </div>
              ))
            ) : (
              <div className="empty-state">Ҷавобҳо ҳанӯз нестанд</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
