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
  const [lastSearchTime, setLastSearchTime] = useState(0);

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

  if (loading && !stats) return <div className="empty-state">Загрузка...</div>;

  const conversion = getConversion();
  const dashoffset = 251.2 - (251.2 * conversion / 100);

  return (
    <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div className="header-left">
          <h1 style={{ fontFamily: 'Syne', fontSize: '1.75rem', fontWeight: 800 }}>Админ Панель</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Диагностика - Статистика и аналитика</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="export-btns" style={{ display: 'flex', gap: '10px' }}>
            <button className="export-btn" onClick={() => exportData('csv')}>📥 CSV</button>
            <button className="export-btn" onClick={() => exportData('json')}>📥 JSON</button>
          </div>
          <div className="search-box" style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Поиск (ID, имя)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '10px 18px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white' }}
            />
            {searchResults.length > 0 && (
              <div className="search-results show" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', zIndex: 100, border: '1px solid var(--border)', borderRadius: '10px', marginTop: '5px', maxHeight: '200px', overflowY: 'auto' }}>
                {searchResults.map((s, i) => (
                  <div key={i} className="search-result-item" style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                    <div className="name">{s.user_name || 'Без имени'}</div>
                    <div className="id" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{s.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon="📊" label="Всего Заходили" value={stats?.totalSessions} sub="пользователей" />
        <StatCard icon="✅" label="Завершили Тест" value={stats?.finishedSessions} sub="дошли до конца" />
        <StatCard icon="⏸️" label="Не дошли до конца" value={stats?.notFinishedSessions} sub="бросили тест" />
        <StatCard icon="📲" label="Перешли в канал" value={stats?.clicksCount} sub="кликнули" />
      </div>

      <div className="conversion-card" style={{ background: 'var(--surface)', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid var(--border)' }}>
        <div className="conversion-header" style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>📈 Конверсия</div>
        <div className="conversion-content" style={{ display: 'flex', alignItems: 'center', gap: '40px', justifyContent: 'center' }}>
          <div className="conversion-ring" style={{ position: 'relative', width: '140px', height: '140px' }}>
            <svg width="140" height="140" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-light)" stroke-width="10"/>
              <circle 
                cx="50" cy="50" r="40" fill="none" 
                stroke="var(--primary)" 
                stroke-width="10" 
                stroke-linecap="round" 
                stroke-dasharray="251.2" 
                stroke-dashoffset={dashoffset} 
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="conversion-value" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.8rem', fontWeight: 800 }}>
              {conversion}%
            </div>
          </div>
          <div className="conversion-info" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <p>Сколько людей из тех кто завершил тест - перешли в канал</p>
          </div>
        </div>
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="chart-card" style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>📊 Результаты тестов</h2>
          <div className="results-bars" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stats?.resultsBreakdown?.map((r: any) => (
              <div key={r.result_type} className="result-bar-item" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '120px', fontSize: '0.85rem' }}>{resultNames[r.result_type] || 'Неизв.'}</div>
                <div style={{ flex: 1, height: '30px', background: 'var(--surface-light)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${(r.count / (Math.max(...stats.resultsBreakdown.map((x: any) => x.count)) || 1)) * 100}%`,
                      background: r.result_type === 1 ? '#818cf8' : r.result_type === 2 ? '#34d399' : '#fbbf24',
                      display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '0.8rem', fontWeight: 700
                    }}
                  >
                    {r.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card" style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>📈 Активность по дням</h2>
          <div style={{ height: '160px', position: 'relative' }}>
            <DailyChart data={stats?.dailyStats} />
          </div>
        </div>
      </div>

      <div className="recent-card" style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <h2>🕐 Последние сессии</h2>
          <button onClick={loadData} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer' }}>Обновить</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-light)', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>ID / Имя</th>
                <th style={{ padding: '15px' }}>Дата</th>
                <th style={{ padding: '15px' }}>Вопрос</th>
                <th style={{ padding: '15px' }}>Статус</th>
                <th style={{ padding: '15px' }}>Результат</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.user_name || 'Без имени'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{s.id}</div>
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.85rem' }}>{new Date(s.created_at).toLocaleString()}</td>
                  <td style={{ padding: '15px' }}>{s.current_q}/7</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem',
                      background: s.status === 'finished' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                      color: s.status === 'finished' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.85rem' }}>{resultNames[s.result_type] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <div className="stat-card" style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
      <div className="icon" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{icon}</div>
      <div className="label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div className="value" style={{ fontSize: '2rem', fontWeight: 800 }}>{value ?? '-'}</div>
      <div className="sub" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub}</div>
    </div>
  );
}

function DailyChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="empty-state">Нет данных</div>;

  const width = 400;
  const height = 150;
  const padding = 10;
  
  // Last 10 days
  const today = new Date();
  const chartData = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayData = data.find((x: any) => x.date.slice(0, 10) === dateStr);
    chartData.push({
      date: dateStr,
      count: dayData ? dayData.sessions : 0,
      day: d.getDate()
    });
  }

  const maxVal = Math.max(...chartData.map(d => d.count), 1);
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * width;
    const y = height - padding - (d.count / maxVal) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--primary)" />
      ))}
    </svg>
  );
}
