'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u: any) =>
    `${u.name} ${u.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.promo_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="app-container full-width">
        <div className="p-4 md:p-10 text-center">
          <div className="skeleton skeleton-text w-48 h-8 mx-auto mb-4"></div>
          <div className="skeleton skeleton-text w-32 h-6 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container full-width">
      <div className="p-4 md:p-10">
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-2">
                Панели Админ
              </h1>
              <p className="text-muted text-sm">
                Идоракунии фойдаланувандагон ва натиҷаҳои тестҳо
              </p>
            </div>
            <div className="stats-card md:w-auto">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Ҳамагӣ</div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="input-group mb-4">
            <input
              type="text"
              placeholder=" "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <label>Ҷустуҷӯи фойдаланувандагон...</label>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 font-semibold text-muted text-sm">ID</th>
                  <th className="p-4 font-semibold text-muted text-sm">Исм ва Насаб</th>
                  <th className="p-4 font-semibold text-muted text-sm hidden sm:table-cell">Синн</th>
                  <th className="p-4 font-semibold text-muted text-sm">Промокод</th>
                  <th className="p-4 font-semibold text-muted text-sm hidden md:table-cell">Санаи ворид</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <div className="empty-state-title">Фойдаланувандагон ёфт нашуд</div>
                        <div className="empty-state-text">
                          Бо филтри дигар кӯшиш кунед ё ягон фойдаланувандагон ёшта нест
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u: any) => (
                    <tr
                      key={u.id}
                      className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 opacity-50 text-sm">#{u.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-sm">{u.name} {u.surname}</div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">{u.age}</td>
                      <td className="p-4">
                        <span className="bg-primary-soft text-primary px-3 py-1 rounded-full text-xs font-bold">
                          {u.promo_code}
                        </span>
                      </td>
                      <td className="p-4 opacity-60 text-sm hidden md:table-cell">
                        {new Date(u.created_at).toLocaleDateString('tg-TJ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-muted text-sm mt-6">
          <p>Шумораи умумии фойдаланувандагон: {users.length}</p>
        </div>
      </div>
    </div>
  );
}
