'use client';

import { useState, useEffect } from 'react';
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
  
  const [currentDay, setCurrentDay] = useState('day1');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ravoni_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep('APP');
    }
  }, []);

  const handlePromoSubmit = () => {
    if (promo.trim().toLowerCase() === 'тести равони') setStep('ONBOARDING');
    else alert('Промокод нодуруст аст!');
  };

  const handleOnboardingSubmit = async () => {
    if (!userData.name || !userData.age) return alert('Лутфан пур кунед');
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
      }
    } catch (e) { alert('Хатогӣ'); }
  };

  const isDayLocked = (dayNum: number) => {
    if (!user) return true;
    const regDate = new Date(user.created_at || Date.now());
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 3600 * 24));
    return dayNum > diffDays + 1;
  };

  const handleAnswer = (option: string) => {
    const newAnswers = { ...answers, [currentQuestionIdx]: option };
    setAnswers(newAnswers);
    fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id, dayNumber: parseInt(currentDay.replace('day', '')),
        questionIndex: currentQuestionIdx, selectedOption: option
      })
    });
    if (currentQuestionIdx < RAVONI_TESTS[currentDay].questions.length - 1) setCurrentQuestionIdx(prev => prev + 1);
    else calculateResult(newAnswers);
  };

  const calculateResult = (finalAnswers: Record<number, string>) => {
    const counts: Record<string, number> = { A: 0, Б: 0, В: 0, Г: 0 };
    Object.values(finalAnswers).forEach(val => { counts[val] = (counts[val] || 0) + 1; });
    const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    setResult(winner);
    setStep('RESULT');
  };

  const renderCourses = () => (
    <div className="p-8 animate-fade">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Марафон</h2>
        <p className="text-muted text-sm uppercase font-black tracking-widest opacity-40">5 Days of Diagnosis</p>
      </div>
      
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((d) => {
          const locked = isDayLocked(d);
          return (
            <div key={d} onClick={() => !locked && (setCurrentDay(`day${d}`), setStep('TEST'))} 
              className={`p-6 rounded-[32px] border-2 flex justify-between items-center transition-all ${locked ? 'opacity-40 bg-gray-50 border-transparent' : 'bg-white border-primary-soft shadow-sm hover:border-primary'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${locked ? 'bg-gray-200 text-gray-400' : 'bg-primary-soft text-primary'}`}>{d}</div>
                <div>
                  <p className={`font-bold ${locked ? 'text-gray-400' : 'text-text'}`}>Рӯзи {d}</p>
                  <p className="text-xs text-muted font-medium">{d === 1 ? 'Эҳсоси ботинӣ' : `Дарси рӯзи ${d}`}</p>
                </div>
              </div>
              <span className="text-xl">{locked ? '🔒' : '→'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-8 animate-fade text-center">
      <div className="w-24 h-24 bg-primary-soft rounded-[32px] mx-auto mb-6 flex items-center justify-center text-4xl">👤</div>
      <h2 className="text-3xl font-bold mb-2">{user?.name} {user?.surname}</h2>
      <p className="text-muted font-medium mb-8">Синну сол: {user?.age} • Статус: <span className="text-primary font-bold">PRO</span></p>
      
      <div className="text-left bg-bg p-8 rounded-[40px] border border-border shadow-inner">
        <h3 className="font-bold mb-4 text-lg">Натиҷаҳои охирин:</h3>
        <p className="text-sm opacity-60 leading-relaxed italic">Дар ин ҷо натиҷаҳои санҷишҳои гузаштаи шумо пайдо мешаванд. Аввал рӯзи аввалро гузаред!</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        
        {step === 'PROMO' && (
          <motion.div key="promo" className="p-10 flex flex-col gap-8 text-center justify-center min-h-screen">
            <h1 className="text-4xl font-black tracking-tighter text-primary">РАВОНИ</h1>
            <div className="flex flex-col gap-4">
               <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Промокодро ворид кунед</p>
               <input type="text" placeholder="Тести Равони" value={promo} onChange={(e) => setPromo(e.target.value)} className="text-center font-bold text-xl" />
            </div>
            <button className="btn-primary shadow-xl" onClick={handlePromoSubmit}>ВУРУД</button>
          </motion.div>
        )}

        {step === 'ONBOARDING' && (
          <motion.div key="onboarding" className="p-8 flex flex-col gap-5 justify-center min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-center">Маълумот</h2>
            <input placeholder="Ном" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
            <input placeholder="Насаб" value={userData.surname} onChange={(e) => setUserData({...userData, surname: e.target.value})} />
            <input type="number" placeholder="Синну сол" value={userData.age} onChange={(e) => setUserData({...userData, age: e.target.value})} />
            <select value={userData.maritalStatus} onChange={(e) => setUserData({...userData, maritalStatus: e.target.value})}>
              <option value="">Вазъи оилавӣ</option>
              <option value="single">Муҷаррад</option>
              <option value="married">Оиладор</option>
            </select>
            <button className="btn-primary mt-6 shadow-lg" onClick={handleOnboardingSubmit}>ОҒОЗ</button>
          </motion.div>
        )}

        {step === 'APP' && (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {activeTab === 'COURSES' ? renderCourses() : renderProfile()}
            
            <nav className="bottom-nav" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={`nav-item ${activeTab === 'COURSES' ? 'active' : ''}`} onClick={() => setActiveTab('COURSES')}>
                <div className="nav-icon">{activeTab === 'COURSES' ? '🧪' : '🧪'}</div>
                <span className="text-[12px] uppercase font-black">Тестҳо</span>
              </div>
              <div className={`nav-item ${activeTab === 'PROFILE' ? 'active' : ''}`} onClick={() => setActiveTab('PROFILE')}>
                <div className="nav-icon">{activeTab === 'PROFILE' ? '👤' : '👤'}</div>
                <span className="text-[12px] uppercase font-black">Профил</span>
              </div>
            </nav>
          </motion.div>
        )}

        {step === 'TEST' && (
          <motion.div key="test" className="p-8 flex flex-col gap-8 min-h-screen">
            <header className="flex justify-between items-center">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black">
                {currentQuestionIdx + 1}
              </div>
              <div className="h-2 flex-1 mx-6 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentQuestionIdx + 1) / 15) * 100}%` }}></div>
              </div>
              <span className="text-[10px] font-black opacity-40 uppercase">Day {currentDay.replace('day','')}</span>
            </header>
            <p className="text-2xl font-bold leading-tight text-primary">{RAVONI_TESTS[currentDay].questions[currentQuestionIdx].question}</p>
            <div className="flex flex-col gap-4 mt-4">
              {Object.entries(RAVONI_TESTS[currentDay].questions[currentQuestionIdx].options).map(([key, text]) => (
                <div key={key} onClick={() => handleAnswer(key)} className="question-btn" style={{ padding: '20px' }}>
                  <div className="letter" style={{ background: 'var(--primary)', color: 'white' }}>{key}</div>
                  <span className="text-[15px] font-bold opacity-80">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'RESULT' && result && (
          <motion.div key="result" className="p-8 text-center flex flex-col gap-6 justify-center min-h-screen">
            <div className="w-28 h-28 bg-primary text-white rounded-[40px] flex items-center justify-center mx-auto text-5xl font-black shadow-2xl rotate-3">{result}</div>
            <h2 className="text-3xl font-black mt-4">{RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].title}</h2>
            <div className="p-8 bg-bg rounded-[40px] text-left border border-border italic text-sm leading-relaxed shadow-inner">
              {RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].description}
            </div>
            <button className="btn-primary mt-8 shadow-xl" onClick={() => {setStep('APP'); setActiveTab('COURSES'); setCurrentQuestionIdx(0);}}>БАРГАШТАН</button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
