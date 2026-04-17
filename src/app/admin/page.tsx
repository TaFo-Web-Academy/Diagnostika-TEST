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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const recentRes = await fetch('/api/admin/recent');
      const recentData = await recentRes.json();
      setRecentSessions(recentData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 10000);
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
      Боркунӣ...
    </div>
  );

  const conversion = getConversion();
  const dashoffset = 251.2 - (251.2 * conversion / 100);

  return (
    <div className="admin-page" style={{ padding: '24px' }}>
      <header className="admin-header">
        <div className="header-left">
          <h1>Админ Панель</h1>
          <p>Диагностика - Статистика и аналитика</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="export-btns">
            <button className="export-btn" onClick={() => exportData('csv')}>📥 CSV</button>
            <button className="export-btn" onClick={() => exportData('json')}>📥 JSON</button>
          </div>
          <div className="search-box-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Поиск (ID, имя)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-results show" style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, 
                background: 'var(--surface)', zIndex: 100, border: '1px solid var(--border)', 
                borderRadius: '14px', marginTop: '8px', maxHeight: '300px', overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}>
                {searchResults.map((s, i) => (
                  <div key={i} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600 }}>{s.user_name || 'Без имени'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{s.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="admin-stats-grid">
        <StatCard icon="📊" className="total" label="Всего Заходили" value={stats?.totalSessions} sub="пользователей" />
        <StatCard icon="✅" className="finished" label="Завершили Тест" value={stats?.finishedSessions} sub="дошли до конца" />
        <StatCard icon="⏸️" className="not-finished" label="Не дошли до конца" value={stats?.notFinishedSessions} sub="бросили тест" />
        <StatCard icon="📲" className="clicks" label="Перешли в канал" value={stats?.clicksCount} sub="кликнули" />
      </div>

      <div className="admin-conversion-card">
        <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>📈 Конверсия</div>
        <div className="admin-conversion-content">
          <div style={{ position: 'relative', width: '140px', height: '140px' }}>
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
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
              <defs>
                <linearGradient id="converGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'var(--primary)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--accent)' }} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.8rem', fontWeight: 800 }}>
              {conversion}%
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '300px' }}>
            <p>Сколько людей из тех кто завершил тест — перешли в канал</p>
          </div>
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h2>📊 Результаты тестов</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>распределение по типам</span>
          </div>
          <div className="admin-chart-body">
            <div className="admin-results-bars">
              {[1, 2, 3].map(type => {
                const count = stats?.resultsBreakdown?.find((r: any) => r.result_type === type)?.count || 0;
                const max = Math.max(...(stats?.resultsBreakdown?.map((x: any) => x.count) || [1]), 1);
                return (
                  <div key={type} className="admin-result-bar-item">
                    <div style={{ width: '120px', fontSize: '0.9rem' }}>{resultNames[type]}</div>
                    <div className="bar-wrap">
                      <div 
                        className={`bar-fill type${type}`} 
                        style={{ width: `${(count / max) * 100}%`, transition: 'width 0.6s ease' }}
                      >
                        {count}
                      </div>
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', fontWeight: 700 }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h2>📈 Активность по дням</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>последние 10 дней</span>
          </div>
          <div className="admin-chart-body">
            <div style={{ height: '200px', position: 'relative' }}>
              <DailyChart data={stats?.dailyStats} />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-recent-card">
        <div className="admin-chart-header">
          <h2>🕐 Последние сессии</h2>
          <button 
            onClick={loadData} 
            className="primary-btn" 
            style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}
          >
            Обновить
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имя / ID</th>
                <th>Дата</th>
                <th>Дошел до</th>
                <th>Статус</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.user_name || 'Без имени'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{s.id}</div>
                  </td>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                  <td>{s.current_q}/7</td>
                  <td>
                    <span className={`badge ${s.status}`}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, className }: any) {
  return (
    <div className={`admin-stat-card ${className}`}>
      <div className="icon">{icon}</div>
      <div className="label">{label}</div>
      <div className="value">{value ?? '-'}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}

function DailyChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Нет данных</div>;

  const width = 400;
  const height = 160;
  const padding = 20;
  const baseY = height - padding;
  
  // Last 10 days logic
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
      day: d.getDate()
    });
  }

  const maxVal = Math.max(...chartData.map(d => d.count), 1);
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * width;
    const y = baseY - (d.count / maxVal) * (baseY - padding);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length-1].x} ${baseY} L ${points[0].x} ${baseY} Z`;

  return (
    <>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path d={areaPath} className="area-path" />
        <path d={linePath} className="line-path" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--primary)" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        {chartData.map((d, i) => <span key={i}>{d.day}</span>)}
      </div>
    </>
  );
}
