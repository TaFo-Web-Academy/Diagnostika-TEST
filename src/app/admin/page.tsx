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
      <div className="flex items-center justify-center min-h-screen bg-[#080a09]">
        <div className="text-[#10b981] font-medium tracking-widest text-xs uppercase animate-pulse">
          Syncing...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a09] text-[#f0fdf4] font-sans selection:bg-[#10b981]/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Minimal Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h1 className="text-sm font-bold text-[#10b981] uppercase tracking-[0.4em] mb-4">
              Dashboard / Admin
            </h1>
            <div className="flex items-baseline gap-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Панели Админ</h2>
              <span className="text-white/20 text-4xl font-light">/</span>
              <div className="text-white/40 font-medium">
                <span className="text-white">{users.length}</span> users
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-72">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 py-3 px-1 text-sm outline-none focus:border-[#10b981] transition-colors placeholder:text-white/20"
              />
              <span className="absolute right-2 top-3 text-white/20 group-focus-within:text-[#10b981] transition-colors">
                🔍
              </span>
            </div>
          </div>
        </header>

        {/* Minimalist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-6 pr-6 font-bold text-white/30 text-[10px] uppercase tracking-widest w-16">ID</th>
                <th className="pb-6 pr-6 font-bold text-white/30 text-[10px] uppercase tracking-widest">Name</th>
                <th className="pb-6 pr-6 font-bold text-white/30 text-[10px] uppercase tracking-widest hidden sm:table-cell">Age</th>
                <th className="pb-6 pr-6 font-bold text-white/30 text-[10px] uppercase tracking-widest">Code</th>
                <th className="pb-6 font-bold text-white/30 text-[10px] uppercase tracking-widest text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-white/20 text-sm font-medium">
                    No results found in current view.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr
                    key={u.id}
                    onClick={() => handleUserClick(u)}
                    className="group cursor-pointer hover:bg-white/[0.02] transition-all"
                  >
                    <td className="py-6 pr-6 text-white/20 text-xs font-mono">#{u.id}</td>
                    <td className="py-6 pr-6">
                      <div className="text-sm font-bold group-hover:text-[#10b981] transition-colors tracking-tight">
                        {u.name} {u.surname}
                      </div>
                    </td>
                    <td className="py-6 pr-6 hidden sm:table-cell text-xs text-white/40 font-medium">
                      {u.age} y.o.
                    </td>
                    <td className="py-6 pr-6">
                      <span className="text-[10px] font-bold text-white/40 border border-white/10 px-2 py-1 rounded">
                        {u.promo_code}
                      </span>
                    </td>
                    <td className="py-6 text-white/30 text-xs text-right font-medium">
                      {new Date(u.created_at).toLocaleDateString('tg-TJ', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Minimalist Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center opacity-20">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase">Ravoni Infrastructure</p>
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase">2026</p>
        </footer>

        {/* Detail Modal - Clean Minimalist */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] flex items-center justify-center p-6"
            >
              <div 
                className="absolute inset-0 bg-black/90"
                onClick={() => setSelectedUser(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#0f1110] w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-10 border border-white/10 rounded-2xl shadow-2xl p-8 scrollbar-hide"
              >
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-[0.3em] mb-2">User Details</p>
                    <h2 className="text-3xl font-bold tracking-tight">{selectedUser.name} {selectedUser.surname}</h2>
                    <p className="text-white/30 text-xs mt-1">Status: <span className="text-[#10b981]">Professional</span> / Joined {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-white/20 hover:text-white transition-colors text-2xl p-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden mb-12">
                  <div className="bg-[#0f1110] p-6 text-center">
                    <p className="text-[9px] uppercase font-bold text-white/30 tracking-widest mb-2">Activity</p>
                    <p className="text-3xl font-bold">{calculateStreak(userAnswers)} <span className="text-sm font-medium text-white/20">streak</span></p>
                  </div>
                  <div className="bg-[#0f1110] p-6 text-center">
                    <p className="text-[9px] uppercase font-bold text-white/30 tracking-widest mb-2">Responses</p>
                    <p className="text-3xl font-bold">{userAnswers.length} <span className="text-sm font-medium text-white/20">total</span></p>
                  </div>
                </div>

                <div className="space-y-10">
                  {[1, 2, 3, 4, 5].map(day => {
                    const dayAnswers = userAnswers.filter(a => a.day_number === day);
                    if (dayAnswers.length === 0) return null;
                    return (
                      <div key={day}>
                        <div className="flex items-center gap-4 mb-4">
                          <p className="font-bold text-[10px] uppercase tracking-widest text-[#10b981]">Day 0{day}</p>
                          <div className="h-px flex-1 bg-white/5"></div>
                          <p className="text-[10px] text-white/20 font-medium">{new Date(dayAnswers[0].created_at).toLocaleDateString('tg-TJ')}</p>
                        </div>
                        <div className="space-y-3">
                          {dayAnswers.map((ans, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                              <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Question {ans.question_index + 1}</span>
                              <div className="flex items-center gap-3">
                                <div className="text-[10px] font-bold text-white/20 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Selected</div>
                                <span className="font-bold text-[#10b981] bg-[#10b981]/10 w-8 h-8 rounded flex items-center justify-center text-xs border border-[#10b981]/20">{ans.selected_option}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
