'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-10 text-center">Боркунии маълумот...</div>;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Панели Админ</h1>
        <div className="bg-primary text-white px-4 py-2 rounded-lg font-bold">
          Ҳамагӣ: {users.length}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-gray-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-bottom border-gray-100">
              <th className="p-6 font-semibold opacity-60">ID</th>
              <th className="p-6 font-semibold opacity-60">Исм ва Насаб</th>
              <th className="p-6 font-semibold opacity-60">Синн</th>
              <th className="p-6 font-semibold opacity-60">Промокод</th>
              <th className="p-6 font-semibold opacity-60">Санаи ворид</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-6 opacity-50">#{u.id}</td>
                <td className="p-6 font-bold">{u.name} {u.surname}</td>
                <td className="p-6">{u.age}</td>
                <td className="p-6 text-sm bg-green-50 text-green-700 rounded-full inline-block mt-4 ml-4">
                  {u.promo_code}
                </td>
                <td className="p-6 opacity-60 text-sm">
                  {new Date(u.created_at).toLocaleDateString('tg-TJ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .text-primary { color: #3d5a41; }
        .bg-primary { background-color: #3d5a41; }
      `}</style>
    </div>
  );
}
