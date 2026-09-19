import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { STAGES, TOTAL_VIDEOS } from '../data/courseData';
import { ProgressRoad } from '../components/ProgressRoad';
import { StageCard, StageStatus } from '../components/StageCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { SideMenu } from '../components/SideMenu';
import { useProgressStore } from '../store/progressStore';
import { calcWatchedVideos } from '../utils/progress';

export const CourseMap: React.FC = () => {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const completedStages = useProgressStore((s) => s.completedStages);
  const watchedVideos = useProgressStore((s) => s.watchedVideos);
  const testResults = useProgressStore((s) => s.testResults);

  const watchedCount = useMemo(() => calcWatchedVideos(watchedVideos), [watchedVideos]);
  const remaining = TOTAL_VIDEOS - watchedCount;
  const percent = Math.round((completedStages.length / STAGES.length) * 100);

  const getStatus = (stageId: number): StageStatus => {
    if (completedStages.includes(stageId)) return 'COMPLETED';
    const watched = watchedVideos[stageId]?.length ?? 0;
    const attempted = !!testResults[stageId];
    if (watched > 0 || attempted) return 'IN_PROGRESS';
    return 'AVAILABLE';
  };

  return (
    <div className="min-h-screen pb-32">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Top bar */}
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => nav('/')}
            aria-label="Назад"
            className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-white font-bold">Карта курса</div>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Меню"
            className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
          >
            <Flag size={18} className="text-accent" />
          </button>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-4">
        {/* Progress road */}
        <div className="rounded-3xl bg-card border border-white/5 p-4">
          <ProgressRoad percent={percent} />
          <div className="mt-3 text-center text-sm text-muted">
            Пройдено <span className="text-white font-medium">{completedStages.length}</span> из <span className="text-white font-medium">{STAGES.length}</span> этапов • Осталось <span className="text-white font-medium">{remaining}</span> видео
          </div>
        </div>

        {/* Stages list */}
        <div className="mt-4 space-y-2">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3), duration: 0.25 }}
            >
              <StageCard
                stage={stage}
                status={getStatus(stage.id)}
                onClick={() => nav(`/stage/${stage.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};
