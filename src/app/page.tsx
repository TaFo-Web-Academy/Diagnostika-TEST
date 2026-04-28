'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import OnboardingForm from '@/components/OnboardingForm';
import TestList from '@/components/TestList';
import { db } from '@/lib/data';

export default function Home() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'onboarding' | 'tests'>('onboarding');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user already exists
    const existingUserId = localStorage.getItem('ravoni_userId');
    if (existingUserId) {
      const user = db.getUser(existingUserId);
      if (user && user.promoCodeEntered) {
        setUserId(existingUserId);
        setCurrentView('tests');
      }
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (newUserId: string) => {
    setUserId(newUserId);
    setCurrentView('tests');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="animate-pulse-soft text-warm-green text-xl">Дар ҳоли боргирӣ...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {currentView === 'onboarding' ? (
        <OnboardingForm onComplete={handleOnboardingComplete} />
      ) : (
        <TestList userId={userId} />
      )}
    </main>
  );
}
