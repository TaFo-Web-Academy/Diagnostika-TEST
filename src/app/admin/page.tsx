'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleUserClick = async (user: any) => {
    setSelectedUser(user);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/answers?userId=${user.id}`);
      const data = await res.json();
      setUserAnswers(data.answers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const calculateStreak = (answers: any[]) => {
    if (!answers.length) return 0;
    // Get unique dates when user answered
    const dates = Array.from(new Set(answers.map(a => new Date(a.created_at).toDateString())))
      .map(d => new Date(d).getTime())
      .sort((a, b) => b - a);
    
    let streak = 0;
    let current = new Date().toDateString();
    let currentDate = new Date(current).getTime();
    const oneDay = 86400000;

    for (let i = 0; i < dates.length; i++) {
      // Check if current date or previous date matches
      if (dates[i] === currentDate || dates[i] === currentDate - oneDay) {
        streak++;
        currentDate = dates[i];
      } else {
        break;
      }
    }
    return streak;
  };

  const filteredUsers = users.filter((u: any) =>
    `${u.name} ${u.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.promo_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="app-container full-width flex items-center justify-center min-h-screen bg-[#080a09]">
        <div className="text-primary animate-pulse font-black uppercase tracking-[0.3em]">
          Loading Data...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container full-width">
      <div className="p-6 md:p-10">
        <div className="glass-card mb-10 border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-gradient mb-2">
                Панели Админ
              </h1>
              <p className="text-muted text-sm uppercase font-bold tracking-widest opacity-60">
                Идоракунии фойдаланувандагон ва натиҷаҳо
              </p>
            </div>
            <div className="glass-card md:w-auto bg-primary/10 border-primary/30 flex flex-col items-center justify-center py-4 px-8 min-w-[140px]">
              <div className="text-4xl font-black text-primary leading-none">{users.length}</div>
              <div className="text-[10px] uppercase font-black tracking-widest text-primary/70 mt-1">Ҳамагӣ</div>
            </div>
          </div>
        </div>

        <div className="glass-card mb-10 p-4">
          <div className="input-group">
            <label>Ҷустуҷӯи фойдаланувандагон...</label>
            <input
              type="text"
              placeholder="Ном ё промокодро ворид кунед"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5"
            />
          </div>
        </div>

        <div className="glass-card p-0 overflow-hidden shadow-2xl border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 font-black text-primary text-[10px] uppercase tracking-widest">ID</th>
                  <th className="p-6 font-black text-primary text-[10px] uppercase tracking-widest">Исм ва Насаб</th>
                  <th className="p-6 font-black text-primary text-[10px] uppercase tracking-widest hidden sm:table-cell">Синн</th>
                  <th className="p-6 font-black text-primary text-[10px] uppercase tracking-widest">Промокод</th>
                  <th className="p-6 font-black text-primary text-[10px] uppercase tracking-widest hidden md:table-cell text-right">Сана</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-muted italic">
                      Фойдаланувандагон ёфт нашуд
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u: any) => (
                    <tr
                      key={u.id}
                      onClick={() => handleUserClick(u)}
                      className="border-t border-white/5 hover:bg-primary/5 transition-all cursor-pointer group"
                    >
                      <td className="p-6 opacity-30 text-xs font-bold">#{u.id}</td>
                      <td className="p-6">
                        <div className="font-bold text-base text-text group-hover:text-primary transition-colors">{u.name} {u.surname}</div>
                      </td>
                      <td className="p-6 hidden sm:table-cell text-muted">{u.age}</td>
                      <td className="p-6">
                        <span className="stat-pill bg-primary/20 text-primary text-[10px]">
                          {u.promo_code}
                        </span>
                      </td>
                      <td className="p-6 text-muted text-sm hidden md:table-cell text-right font-medium">
                        {new Date(u.created_at).toLocaleDateString('tg-TJ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setSelectedUser(null)}
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 border-primary/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] scrollbar-hide"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-gradient">{selectedUser.name} {selectedUser.surname}</h2>
                    <p className="text-muted text-xs uppercase font-bold tracking-widest mt-1">ID: #{selectedUser.id} • {selectedUser.age} сол</p>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="glass-card bg-primary/5 border-primary/10 p-4 text-center">
                    <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Daily Streak</p>
                    <p className="text-3xl font-black text-text">{calculateStreak(userAnswers)} 🔥</p>
                  </div>
                  <div className="glass-card bg-white/5 border-white/10 p-4 text-center">
                    <p className="text-[10px] uppercase font-black text-muted tracking-widest mb-1">Ҷавобҳо</p>
                    <p className="text-3xl font-black text-text">{userAnswers.length}</p>
                  </div>
                </div>

                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Натиҷаҳои тестҳо</h3>
                
                {modalLoading ? (
                  <div className="py-10 text-center animate-pulse text-primary font-bold">Загрузка ответов...</div>
                ) : userAnswers.length === 0 ? (
                  <div className="py-10 text-center text-muted italic">Ҷавобҳо мавҷуд нестанд</div>
                ) : (
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map(day => {
                      const dayAnswers = userAnswers.filter(a => a.day_number === day);
                      if (dayAnswers.length === 0) return null;
                      return (
                        <div key={day} className="glass-card bg-white/5 border-white/5 p-4">
                          <div className="flex justify-between items-center mb-4">
                            <p className="font-black text-primary uppercase text-xs tracking-widest">Рӯзи {day}</p>
                            <p className="text-[10px] text-muted">{new Date(dayAnswers[0].created_at).toLocaleDateString('tg-TJ')}</p>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {dayAnswers.map((ans, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                                <span className="text-muted">Саволи {ans.question_index + 1}</span>
                                <span className="font-bold text-primary bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center">{ans.selected_option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center text-dim text-[10px] uppercase font-black tracking-[0.3em] mt-10">
          РАВОНИ PLATFORM v1.1.0
        </div>
      </div>
    </div>
  );
}
