import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Trophy, XCircle, Target, Flame, CalendarCheck } from 'lucide-react';
import { STAGES, TOTAL_VIDEOS } from '../data/courseData';
import { StatsCard } from '../components/StatsCard';
import { ProgressRoad } from '../components/ProgressRoad';
import { BottomNavigation } from '../components/BottomNavigation';
import { useProgressStore } from '../store/progressStore';
import { calcWatchedVideos } from '../utils/progress';

export const StatisticsPage: React.FC = () => {
  const nav = useNavigate();
  const completed = useProgressStore((s) => s.completedStages);
  const watchedVideos = useProgressStore((s) => s.watchedVideos);
  const totalCorrect = useProgressStore((s) => s.totalCorrectAnswers);
  const totalWrong = useProgressStore((s) => s.totalWrongAnswers);
  const testResults = useProgressStore((s) => s.testResults);
  const streak = useProgressStore((s) => s.streak);
  const daily = useProgressStore((s) => s.daily);
  const dailyGoal = useProgressStore((s) => s.settings.dailyGoal);

  const watched = useMemo(() => calcWatchedVideos(watchedVideos), [watchedVideos]);
  const stagePercent = Math.round((completed.length / STAGES.length) * 100);

  const avg = useMemo(() => {
    const results = Object.values(testResults);
    if (results.length === 0) return 0;
    return Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length);
  }, [testResults]);

  const nextStage = useMemo(() => {
    for (const st of STAGES) {
      if (!completed.includes(st.id)) return st;
    }
    return STAGES[STAGES.length - 1];
  }, [completed]);

  return (
    <div className="min-h-screen pb-32">
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => nav('/')}
            aria-label="Назад"
            className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-white font-bold">Мой прогресс</div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-4 space-y-4">
        <div className="rounded-3xl bg-card border border-white/5 p-4">
          <div className="text-muted text-xs uppercase tracking-wide">Этапы</div>
          <div className="text-3xl font-black text-white mt-1">
            {completed.length} / {STAGES.length}
          </div>
          <div className="mt-3">
            <ProgressRoad percent={stagePercent} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatsCard label="Видео" value={`${watched} / ${TOTAL_VIDEOS}`} icon={<Video size={18} />} accent="primary" />
          <StatsCard label="Правильные ответы" value={`${totalCorrect}`} icon={<Trophy size={18} />} accent="success" />
          <StatsCard label="Ошибки" value={`${totalWrong}`} icon={<XCircle size={18} />} accent="danger" />
          <StatsCard label="Средний результат" value={`${avg}%`} icon={<Target size={18} />} accent="accent" />
          <StatsCard label="Серия дней" value={`${streak.count} дн.`} icon={<Flame size={18} />} accent="accent" />
          <StatsCard label="Сегодня" value={`${daily.count} / ${dailyGoal}`} icon={<CalendarCheck size={18} />} accent="primary" />
        </div>

        <div className="rounded-2xl bg-card border border-white/5 p-4">
          <div className="text-muted text-xs uppercase tracking-wide">Текущий этап</div>
          <div className="text-white font-bold mt-1">
            Этап {nextStage.id}. {nextStage.title}
          </div>
          <button
            onClick={() => nav(`/stage/${nextStage.id}`)}
            className="mt-3 text-primary text-sm font-semibold"
          >
            Перейти к этапу →
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};
