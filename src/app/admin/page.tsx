'use client';

import { useState, useEffect, useCallback } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.id && u.id.toString().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

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

  const toggleSubscription = async (userId: number, status: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadUsers();
      if (selectedUser?.id === userId) {
        loadUserDetail(userId);
      }
    } catch (error) {
      console.error('Update subscription error:', error);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">Боркунӣ...</div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <h1>Админ Панели Курс</h1>
          <p>Идораи корбарон ва машқҳо</p>
        </div>
        
        <div className="search-box" style={{ maxWidth: '350px' }}>
          <span className="icon">🔍</span>
          <input 
            type="text" 
            placeholder="Ҷустуҷӯ аз рӯи ном, телеграм, телефон..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery.length >= 2 && filteredUsers.length > 0 && (
            <div className="search-results show">
              {filteredUsers.slice(0, 10).map((u, i) => (
                <div 
                  key={i} 
                  className="search-result-item"
                  onClick={() => { loadUserDetail(u.id); setSearchQuery(''); }}
                >
                  <div className="name">{u.name} {u.subscription_status === 'premium' ? '👑' : ''}</div>
                  <div className="id">ID: {u.id}</div>
                  <div className="info">
                    <span>Ҳолат: {u.subscription_status}</span>
                    {u.phone && <span>{u.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="icon">👥</div>
          <div className="label">Ҳамаи корбарон</div>
          <div className="value">{users.length}</div>
        </div>

        <div className="stat-card finished">
          <div className="icon">⭐</div>
          <div className="label">Премиум</div>
          <div className="value">
            {users.filter(u => u.subscription_status === 'premium').length}
          </div>
        </div>

        <div className="stat-card clicks">
          <div className="icon">✅</div>
          <div className="label">Иҷрошуда</div>
          <div className="value">
            {users.filter(u => u.total_days_completed > 0).length}
          </div>
        </div>

        <div className="stat-card not-finished">
          <div className="icon">🔥</div>
          <div className="label">Стрик бошад</div>
          <div className="value">
            {Math.max(...users.map(u => u.current_streak || 0), 0)}
          </div>
        </div>
      </div>

      {selectedUser ? (
        <UserDetail 
          user={selectedUser} 
          onBack={() => setSelectedUser(null)}
          onUpdate={() => loadUsers()}
        />
      ) : (
        <div className="recent-card">
          <div className="recent-header">
            <h2>📋 Рӯйхати корбарон ({users.length})</h2>
            <button onClick={loadUsers}>🔄 Обновить</button>
          </div>
          <table className="sessions-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Ном</th>
                <th>Телефон</th>
                <th>Ҳолат</th>
                <th>Кунҷҳо</th>
                <th>Андоз</th>
                <th>Стрик</th>
                <th>Сатҳ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={8} className="empty-state">Корбарон нест</td></tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <tr key={u.id} onClick={() => loadUserDetail(u.id)} style={{ cursor: 'pointer' }}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="user-name">{u.name}</div>
                      <div className="session-id">ID: {u.id}</div>
                    </td>
                    <td>{u.phone || '-'}</td>
                    <td>
                      <span className={`badge ${u.subscription_status === 'premium' ? 'finished' : 'active'}`}>
                        {u.subscription_status === 'premium' ? '👑 Premium' : 
                         u.subscription_status === 'free' ? '🆓 Бесплатно' : u.subscription_status}
                      </span>
                    </td>
                    <td>{u.total_days_completed || 0}</td>
                    <td>{u.total_points || 0}</td>
                    <td><strong style={{ color: 'var(--warning)' }}>{u.current_streak || 0}</strong></td>
                    <td>Ур. {u.level || 1}</td>
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

function UserDetail({ user, onBack, onUpdate }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'assignments' | 'answers'>('info');

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/full`);
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const updateSubscription = async (status: string) => {
    try {
      await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      onUpdate();
      loadProfile();
    } catch (error) {
      console.error('Update error:', error);
    }
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
        ← Назад к списку
      </button>

      <div className="recent-card">
        <div className="recent-header">
          <h2>Профил: {user.name} (ID: {user.id})</h2>
          {user.phone && <span>📱 {user.phone}</span>}
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} 
              onClick={() => setActiveTab('info')}>📊 Статистика</button>
            <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('assignments')}>📚 Машқот</button>
            <button className={`tab-btn ${activeTab === 'answers' ? 'active' : ''}`} 
              onClick={() => setActiveTab('answers')}>✍️ Ҷавобҳо</button>
          </div>

          {activeTab === 'info' && profile && (
            <div className="profile-info">
              <div className="stats-row" style={{ marginTop: '20px' }}>
                <div className="stat-box">
                  <span className="stat-value">{profile.progress?.current_streak || 0}</span>
                  <span className="stat-label">Дарозии машқот</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{profile.progress?.total_days_completed || 0}</span>
                  <span className="stat-label">Ҳамаги машқот</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{profile.progress?.total_points || 0}</span>
                  <span className="stat-label">Андоз</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">Ур. {profile.progress?.level || 1}</span>
                  <span className="stat-label">Сатҳ</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ҳолат:</span>
                <select 
                  value={user.subscription_status}
                  onChange={(e) => updateSubscription(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-light)',
                    color: 'var(--text)',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="free">🆓 Бесплатно</option>
                  <option value="premium">👑 Премиум</option>
                  <option value="banned">🚫 Блокировка</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && profile && (
            <div className="history-section" style={{ marginTop: '16px' }}>
              <h3>Таърихи машқот</h3>
              <div className="history-list">
                {profile.assignments?.map((a: any) => (
                  <div key={a.id} className="history-item">
                    <span className="date">{a.assigned_date}</span>
                    <span className="title">{a.title}</span>
                    <span className={`status ${a.status}`}>
                      {a.status === 'completed' ? `✅ ${a.score} балл` : '⏳'}
                    </span>
                  </div>
                )) || <p>Машқоте нест</p>}
              </div>
            </div>
          )}

          {activeTab === 'answers' && profile && (
            <div className="history-section" style={{ marginTop: '16px' }}>
              <h3>Ҷавобҳои охирин</h3>
              <div className="history-list">
                {profile.recentAnswers?.map((ans: any, i: number) => (
                  <div key={ans.id} className="history-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {ans.assigned_date} • {ans.question_key}
                      </span>
                      <span className={`status ${ans.is_completed ? 'completed' : 'pending'}`}>
                        {ans.is_completed ? '✅' : '⏳'}
                      </span>
                    </div>
                    <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>
                      {ans.answer_text?.substring(0, 150)}
                      {ans.answer_text?.length > 150 && '...'}
                    </p>
                  </div>
                )) || <p>Ҷавоб нест</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
