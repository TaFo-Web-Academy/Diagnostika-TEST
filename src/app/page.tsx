'use client';

import { useState, useEffect, useCallback } from 'react';
import { RAVONI_TESTS, RESULTS_INTERPRETATION } from '@/data/questions';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'COURSES' | 'PROFILE';
type Step = 'PROMO' | 'ONBOARDING' | 'APP' | 'TEST' | 'RESULT';

export default function Home() {
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  
  const [activeTab, setActiveTab] = useState<Tab>('COURSES');
  const [step, setStep] = useState<Step>('PROMO');
  const [promo, setPromo] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState({ name: '', surname: '', age: '', maritalStatus: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentDay, setCurrentDay] = useState('day1');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [showNav, setShowNav] = useState(true);

  const fetchUserAnswers = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/answers?userId=${userId}`);
      const data = await res.json();
      if (data.answers) {
        setUserAnswers(data.answers);
        
        // Определяем пройденные дни
        const completed = [1, 2, 3, 4, 5].filter(day => {
          const dayQuestionsCount = RAVONI_TESTS[`day${day}`].questions.length;
          const userDayAnswersCount = data.answers.filter((a: any) => a.day_number === day).length;
          return userDayAnswersCount >= dayQuestionsCount;
        });
        setCompletedDays(completed);
      }
    } catch (e) {
      console.error('Error fetching answers:', e);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('ravoni_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setStep('APP');
      fetchUserAnswers(parsedUser.id);
    }
  }, [fetchUserAnswers]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activeTab === 'PROFILE' && user) {
      fetchUserAnswers(user.id);
    }
  }, [activeTab, user, fetchUserAnswers]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }, []);

  const handlePromoSubmit = async () => {
    if (!promo.trim()) {
      setError('Илтимос промокодро ворид кунед');
      return;
    }
    
    if (promo.trim() === '99') {
      setError(null);
      setStep('ONBOARDING');
    } else {
      setError('Промокод нодуруст аст!');
      showToast('Промокод нодуруст аст', 'error');
    }
  };

  const handleOnboardingSubmit = async () => {
    if (!userData.name || !userData.age) {
      showToast('Лутфан, ба ҳамаи майдонҳо таълиқ диҳед', 'warning');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, promoCode: promo })
      });
      const data = await res.json();
      
      if (data.user) {
        localStorage.setItem('ravoni_user', JSON.stringify(data.user));
        setUser(data.user);
        setStep('APP');
        showToast('Ба муваффақият расонед!', 'success');
      } else {
        throw new Error(data.error || 'Хатогӣ дар сабт');
      }
    } catch (e: any) {
      setError(e.message || 'Хатогӣ');
      showToast(e.message || 'Хатогӣ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isDayLocked = useCallback((dayNum: number) => {
    if (!user) return true;
    const regDate = new Date(user.created_at || Date.now());
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 3600 * 24));
    return dayNum > diffDays + 1;
  }, [user]);

  const handleAnswer = useCallback((option: string) => {
    const newAnswers = { ...answers, [currentQuestionIdx]: option };
    setAnswers(newAnswers);
    
    fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        dayNumber: parseInt(currentDay.replace('day', '')),
        questionIndex: currentQuestionIdx,
        selectedOption: option
      })
    }).catch(() => {});
    
    if (currentQuestionIdx < RAVONI_TESTS[currentDay].questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      calculateResult(newAnswers);
    }
  }, [answers, currentQuestionIdx, currentDay, user]);

  const calculateResult = useCallback((finalAnswers: Record<number, string>) => {
    const counts: Record<string, number> = { A: 0, Б: 0, В: 0, Г: 0 };
    Object.values(finalAnswers).forEach(val => { 
      counts[val] = (counts[val] || 0) + 1; 
    });
    const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    setResult(winner);
    setStep('RESULT');
    if (user) fetchUserAnswers(user.id); // Обновляем прогресс
  }, [user, fetchUserAnswers]);

  const renderCourses = () => (
    <div className="p-6 md:p-8 animate-fade">
      <div className="mb-10 mt-4">
        <h2 className="text-4xl font-black text-gradient mb-1">
          Марафон
        </h2>
        <p className="text-primary text-xs uppercase font-bold tracking-[0.2em]">
          5 Рӯзи Шиноҳӣ
        </p>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((d) => {
          const locked = isDayLocked(d);
          const completed = completedDays.includes(d);
          return (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d * 0.1 }}
              onClick={() => !locked && (setCurrentDay(`day${d}`), setStep('TEST'))}
              className={`day-card ${locked ? 'locked' : ''} ${completed ? 'completed border-primary/50' : ''}`}
            >
              <div className={`day-number ${completed ? 'bg-primary text-primary-text' : ''}`}>
                {completed ? '✅' : (locked ? '🔒' : d)}
              </div>
              <div className="flex-1">
                <p className={`font-bold text-lg ${locked ? 'text-dim' : 'text-text'}`}>
                  Рӯзи {d} {completed && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">ТАМОМ</span>}
                </p>
                <p className="text-xs text-muted font-medium">
                  {d === 1 ? 'Эҳсоси ботинӣ' : `Дарси рӯзи ${d}`}
                </p>
              </div>
              {!locked && !completed && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  →
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 glass-card border-primary/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl">
            ✨
          </div>
          <div>
            <p className="font-bold text-primary">Мақсади марафон</p>
            <p className="text-xs text-muted leading-relaxed">
              Бо муҳлати 5 рӯзӣ бо худра боҳиш диҳед ва ҳолати эмотсионалӣ худро шиноҳ кунед.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const getDayResult = (dayNum: number) => {
    const dayAnswers = userAnswers.filter(a => a.day_number === dayNum);
    if (dayAnswers.length === 0) return null;
    
    const counts: Record<string, number> = { A: 0, Б: 0, В: 0, Г: 0 };
    dayAnswers.forEach(ans => {
      counts[ans.selected_option] = (counts[ans.selected_option] || 0) + 1;
    });
    
    // Берем дату последнего ответа в этом дне
    const lastAnswerDate = new Date(Math.max(...dayAnswers.map(a => new Date(a.created_at).getTime())));
    
    return {
      key: Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b),
      date: lastAnswerDate
    };
  };

  const getNextDayCountdown = (dayNum: number) => {
    if (!user) return null;
    const regDate = new Date(user.created_at);
    const targetDate = new Date(regDate.getTime() + (dayNum - 1) * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}с ${mins}д`;
  };

  const renderProfile = () => (
    <div className="p-6 md:p-8 animate-fade">
      <div className="text-center mb-10 mt-6">
        <div className="w-24 h-24 bg-primary/10 rounded-[32px] mx-auto mb-4 flex items-center justify-center text-4xl shadow-2xl border border-primary/20">
          👤
        </div>
        <h2 className="text-3xl font-black text-gradient">{user?.name} {user?.surname}</h2>
        <div className="flex justify-center gap-2 mt-2">
          <span className="stat-pill">Синну сол: {user?.age}</span>
          <span className="stat-pill bg-primary text-primary-text">PRO</span>
        </div>
      </div>
      
      <div className="glass-card mb-6">
        <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
          📊 Натиҷаҳои охирин
        </h3>
        
        {completedDays.length === 0 ? (
          <p className="text-xs text-muted leading-relaxed italic">
            Дар ин ҷо натиҷаҳои санҷишҳои гузаштаи шумо пайдо мешаванд. Аввал рӯзи аввалро гузаред...
          </p>
        ) : (
          <div className="space-y-4">
            {completedDays.map(dayNum => {
              const res = getDayResult(dayNum);
              if (!res) return null;
              const interpretation = RAVONI_TESTS[`day${dayNum}`].interpretations[res.key];
              return (
                <div key={dayNum} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase">Рӯзи {dayNum}</span>
                      <span className="text-[9px] text-white/30 font-bold uppercase mt-0.5">
                        {res.date.toLocaleDateString('tg-TJ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-primary text-primary-text flex items-center justify-center text-xs font-bold">{res.key}</span>
                  </div>
                  <p className="font-bold text-sm mb-1">{interpretation?.title || 'Натиҷа'}</p>
                  <p className="text-[10px] text-muted line-clamp-2">{interpretation?.description || 'Ташаккур барои гузаштан'}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card mb-6 flex items-center justify-between border-primary/30">
        <div>
          <p className="text-xs text-muted uppercase font-bold tracking-widest">Прогресс</p>
          <p className="text-2xl font-black text-primary">{5 - completedDays.length} Рӯз боқӣ монд</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center font-black text-primary">
          {completedDays.length}/5
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-4">Нақшаи марафон</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((d) => {
            const locked = isDayLocked(d);
            const completed = completedDays.includes(d);
            return (
              <div key={d} className={`flex items-center justify-between p-3 rounded-2xl ${completed ? 'bg-primary/20 border border-primary/30' : (locked ? 'bg-white/5' : 'bg-primary/5')}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${completed ? 'bg-primary text-primary-text' : (locked ? 'bg-white/10 text-dim' : 'bg-primary/20 text-primary')}`}>
                    {completed ? '✓' : d}
                  </div>
                  <span className={`text-xs font-medium ${locked ? 'text-dim' : 'text-text'}`}>
                    Рӯзи {d}: {d === 1 ? 'Эҳсоси ботинӣ' : `Дарси рӯзи ${d}`}
                  </span>
                </div>
                {completed ? (
                  <span className="text-[10px] font-black text-primary uppercase">Completed</span>
                ) : (
                  locked ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs opacity-30 mb-0.5">🔒</span>
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
                        Боз мешавад: {getNextDayCountdown(d)}
                      </span>
                    </div>
                  ) : <span className="text-[10px] font-black text-primary uppercase">Active</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`app-container ${step === 'APP' ? '' : 'full-width'}`}>
      <AnimatePresence mode="wait">
        
        {step === 'PROMO' && (
          <motion.div
            key="promo"
            className="p-4 md:p-10 flex flex-col gap-6 justify-center min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-6xl font-black tracking-tighter text-gradient mb-4">
                РАВОНИ
              </h1>
              <p className="text-muted text-sm px-10">
                Платформаи психологӣ барои шиноҳкунии ҳолати эмотсионалӣ
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto w-full px-4"
            >
              <div className="glass-card mb-6">
                <p className="text-sm text-muted text-center mb-6">
                  Барои истифода аз марафон, промокодро ворид кунед
                </p>
                <div className="input-group">
                  <label>Промокод</label>
                  <input
                    type="text"
                    placeholder="Ворид кунед"
                    value={promo}
                    onChange={(e) => {
                      setPromo(e.target.value);
                      setError(null);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handlePromoSubmit()}
                    className={error ? 'border-danger' : ''}
                  />
                </div>
                {error && (
                  <p className="text-danger text-xs mt-2 mb-4 animate-fade text-center">
                    ⚠ {error}
                  </p>
                )}
                <button
                  className="btn btn-primary mt-4 shadow-2xl"
                  onClick={handlePromoSubmit}
                >
                  ВУРУД
                </button>
              </div>

              <div className="text-center opacity-40">
                <p className="text-[10px] uppercase font-bold tracking-widest">
                  RAVONI PLATFORM
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === 'ONBOARDING' && (
          <motion.div
            key="onboarding"
            className="p-4 md:p-8 flex flex-col gap-4 justify-center min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Маълумоти шумо</h2>
              <p className="text-muted text-center text-sm mb-6">
                Лутфан, баъзе лаҳзаҳои худро бо моҳкамӣ диҳед
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card mx-4"
            >
              <div className="space-y-5">
                <div className="input-group">
                  <label>Ном</label>
                  <input
                    type="text"
                    placeholder="Номи шумо"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Насаб</label>
                  <input
                    type="text"
                    placeholder="Насаби шумо"
                    value={userData.surname}
                    onChange={(e) => setUserData({ ...userData, surname: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Синну сол</label>
                  <input
                    type="number"
                    placeholder="Син"
                    value={userData.age}
                    onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Вазъи оилавӣ</label>
                  <select
                    value={userData.maritalStatus}
                    onChange={(e) => setUserData({ ...userData, maritalStatus: e.target.value })}
                  >
                    <option value="">Интихоб кунед</option>
                    <option value="single">Муҷаррад</option>
                    <option value="married">Оиладор</option>
                  </select>
                </div>
              </div>

              <button
                className={`btn btn-primary mt-8 ${loading ? 'opacity-50' : ''}`}
                onClick={handleOnboardingSubmit}
                disabled={loading}
              >
                {loading ? 'Иҷро шуда истодааст...' : 'ОҒОЗ'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === 'APP' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            {activeTab === 'COURSES' ? renderCourses() : renderProfile()}

            <nav className={`bottom-nav ${showNav ? 'translate-y-0' : 'translate-y-[120%]'}`}>
              <div
                className={`nav-item ${activeTab === 'COURSES' ? 'active' : ''}`}
                onClick={() => setActiveTab('COURSES')}
              >
                <div className="nav-icon">🧪</div>
                <span>Тестҳо</span>
              </div>
              <div
                className={`nav-item ${activeTab === 'PROFILE' ? 'active' : ''}`}
                onClick={() => setActiveTab('PROFILE')}
              >
                <div className="nav-icon">👤</div>
                <span>Профил</span>
              </div>
            </nav>
          </motion.div>
        )}

        {step === 'TEST' && (
          <motion.div
            key="test"
            className="p-4 md:p-8 flex flex-col gap-6 min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    if (currentQuestionIdx > 0) {
                      setCurrentQuestionIdx(prev => prev - 1);
                    } else {
                      setStep('APP');
                    }
                  }}
                  className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest hover:text-primary transition-colors"
                >
                  ← {currentQuestionIdx > 0 ? 'Қафо' : 'Бекор кардан'}
                </button>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  Рӯзи {currentDay.replace('day', '')}
                </span>
                <span className="text-[10px] font-bold text-muted uppercase">
                  {currentQuestionIdx + 1} аз {RAVONI_TESTS[currentDay].questions.length}
                </span>
              </div>
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${((currentQuestionIdx + 1) / RAVONI_TESTS[currentDay].questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </header>

            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-tight mb-8 text-gradient">
                {RAVONI_TESTS[currentDay].questions[currentQuestionIdx].question}
              </h2>

              <div className="space-y-3">
                {Object.entries(RAVONI_TESTS[currentDay].questions[currentQuestionIdx].options).map(
                  ([key, text]) => (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      key={key}
                      onClick={() => handleAnswer(key)}
                      className={`question-btn ${
                        answers[currentQuestionIdx] === key ? 'selected' : ''
                      }`}
                    >
                      <div className="letter">{key}</div>
                      <span className="text-sm font-medium leading-relaxed">{text}</span>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'RESULT' && result && (
          <motion.div
            key="result"
            className="p-6 md:p-10 text-center flex flex-col gap-8 justify-center min-h-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-28 h-28 md:w-32 md:h-32 bg-primary text-primary-text rounded-[38px] flex items-center justify-center mx-auto text-5xl md:text-6xl font-black shadow-[0_0_50px_rgba(16,185,129,0.4)]"
            >
              {result}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-gradient leading-tight">
                {RAVONI_TESTS[currentDay].interpretations[result]?.title}
              </h2>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card text-left border-primary/20"
            >
              <p className="text-sm md:text-base leading-relaxed text-muted italic">
                {RAVONI_TESTS[currentDay].interpretations[result]?.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <button
                className="btn btn-primary shadow-2xl"
                onClick={() => {
                  setStep('APP');
                  setActiveTab('COURSES');
                  setCurrentQuestionIdx(0);
                  setAnswers({});
                  setResult(null);
                }}
              >
                БАРГАШТАН БА АСОСӢ
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
