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

  // При загрузке проверяем, есть ли пользователь в localStorage
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
      alert('Хатогии техникӣ ҳангоми сабт');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = async (option: string) => {
    const newAnswers = { ...answers, [currentQuestionIdx]: option };
    setAnswers(newAnswers);

    // Сохраняем в базу (фоном)
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
    Object.values(finalAnswers).forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });
    const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    setResult(winner);
    setStep('RESULT');
  };

  // Проверка: какой день открыт (по дате регистрации)
  const isDayLocked = (dayNum: number) => {
    if (!user) return true;
    const regDate = new Date(user.created_at || Date.now());
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 3600 * 24));
    return dayNum > diffDays + 1; // День 1 (diff=0), День 2 (diff=1) и т.д.
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        
        {step === 'PROMO' && (
          <motion.div key="promo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 flex flex-col gap-6">
            <div className="text-center mb-4">
              <h1 className="text-3xl mb-2">РАВОНИ</h1>
              <p className="text-muted">Платформаи психологӣ</p>
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold opacity-70">ПРОМОКОДРО ВОРИД КУНЕД:</label>
              <input type="text" placeholder="Масалан: Тести Равони" value={promo} onChange={(e) => setPromo(e.target.value)} />
              <button className="btn-primary" onClick={handlePromoSubmit}>ВУРУД</button>
            </div>
          </motion.div>
        )}

        {step === 'ONBOARDING' && (
          <motion.div key="onboarding" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="p-8 flex flex-col gap-5">
            <h2 className="text-2xl mb-4">Маълумоти аввалия</h2>
            <input placeholder="Ном" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
            <input placeholder="Насаб" value={userData.surname} onChange={(e) => setUserData({...userData, surname: e.target.value})} />
            <input type="number" placeholder="Синну сол" value={userData.age} onChange={(e) => setUserData({...userData, age: e.target.value})} />
            <select className="w-full p-4 border-2 border-border rounded-2xl bg-bg outline-none" value={userData.maritalStatus} onChange={(e) => setUserData({...userData, maritalStatus: e.target.value})}>
              <option value="">Вазъи оилавӣ</option>
              <option value="single">Муҷаррад</option>
              <option value="married">Оиладор</option>
            </select>
            <button className="btn-primary mt-4" onClick={handleOnboardingSubmit} disabled={isSaving}>
              {isSaving ? 'САБТ...' : 'ДАВОМ ДОДАН'}
            </button>
          </motion.div>
        )}

        {step === 'DAYS' && (
          <motion.div key="days" className="p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">Марафон</h2>
              <span className="text-xs bg-primary-soft text-primary px-3 py-1 rounded-full font-bold">PRO</span>
            </div>
            {[1, 2, 3, 4, 5].map((d) => {
              const locked = isDayLocked(d);
              return (
                <div key={d} onClick={() => !locked && (setCurrentDay(`day${d}`), setStep('TEST'))} 
                  className={`p-6 rounded-2xl border-2 flex justify-between items-center cursor-pointer transition-all ${
                    locked ? 'opacity-40 bg-gray-50 border-transparent' : 'border-primary-soft bg-white hover:border-primary shadow-sm'
                  }`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold opacity-50 uppercase">Рӯзи {d}</span>
                    <span className="font-semibold">{d === 1 ? 'Эҳсоси ботинӣ' : `Дарси рӯзи ${d}`}</span>
                  </div>
                  <span>{locked ? '🔒' : '→'}</span>
                </div>
              );
            })}
          </motion.div>
        )}

        {step === 'TEST' && (
          <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-primary opacity-60 uppercase">РӮЗИ {currentDay.replace('day','')} • САВОЛИ {currentQuestionIdx + 1}/15</span>
              <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${((currentQuestionIdx + 1) / 15) * 100}%` }}></div>
              </div>
            </div>
            <h3 className="text-xl leading-snug min-h-[80px]">{RAVONI_TESTS[currentDay].questions[currentQuestionIdx].question}</h3>
            <div className="flex flex-col gap-3">
              {Object.entries(RAVONI_TESTS[currentDay].questions[currentQuestionIdx].options).map(([key, text]) => (
                <button key={key} onClick={() => handleAnswer(key)} className="p-5 text-left border-2 border-border rounded-2xl hover:border-primary hover:bg-primary-soft transition-all flex gap-4 items-center group">
                  <span className="w-8 h-8 rounded-full bg-bg flex items-center justify-center font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors">{key}</span>
                  <span className="flex-1 font-medium">{text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'RESULT' && result && (
          <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 flex flex-col gap-6 text-center">
            <div className="w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl text-primary font-bold">{result}</span>
            </div>
            <h2 className="text-2xl">{RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].title}</h2>
            <div className="p-6 bg-bg rounded-3xl text-left border border-border">
              <p className="text-sm italic leading-relaxed opacity-80">{RESULTS_INTERPRETATION[result as keyof typeof RESULTS_INTERPRETATION].description}</p>
            </div>
            <button className="btn-primary mt-4" onClick={() => (setCurrentQuestionIdx(0), setAnswers({}), setStep('DAYS'))}>БА САҲИФАИ АСОСӢ</button>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        .text-muted { color: var(--text-muted); }
        .bg-bg { background-color: var(--bg); }
        .border-border { border-color: var(--border); }
        .text-primary { color: var(--primary); }
        .bg-primary { background-color: var(--primary); }
        .bg-primary-soft { background-color: var(--primary-soft); }
        .border-primary { border-color: var(--primary); }
        .border-primary-soft { border-color: var(--primary-soft); }
      `}</style>
    </div>
  );
}
