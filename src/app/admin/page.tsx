'use client';

import { useState, useEffect, useCallback } from 'react';

const resultNames: Record<number, string> = { 
  1: 'Тарси радшавӣ', 
  2: 'Ҷудоӣ аз худ', 
  3: 'Беқадрии амиқ' 
};

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // We only auto-refresh the first 100 to keep it fast
      const recentRes = await fetch('/api/admin/recent?limit=100');
      const recentData = await recentRes.json();
      
      setRecentSessions(recentData);
      if (recentData.length < 100) setHasMore(false);
      else setHasMore(true);

      const notesRes = await fetch('/api/admin/notes');
      const notesData = await notesRes.json();
      setUserNotes(notesData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || recentSessions.length >= 5000) return;
    
    setLoadingMore(true);
    try {
      const offset = recentSessions.length;
      const res = await fetch(`/api/admin/recent?limit=100&offset=${offset}`);
      const newData = await res.json();
      
      if (newData.length < 100) {
        setHasMore(false);
      }
      
      setRecentSessions(prev => [...prev, ...newData]);
    } catch (error) {
      console.error('Error loading more sessions:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (e) {
        console.error('Search error:', e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const exportData = async (format: 'csv' | 'json') => {
    window.location.href = `/api/admin/export?format=${format}`;
  };

  const getConversion = () => {
    if (!stats) return 0;
    const finished = stats.finishedSessions || 0;
    const both = stats.bothFinishedAndClicked || 0;
    return finished > 0 ? Math.round((both / finished) * 100) : 0;
  };

  if (loading && !stats) return (
    <div className="empty-state">Загрузка...</div>
  );

  const conversion = getConversion();
  const dashoffset = 251.2 - (251.2 * conversion / 100);

  const resultsBreakdown = stats?.resultsBreakdown || [];
  const maxResultCount = Math.max(...resultsBreakdown.map((r: any) => r.count), 1);

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <h1>Админ Панель</h1>
          <p>Диагностика - Статистика и аналитика</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="export-btns">
            <button className="export-btn" onClick={() => exportData('csv')}>📥 CSV</button>
            <button className="export-btn" onClick={() => exportData('json')}>📥 JSON</button>
          </div>
          <div className="search-box">
            <span className="icon">🔍</span>
            <input 
              type="text" 
              placeholder="Поиск (ID, имя, ключевое слово)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchResults.length > 0 && (
              <div className="search-results show">
                {searchResults.map((s, i) => (
                  <div key={i} className="search-result-item">
                    <div className="name">{s.user_name || 'Без имени'}</div>
                    <div className="id">{s.id}</div>
                    <div className="info">
                      <span>Статус: {s.status}</span>
                      <span>Вопрос: {s.current_q}/7</span>
                      {s.result_type && <span>Рез: {resultNames[s.result_type]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="icon">📊</div>
          <div className="label">Всего Заходили</div>
          <div className="value">{stats?.totalSessions ?? '-'}</div>
          <div className="sub">пользователей</div>
        </div>
        
        <div className="stat-card finished">
          <div className="icon">✅</div>
          <div className="label">Завершили Тест</div>
          <div className="value">{stats?.finishedSessions ?? '-'}</div>
          <div className="sub">дошли до конца</div>
        </div>
        
        <div className="stat-card not-finished">
          <div className="icon">⏸️</div>
          <div className="label">Не дошли до конца</div>
          <div className="value">{stats?.notFinishedSessions ?? '-'}</div>
          <div className="sub">бросили тест</div>
        </div>
        
        <div className="stat-card clicks">
          <div className="icon">📲</div>
          <div className="label">Перешли в канал</div>
          <div className="value">{stats?.clicksCount ?? '-'}</div>
          <div className="sub">кликнули</div>
        </div>
      </div>

      <div className="conversion-card">
        <div className="conversion-header">📈 Конверсия</div>
        <div className="conversion-content">
          <div className="conversion-ring">
            <svg width="140" height="140" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-light)" strokeWidth="10"/>
              <circle 
                cx="50" cy="50" r="40" fill="none" 
                stroke="url(#converGradient)" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeDasharray="251.2" 
                strokeDashoffset={dashoffset} 
                transform="rotate(-90 50 50)"
              />
              <defs>
                <linearGradient id="converGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'var(--primary)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--accent)' }} />
                </linearGradient>
              </defs>
            </svg>
            <div className="conversion-value">
              <span>{conversion}</span>%
            </div>
          </div>
          <div className="conversion-info">
            <p>Сколько людей из тех кто завершил тест - перешли в канал</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h2>📊 Результаты тестов</h2>
            <span>распределение по типам</span>
          </div>
          <div className="chart-body">
            <div className="results-bars">
              {[1, 2, 3].map((type) => {
                const count = resultsBreakdown.find((r: any) => r.result_type === type)?.count || 0;
                const percent = (count / maxResultCount) * 100;
                return (
                  <div key={type} className="result-bar-item">
                    <div className="label">{resultNames[type]}</div>
                    <div className="bar-wrap">
                      <div className={`bar-fill type${type}`} style={{ width: `${percent}%` }}>
                        {count}
                      </div>
                    </div>
                    <div className="count">{count}</div>
                  </div>
                );
              })}
              {resultsBreakdown.length === 0 && <div className="empty-state">Пока никто не прошёл тест</div>}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>📈 Активность по дням</h2>
            <span>последние 10 дней</span>
          </div>
          <div className="chart-body">
            <DailyChart data={stats?.dailyStats} />
          </div>
        </div>
      </div>

      <div className="recent-card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent)' }}>
        <div className="recent-header">
          <h2>📩 Сообщения о «боли» пользователей</h2>
          {userNotes.length > 0 && <span className="badge active">{userNotes.length} новых</span>}
        </div>
        <div className="notes-list" style={{ padding: '0 24px 24px' }}>
          {userNotes.length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✉️</div>
              Здесь появятся глубокие ответы пользователей о тех вещах, которые их беспокоят.
            </div>
          ) : (
            userNotes.map((note, i) => (
              <div key={i} className="note-card" style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: '16px', 
                borderRadius: '12px', 
                marginBottom: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--accent)' }}>{note.user_name || 'Аноним'}</strong>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {new Date(note.created_at).toLocaleString('ru-RU')}
                  </small>
                </div>
                <p style={{ margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>"{note.user_note}"</p>
                {note.result_type && (
                  <div style={{ marginTop: '8px' }}>
                    <span className={`badge type${note.result_type}`} style={{ fontSize: '0.7rem' }}>
                      Результат: {resultNames[note.result_type]}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="recent-card">
        <div className="recent-header">
          <h2>🕐 Последние сессии</h2>
          <button onClick={loadData}>🔄 Обновить</button>
        </div>
        <table className="sessions-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Имя / ID</th>
              <th>Дата</th>
              <th>Дошел до</th>
              <th>Статус</th>
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            {recentSessions.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">Нет данных</td></tr>
            ) : (
              recentSessions.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="user-name">{s.user_name || 'Без имени'}</div>
                    <div className="session-id">{s.id}</div>
                  </td>
                  <td>{new Date(s.created_at).toLocaleString('ru-RU')}</td>
                  <td>{s.current_q}/7</td>
                  <td>
                    <span className={`badge ${s.status === 'finished' ? 'finished' : 'active'}`}>
                      {s.status === 'finished' ? 'Завершено' : 'В процессе'}
                    </span>
                  </td>
                  <td>
                    {s.result_type ? (
                      <span className={`badge type${s.result_type}`}>
                        {resultNames[s.result_type]}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {hasMore && recentSessions.length < 5000 && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <button 
              className="export-btn" 
              onClick={handleLoadMore} 
              disabled={loadingMore}
              style={{ width: '200px', background: 'var(--surface-light)' }}
            >
              {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
            </button>
          </div>
        )}
        
        {!hasMore && recentSessions.length > 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Все данные загружены
          </div>
        )}
      </div>
    </div>
  );
}

function DailyChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="empty-state">Нет данных</div>;

  const width = 400; // Will scale via SVG preserveAspectRatio
  const height = 160;
  const padding = 10;
  const baseY = height;
  const usableHeight = baseY - padding;
  
  const today = new Date();
  const chartData = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayData = data.find((x: any) => x.date === dateStr);
    chartData.push({
      date: dateStr,
      count: dayData ? dayData.sessions : 0,
      finished: dayData ? dayData.finished : 0,
      clicks: dayData ? dayData.clicks : 0,
      day: d.getDate()
    });
  }

  const maxDaily = Math.max(...chartData.map(d => d.count), 1);
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * width;
    const y = baseY - padding - ((d.count / maxDaily) * usableHeight * 0.9);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length-1].x} ${baseY} L ${points[0].x} ${baseY} Z`;

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const gridY = padding + (i / 4) * usableHeight;
    gridLines.push(<line key={i} className="daily-chart-grid" x1="0" y1={gridY} x2={width} y2={gridY} />);
  }

  return (
    <>
      <div className="daily-chart-container">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <g className="grid">{gridLines}</g>
          <path className="daily-chart-area" d={areaPath} />
          <path className="daily-chart-line-path" d={linePath} />
        </svg>
        {points.map((p, i) => {
          const tooltip = `${p.date}\n👤 Зашли: ${p.count}\n✅ Заверш: ${p.finished}\n📲 Канал: ${p.clicks}`;
          return (
            <div 
              key={i} 
              className="daily-dot-point" 
              style={{ left: `${(p.x / width) * 100}%`, bottom: `${height - p.y}px` }}
              data-tooltip={tooltip}
            />
          );
        })}
      </div>
      <div className="daily-xlabels">
        {chartData.map((d, i) => <span key={i}>{d.day}</span>)}
      </div>
    </>
  );
}
