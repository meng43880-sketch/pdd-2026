import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { useProgressStore } from './store/progressStore';
import { Welcome } from './pages/Welcome';
import { CourseMap } from './pages/CourseMap';
import { SignsPage } from './pages/SignsPage';
import { ExamPage } from './pages/ExamPage';
import { MemoPage } from './pages/MemoPage';
import { StagePage } from './pages/StagePage';
import { QuizPage } from './pages/QuizPage';
import { ResultsPage } from './pages/ResultsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AllVideos } from './pages/AllVideos';
import { telegram } from './services/telegram';

const App: React.FC = () => {
  useEffect(() => {
    telegram.init();
  }, []);

  const animations = useProgressStore((s) => s.settings.animations);
  const fontScale = useProgressStore((s) => s.settings.fontScale);

  // Крупный текст: масштабируем rem-базу, весь интерфейс растёт пропорционально
  useEffect(() => {
    document.documentElement.style.fontSize = fontScale === 'large' ? '18px' : '';
  }, [fontScale]);

  return (
    <MotionConfig reducedMotion={animations ? 'never' : 'always'}>
    <BrowserRouter>
      <div className="mx-auto max-w-[560px] min-h-screen bg-bg">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/course" element={<CourseMap />} />
          <Route path="/signs" element={<SignsPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/memo" element={<MemoPage />} />
          <Route path="/stage/:id" element={<StagePage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/all-videos" element={<AllVideos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
    </MotionConfig>
  );
};

export default App;
