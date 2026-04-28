'use client';

import { useState, useEffect, useCallback } from 'react';
import { RAVONI_TESTS, RESULTS_INTERPRETATION } from '@/data/questions';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'COURSES' | 'PROFILE';
type Step = 'PROMO' | 'ONBOARDING' | 'APP' | 'TEST' | 'RESULT';

export default function Home() {
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

  useEffect(() => {
    const savedUser = localStorage.getItem('ravoni_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep('APP');
    }
  }, []);

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
    
    if (promo.trim().toLowerCase() === 'тести равони') {
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
  }, []);

  const renderCourses = () => (
    <div className="p-4 md:p-8 animate-fade">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-primary mb-2">
          Марафон
        </h2>
        <p className="text-muted text-sm md:text-base uppercase font-black tracking-widest opacity-40">
          5 Рӯзи Шиноҳӣ
        </p>
      </div>
      
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((d) => {
          const locked = isDayLocked(d);
          return (
            <motion.div
              key={d}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: d * 0.1 }}
            >
              <div
                onClick={() => !locked && (setCurrentDay(`day${d}`), setStep('TEST'))}
                className={`p-5 md:p-6 rounded-[28px] border-2 flex justify-between items-center transition-all cursor-pointer group ${
                  locked 
                    ? 'opacity-40 bg-gray-50 border-transparent cursor-not-allowed' 
                    : 'bg-white border-primary-soft shadow-sm hover:border-primary hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl transition-all ${
                    locked 
                      ? 'bg-gray-200 text-gray-400' 
                      : 'bg-primary-soft text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    {d}
                  </div>
                  <div>
                    <p className={`font-bold text-base md:text-lg ${
                      locked ? 'text-gray-400' : 'text-text'
                    }`}>
                      Рӯзи {d}
                    </p>
                    <p className="text-xs md:text-sm text-muted font-medium">
                      {d === 1 ? 'Эҳсоси ботинӣ' : `Дарси рӯзи ${d}`}
                    </p>
                  </div>
                </div>
                <span className="text-xl md:text-2xl transition-transform group-hover:translate-x-1">
                  {locked ? '🔒' : '→'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 md:p-6 bg-gradient rounded-2xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            🎓
          </div>
          <div>
            <p className="font-bold text-lg">Мақсади марафон</p>
            <p className="text-sm opacity-80">
              Бо муҳлати 5 рӯзӣ бо худра боҳиш диҳед ва ҳолати эмотсионалӣ худро шиноҳ кунед
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 md:p-8 animate-fade">
      <div className="text-center mb-8">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-soft rounded-[32px] mx-auto mb-4 flex items-center justify-center text-3xl md:text-4xl shadow-md">
          👤
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{user?.name} {user?.surname}</h2>
        <p className="text-muted font-medium">
          Синну сол: {user?.age} • <span className="text-primary font-bold">PRO</span>
        </p>
      </div>
      
      <div className="card mb-6">
        <div className="card-header">Натиҷаҳои охирин</div>
        <p className="text-sm text-muted leading-relaxed italic">
          Дар ин ҷо натиҷаҳои санҷишҳои гузаштаи шумо пайдо мешаванд. Аввал рӯзи аввалро гузаред,
          барои дидани натиҷаҳои ҳисобот ва таҳлили ҳолати худ.
        </p>
      </div>

      <div className="stats-card mb-6">
        <div className="stat-value">5</div>
        <div className="stat-label">Рӯзи ба поёнтон</div>
      </div>

      <div className="card">
        <div className="card-header">Пешниҳоди рӯзона</div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((d) => {
            const locked = isDayLocked(d);
            return (
              <div
                key={d}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  locked ? 'bg-gray-50' : 'bg-primary-soft/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    locked ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white'
                  }`}>
                    {d}
                  </div>
                  <span className={`text-sm ${
                    locked ? 'text-gray-400' : 'text-text'
                  }`}>
                    Рӯзи {d}: {d === 1 ? 'Эҳсоси ботинӣ' : `Дарси рӯзи ${d}`}
                  </span>
                </div>
                {locked ? (
                  <span className="text-gray-400">🔒</span>
                ) : (
                  <span className="text-primary text-sm font-bold">Доступ</span>
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
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary mb-4">
                РАВОНИ
              </h1>
              <p className="text-muted text-sm md:text-base mb-8">
                Платформаи психологӣ барои шиноҳкунии ҳолати эмотсионалӣ
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto w-full"
            >
              <div className="card mb-4">
                <p className="text-sm text-muted text-center mb-4">
                  Барои истифода аз марафон, промокодро ворид кунед
                </p>
                <div className="input-group mb-4">
                  <input
                    type="text"
                    placeholder=" "
                    value={promo}
                    onChange={(e) => {
                      setPromo(e.target.value);
                      setError(null);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handlePromoSubmit()}
                    className={error ? 'border-danger' : ''}
                  />
                  <label>Промокод</label>
                </div>
                {error && (
                  <p className="text-danger text-sm mb-4 animate-fade">
                    ⚠ {error}
                  </p>
                )}
                <button
                  className="btn btn-primary btn-full shadow-lg"
                  onClick={handlePromoSubmit}
                >
                  ВУРУД
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted">
                  Промокод намоӣ: <span className="font-bold text-primary">Тести Равони</span>
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
              className="card"
            >
              <div className="space-y-4">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder=" "
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  />
                  <label>Ном</label>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder=" "
                    value={userData.surname}
                    onChange={(e) => setUserData({ ...userData, surname: e.target.value })}
                  />
                  <label>Насаб</label>
                </div>

                <div className="input-group">
                  <input
                    type="number"
                    placeholder=" "
                    value={userData.age}
                    onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                  />
                  <label>Синну сол</label>
                </div>

                <div className="input-group">
                  <select
                    value={userData.maritalStatus}
                    onChange={(e) => setUserData({ ...userData, maritalStatus: e.target.value })}
                  >
                    <option value="">Вазъи оилавӣ</option>
                    <option value="single">Муҷаррад</option>
                    <option value="married">Оиладор</option>
                  </select>
                  <label>Вазъи оилавӣ</label>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                className={`btn btn-primary btn-full shadow-lg ${
                  loading ? 'btn-loading' : ''
                }`}
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
          >
            {activeTab === 'COURSES' ? renderCourses() : renderProfile()}

            <nav
              className={`bottom-nav ${
                showNav ? 'translate-y-0' : 'translate-y-full'
              }`}
              style={{
                gridTemplateColumns: activeTab === 'COURSES' ? '1fr 1fr' : '1fr 1fr',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
              }}
            >
              <div
                className={`nav-item ${
                  activeTab === 'COURSES' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('COURSES')}
              >
                <div className="nav-icon">
                  {activeTab === 'COURSES' ? '🧪' : '🧪'}
                </div>
                <span className="text-[11px] md:text-[12px] uppercase font-black tracking-wide">
                  Тестҳо
                </span>
              </div>
              <div
                className={`nav-item ${
                  activeTab === 'PROFILE' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('PROFILE')}
              >
                <div className="nav-icon">
                  {activeTab === 'PROFILE' ? '👤' : '👤'}
                </div>
                <span className="text-[11px] md:text-[12px] uppercase font-black tracking-wide">
                  Профил
                </span>
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
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-base">
                {currentQuestionIdx + 1}
              </div>
              <div className="flex-1 min-w-32 mx-2 md:mx-6 bg-gray-100 rounded-full overflow-hidden h-2 md:h-3">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${((currentQuestionIdx + 1) / RAVONI_TESTS[currentDay].questions.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-[10px] md:text-xs font-black opacity-40 uppercase whitespace-nowrap">
                Рӯзи {currentDay.replace('day', '')}
              </span>
            </header>

            <div className="flex-1">
              <p className="text-lg md:text-2xl font-bold leading-tight text-primary mb-2">
                {RAVONI_TESTS[currentDay].questions[currentQuestionIdx].question}
              </p>
              <p className="text-xs md:text-sm text-muted mb-6">
                {currentQuestionIdx + 1} аз {RAVONI_TESTS[currentDay].questions.length}
              </p>

              <div className="flex flex-col gap-3 md:gap-4 mt-6">
                {Object.entries(RAVONI_TESTS[currentDay].questions[currentQuestionIdx].options).map(
                  ([key, text]) => (
                    <div
                      key={key}
                      onClick={() => handleAnswer(key)}
                      className={`question-btn ${
                        answers[currentQuestionIdx] === key ? 'selected' : ''
                      }`}
                    >
                      <div
                        className="letter"
                        style={{
                          background: answers[currentQuestionIdx] === key ? 'var(--primary)' : '',
                          color: answers[currentQuestionIdx] === key ? 'white' : '',
                        }}
                      >
                        {key}
                      </div>
                      <span className="question-text">{text}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'RESULT' && result && (
          <motion.div
            key="result"
            className="p-4 md:p-8 text-center flex flex-col gap-6 justify-center min-h-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-24 h-24 md:w-32 md:h-32 bg-primary text-white rounded-[40px] flex items-center justify-center mx-auto text-4xl md:text-6xl font-black shadow-2xl"
            >
              {result}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-black mt-4 text-primary">
                {RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].title}
              </h2>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card text-left"
            >
              <p className="text-sm md:text-base leading-relaxed italic text-muted">
                {RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].description}
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                className="btn btn-primary btn-full shadow-lg"
                onClick={() => {
                  setStep('APP');
                  setActiveTab('COURSES');
                  setCurrentQuestionIdx(0);
                  setAnswers({});
                  setResult(null);
                }}
              >
                БАРГАШТАН
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
