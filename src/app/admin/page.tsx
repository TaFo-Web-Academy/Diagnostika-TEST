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
    const dates = Array.from(new Set(answers.map(a => new Date(a.created_at).toDateString())))
      .map(d => new Date(d).getTime())
      .sort((a, b) => b - a);
    
    let streak = 0;
    let current = new Date().toDateString();
    let currentDate = new Date(current).getTime();
    const oneDay = 86400000;

    for (let i = 0; i < dates.length; i++) {
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans antialiased">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Apple Style Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Админ Панел</h1>
            <p className="text-white/50 text-sm font-medium">Системаи идоракунии RAVONI</p>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="bg-[#1c1c1e] rounded-2xl p-4 flex flex-col items-center min-w-[100px] border border-white/5">
              <span className="text-2xl font-bold">{users.length}</span>
              <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Аъзоён</span>
            </div>
          </div>
        </div>

        {/* Search Bar - iOS Style */}
        <div className="relative mb-10">
          <input
            type="text"
            placeholder="Ҷустуҷӯ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1c1c1e] border-none rounded-2xl py-4 px-12 text-lg outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all placeholder:text-white/20"
          />
          <span className="absolute left-4 top-4.5 text-xl opacity-30">🔍</span>
        </div>

        {/* Table/List - Mac System Style */}
        <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="py-5 px-8 text-[11px] font-bold text-white/40 uppercase tracking-widest">ID</th>
                  <th className="py-5 px-8 text-[11px] font-bold text-white/40 uppercase tracking-widest">Фойдаланувчи</th>
                  <th className="py-5 px-8 text-[11px] font-bold text-white/40 uppercase tracking-widest hidden sm:table-cell">Синн</th>
                  <th className="py-5 px-8 text-[11px] font-bold text-white/40 uppercase tracking-widest">Промокод</th>
                  <th className="py-5 px-8 text-[11px] font-bold text-white/40 uppercase tracking-widest text-right">Сана</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-white/20 font-medium">
                      Ягон натиҷа ёфт нашуд
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u: any) => (
                    <tr
                      key={u.id}
                      onClick={() => handleUserClick(u)}
                      className="group cursor-pointer hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-6 px-8 text-white/30 font-mono text-sm">#{u.id}</td>
                      <td className="py-6 px-8">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold group-hover:text-[#10b981] transition-colors">{u.name} {u.surname}</span>
                          <span className="text-xs text-white/30 hidden sm:inline">Professional Member</span>
                        </div>
                      </td>
                      <td className="py-6 px-8 hidden sm:table-cell text-white/50">{u.age}</td>
                      <td className="py-6 px-8">
                        <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-white/70 uppercase">
                          {u.promo_code}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-white/30 text-sm text-right font-medium">
                        {new Date(u.created_at).toLocaleDateString('tg-TJ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal - iOS Style Modal Sheet */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-6"
            >
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedUser(null)}
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-[#1c1c1e] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 rounded-t-[3rem] md:rounded-[3rem] border-t md:border border-white/10 shadow-2xl p-8 scrollbar-hide"
              >
                {/* Modal Handle */}
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 md:hidden"></div>

                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-black mb-2">{selectedUser.name} {selectedUser.surname}</h2>
                    <div className="flex gap-2">
                      <span className="bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Active</span>
                      <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">ID: #{selectedUser.id}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 rounded-3xl p-6 text-center border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2">Активность</p>
                    <p className="text-4xl font-black text-[#10b981]">{calculateStreak(userAnswers)} <span className="text-lg">🔥</span></p>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6 text-center border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2">Ҷавобҳо</p>
                    <p className="text-4xl font-black">{userAnswers.length}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-6">Натиҷаҳои марафон</h3>
                
                {modalLoading ? (
                  <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : userAnswers.length === 0 ? (
                  <div className="py-10 text-center text-white/20 italic">Ҳанӯз ҷавобҳо мавҷуд нестанд</div>
                ) : (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(day => {
                      const dayAnswers = userAnswers.filter(a => a.day_number === day);
                      if (dayAnswers.length === 0) return null;
                      return (
                        <div key={day} className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-black text-[#10b981] uppercase tracking-widest">Рӯзи {day}</span>
                            <span className="text-xs text-white/30">{new Date(dayAnswers[0].created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {dayAnswers.map((ans, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-2 p-3 bg-black/30 rounded-2xl">
                                <span className="text-[10px] font-bold text-white/20 uppercase">Q{ans.question_index + 1}</span>
                                <span className="text-xl font-bold text-[#10b981]">{ans.selected_option}</span>
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
      </div>
    </div>
  );
}
