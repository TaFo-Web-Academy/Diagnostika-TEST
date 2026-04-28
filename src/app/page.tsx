'use client';

import { useState, useEffect } from 'react';
import { RAVONI_TESTS, RESULTS_INTERPRETATION } from '@/data/questions';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'PROMO' | 'ONBOARDING' | 'DAYS' | 'TEST' | 'RESULT';

export default function Home() {
  const [step, setStep] = useState<Step>('PROMO');
  const [promo, setPromo] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    age: '',
    maritalStatus: '',
    gender: '',
    interest: ''
  });
  
  const [currentDay, setCurrentDay] = useState('day1');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ravoni_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep('DAYS');
    }
  }, []);

  const handlePromoSubmit = () => {
    if (promo.trim().toLowerCase() === 'тести равони') {
      setStep('ONBOARDING');
    } else {
      alert('Промокод нодуруст аст!');
    }
  };

  const handleOnboardingSubmit = async () => {
    if (!userData.name || !userData.age) {
      alert('Лутфан ҳамаи маълумотро пур кунед');
      return;
    }
    setIsSaving(true);
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
        setStep('DAYS');
      }
    } catch (e) {
      alert('Хатогии техникӣ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = async (option: string) => {
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
    });
    if (currentQuestionIdx < RAVONI_TESTS[currentDay].questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: Record<number, string>) => {
    const counts: Record<string, number> = { A: 0, Б: 0, В: 0, Г: 0 };
    Object.values(finalAnswers).forEach(val => { counts[val] = (counts[val] || 0) + 1; });
    const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    setResult(winner);
    setStep('RESULT');
  };

  const isDayLocked = (dayNum: number) => {
    if (!user) return true;
    const regDate = new Date(user.created_at || Date.now());
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 3600 * 24));
    return dayNum > diffDays + 1;
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        
        {step === 'PROMO' && (
          <motion.div key="promo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 flex flex-col gap-6">
            <div className="text-center py-6">
              <h1 className="text-3xl mb-1 tracking-tight">РАВОНИ</h1>
              <p className="text-muted text-sm font-medium uppercase tracking-widest">Psychology Platform</p>
            </div>
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Промокодро ворид кунед" value={promo} onChange={(e) => setPromo(e.target.value)} className="text-center font-bold" />
              <button className="btn-primary shadow-lg" onClick={handlePromoSubmit}>ВУРУД</button>
            </div>
          </motion.div>
        )}

        {step === 'ONBOARDING' && (
          <motion.div key="onboarding" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-8 flex flex-col gap-5">
            <h2 className="text-2xl mb-2 text-center">Салом! 😊</h2>
            <p className="text-center text-muted text-sm mb-4">Лутфан маълумоти худро ворид кунед, то ташхисро оғоз кунем.</p>
            <input placeholder="Ном" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
            <input placeholder="Насаб" value={userData.surname} onChange={(e) => setUserData({...userData, surname: e.target.value})} />
            <input type="number" placeholder="Синну сол" value={userData.age} onChange={(e) => setUserData({...userData, age: e.target.value})} />
            <select value={userData.maritalStatus} onChange={(e) => setUserData({...userData, maritalStatus: e.target.value})}>
              <option value="">Вазъи оилавӣ</option>
              <option value="single">Муҷаррад</option>
              <option value="married">Оиладор</option>
            </select>
            <button className="btn-primary mt-4" onClick={handleOnboardingSubmit} disabled={isSaving}>
              {isSaving ? 'САБТ...' : 'ОҒОЗИ МАРАФОН'}
            </button>
          </motion.div>
        )}

        {step === 'DAYS' && (
          <motion.div key="days" className="p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl leading-tight">Марафон</h2>
                <p className="text-xs text-muted font-bold uppercase">5 Рӯзи Ташхис</p>
              </div>
              <div className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-black tracking-tighter">PRO</div>
            </div>

            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((d) => {
                const locked = isDayLocked(d);
                return (
                  <motion.div 
                    whileHover={!locked ? { scale: 1.02 } : {}}
                    key={d} 
                    onClick={() => !locked && (setCurrentDay(`day${d}`), setStep('TEST'))} 
                    className={`group p-6 rounded-[24px] border-2 flex justify-between items-center transition-all ${
                      locked ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-primary-soft shadow-sm hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${locked ? 'bg-gray-200 text-gray-400' : 'bg-primary-soft text-primary'}`}>
                        {d}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold ${locked ? 'text-gray-400' : 'text-text'}`}>Рӯзи {d}</span>
                        <span className="text-xs text-muted">{d === 1 ? 'Эҳсоси ботинӣ' : `Дарси рӯзи ${d}`}</span>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${locked ? 'bg-transparent' : 'bg-bg group-hover:bg-primary group-hover:text-white'}`}>
                      {locked ? '🔒' : '→'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'TEST' && (
          <motion.div key="test" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">РӮЗИ {currentDay.replace('day','')}</span>
                <h3 className="text-lg font-bold">Саволи {currentQuestionIdx + 1}/15</h3>
              </div>
              <div className="h-2 w-20 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${((currentQuestionIdx + 1) / 15) * 100}%` }}></div>
              </div>
            </div>
            <p className="text-lg font-medium leading-relaxed">{RAVONI_TESTS[currentDay].questions[currentQuestionIdx].question}</p>
            <div className="flex flex-col gap-3 mt-2">
              {Object.entries(RAVONI_TESTS[currentDay].questions[currentQuestionIdx].options).map(([key, text]) => (
                <button key={key} onClick={() => handleAnswer(key)} className="p-5 text-left border-2 border-border rounded-2xl hover:border-primary hover:bg-primary-soft transition-all flex gap-4 items-center group">
                  <span className="w-8 h-8 rounded-full bg-bg flex items-center justify-center font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">{key}</span>
                  <span className="flex-1 text-sm font-medium">{text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'RESULT' && result && (
          <motion.div key="result" className="p-8 flex flex-col gap-6 text-center">
             <div className="py-4">
                <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-4xl font-black shadow-xl mb-4">
                  {result}
                </div>
                <h2 className="text-2xl font-bold">{RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].title}</h2>
             </div>
            <div className="p-6 bg-bg rounded-[32px] text-left border border-border shadow-inner">
              <p className="text-sm italic leading-relaxed opacity-80">{RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].description}</p>
            </div>
            <button className="btn-primary mt-4 shadow-lg" onClick={() => (setCurrentQuestionIdx(0), setAnswers({}), setStep('DAYS'))}>БА САҲИФАИ АСОСӢ</button>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        .bg-accent { background-color: var(--accent); }
        .text-text { color: var(--text); }
      `}</style>
    </div>
  );
}
