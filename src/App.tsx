import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { useProgressStore } from './store/progressStore';
import { useAccessStore } from './store/accessStore';
import { AccessGate } from './components/AccessGate';
import { Welcome } from './pages/Welcome';
import { CourseMap } from './pages/CourseMap';
import { SignsPage } from './pages/SignsPage';
import { ExamPage } from './pages/ExamPage';
import { MemoPage } from './pages/MemoPage';
import { StagePage } from './pages/StagePage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AllVideos } from './pages/AllVideos';
import { Paywall } from './pages/Paywall';
import { AccountPage } from './pages/AccountPage';
import { telegram } from './services/telegram';

const App: React.FC = () => {
  useEffect(() => {
    telegram.init();
    // Проверяем доступ к курсу (без оплаты курс закрыт)
    void useAccessStore.getState().load();
  }, []);

  const animations = useProgressStore((s) => s.settings.animations);
  const fontScale = useProgressStore((s) => s.settings.fontScale);

  // Крупный текст: масштабируем rem-базу, весь интерфейс растёт пропорционально
  useEffect(() => {
    document.documentElement.style.fontSize = fontScale === 'large' ? '18px' : '';
  }, [fontScale]);

  return (
    <MotionConfig reducedMotion={animations ? 'never' : 'always'}>
    <HashRouter>
      <div className="mx-auto max-w-[560px] min-h-screen bg-bg">
        <Routes>
          <Route path="/paywall" element={<Paywall />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/" element={<AccessGate><Welcome /></AccessGate>} />
          <Route path="/course" element={<AccessGate><CourseMap /></AccessGate>} />
          <Route path="/signs" element={<AccessGate><SignsPage /></AccessGate>} />
          <Route path="/exam" element={<AccessGate><ExamPage /></AccessGate>} />
          <Route path="/memo" element={<AccessGate><MemoPage /></AccessGate>} />
          <Route path="/stage/:id" element={<AccessGate><StagePage /></AccessGate>} />
          <Route path="/statistics" element={<AccessGate><StatisticsPage /></AccessGate>} />
          <Route path="/settings" element={<AccessGate><SettingsPage /></AccessGate>} />
          <Route path="/all-videos" element={<AccessGate><AllVideos /></AccessGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
    </MotionConfig>
  );
};

export default App;