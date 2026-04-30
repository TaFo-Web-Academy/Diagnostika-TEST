'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';

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
    setLoading(true);
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

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#10b981]/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Ravoni Infrastructure</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Панели Админ</h1>
            <p className="text-white/40 font-medium text-sm md:text-lg">Системаи мониторинг ва идоракунии тестҳо</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={fetchUsers}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-xl"
              title="Навсозӣ"
            >
              🔄
            </button>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-3xl font-black text-[#10b981]">{users.length}</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Аъзоён</span>
            </div>
          </motion.div>
        </header>

        {/* Search & Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-12"
        >
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-20">🔍</div>
          <input
            type="text"
            placeholder="Ҷустуҷӯи фойдаланувчи ё промокод..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-16 text-lg outline-none focus:bg-white/10 focus:border-[#10b981]/50 transition-all backdrop-blur-xl placeholder:text-white/20 shadow-2xl"
          />
        </motion.div>

        {/* Data Grid / Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-6 px-8 text-[11px] font-black text-white/30 uppercase tracking-widest">Фойдаланувчи</th>
                  <th className="py-6 px-8 text-[11px] font-black text-white/30 uppercase tracking-widest hidden sm:table-cell">Синн</th>
                  <th className="py-6 px-8 text-[11px] font-black text-white/30 uppercase tracking-widest">Промокод</th>
                  <th className="py-6 px-8 text-[11px] font-black text-white/30 uppercase tracking-widest text-right">Санаи ворид</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-white/20 italic">
                      Маълумот ёфт нашуд
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u: any) => (
                    <tr
                      key={u.id}
                      onClick={() => handleUserClick(u)}
                      className="group cursor-pointer hover:bg-[#10b981]/5 transition-all"
                    >
                      <td className="py-8 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black text-lg border border-white/10 group-hover:border-[#10b981]/30 transition-all">
                            {u.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-black group-hover:text-[#10b981] transition-colors">{u.name} {u.surname}</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-8 hidden sm:table-cell">
                        <span className="text-lg font-bold text-white/60">{u.age}</span>
                        <span className="text-[10px] font-bold text-white/20 ml-1 uppercase">сол</span>
                      </td>
                      <td className="py-8 px-8">
                        <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-black text-[#10b981] tracking-wider">
                          {u.promo_code}
                        </span>
                      </td>
                      <td className="py-8 px-8 text-white/30 text-sm text-right font-bold">
                        {new Date(u.created_at).toLocaleDateString('tg-TJ', { day: '2-digit', month: 'long' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal Overlay */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6"
            >
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-lg"
                onClick={() => setSelectedUser(null)}
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-[#0f1110] w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 rounded-t-[3rem] sm:rounded-[3.5rem] border-t sm:border border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.8)] p-8 md:p-12 scrollbar-hide"
              >
                {/* Close Handle (Mobile) */}
                <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-10 sm:hidden"></div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-[#10b981]/20 text-[#10b981] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#10b981]/30">Active Member</span>
                      <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{selectedUser.name} {selectedUser.surname}</h2>
                    <p className="text-white/40 text-lg mt-2">{selectedUser.age} сол • {selectedUser.marital_status === 'married' ? 'Оиладор' : 'Муҷаррад'}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-2xl border border-white/10"
                  >
                    ✕
                  </button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-12">
                  <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center">
                    <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Daily Streak</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-[#10b981]">{calculateStreak(userAnswers)}</span>
                      <span className="text-2xl font-bold opacity-40">🔥</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center">
                    <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Total Answers</span>
                    <span className="text-5xl font-black text-white">{userAnswers.length}</span>
                  </div>
                </div>

                {/* Answers List */}
                <div className="space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-widest text-[#10b981]">Натиҷаҳои Тестҳо</h3>
                  
                  {modalLoading ? (
                    <div className="py-20 text-center">
                      <div className="w-10 h-10 border-3 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : userAnswers.length === 0 ? (
                    <div className="py-20 text-center glass-card border-dashed">
                      <p className="text-white/20 italic">Ҳанӯз ягон тест супорида нашудааст</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5].map(day => {
                        const dayAnswers = userAnswers.filter(a => a.day_number === day);
                        if (dayAnswers.length === 0) return null;
                        return (
                          <div key={day} className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5">
                            <div className="flex justify-between items-center mb-8">
                              <span className="text-sm font-black text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-4 py-2 rounded-xl">Рӯзи {day}</span>
                              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{new Date(dayAnswers[0].created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {dayAnswers.map((ans, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-3xl border border-white/5 group hover:border-[#10b981]/30 transition-all">
                                  <span className="text-[10px] font-black text-white/20 uppercase mb-2">Саволи {ans.question_index + 1}</span>
                                  <span className="text-3xl font-black text-[#10b981]">{ans.selected_option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
