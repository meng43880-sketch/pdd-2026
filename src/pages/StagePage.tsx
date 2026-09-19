import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStage } from '../data/courseData';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoList } from '../components/VideoList';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useProgressStore } from '../store/progressStore';
import { telegram } from '../services/telegram';

export const StagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const stageId = Number(id);
  const stage = getStage(stageId);

  const watched = useProgressStore((s) => s.watchedVideos[stageId] ?? []);
  const markVideoWatched = useProgressStore((s) => s.markVideoWatched);
  const completeStage = useProgressStore((s) => s.completeStage);

  const [currentVideoId, setCurrentVideoId] = useState(stage?.videos[0]?.id ?? '');
  const [infoOpen, setInfoOpen] = useState(false);

  const currentVideo = useMemo(
    () => stage?.videos.find((v) => v.id === currentVideoId) ?? stage?.videos[0],
    [stage, currentVideoId]
  );

  if (!stage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-white font-bold">Этап не найден</div>
          <Button className="mt-4" onClick={() => nav('/course')}>
            К карте курса
          </Button>
        </div>
      </div>
    );
  }

  const watchedInStage = watched.length;
  const totalInStage = stage.videos.length;
  const stagePercent = Math.round((watchedInStage / totalInStage) * 100);
  const nextStage = getStage(stage.id + 1);

  const handleSelect = (v: typeof stage.videos[number]) => {
    setCurrentVideoId(v.id);
  };

  const handleEnded = () => {
    if (!currentVideo) return;
    markVideoWatched(stage.id, currentVideo.id);
    telegram.haptic('tap');
  };

  const handleManualMark = () => {
    if (!currentVideo) return;
    markVideoWatched(stage.id, currentVideo.id);
  };

  const handleNext = () => {
    completeStage(stage.id);
    telegram.haptic('success');
    if (nextStage) {
      nav(`/stage/${nextStage.id}`);
    } else {
      nav('/course');
    }
  };

  return (
    <div className="min-h-screen pb-40">
      {/* Top bar */}
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => nav('/course')}
              aria-label="Назад"
              className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="text-white font-bold truncate px-3">
              Этап {stage.id}
            </div>
            <button
              onClick={() => setInfoOpen(true)}
              aria-label="Информация"
              className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
            >
              <Info size={18} className="text-primary" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-card-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stagePercent}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-primary"
              />
            </div>
            <div className="text-muted text-xs whitespace-nowrap">
              {watchedInStage}/{totalInStage}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-4 space-y-4">
        {/* Player */}
        {currentVideo && (
          <VideoPlayer video={currentVideo} onEnded={handleEnded} />
        )}

        {/* Meta */}
        <div className="px-1">
          <div className="text-white font-semibold truncate">
            {currentVideo?.title}
          </div>
          <div className="text-muted text-xs mt-1">
            Длительность:{' '}
            {currentVideo
              ? `${Math.floor(currentVideo.duration / 60)}:${String(currentVideo.duration % 60).padStart(2, '0')}`
              : '—'}
          </div>
        </div>

        {/* Manual mark button */}
        {currentVideo && !watched.includes(currentVideo.id) && (
          <button
            onClick={handleManualMark}
            className="w-full rounded-2xl bg-card border border-white/5 px-4 py-3 flex items-center justify-center gap-2 text-sm text-white"
          >
            <CheckCircle2 size={18} className="text-success" />
            Отметить просмотренным
          </button>
        )}

        {/* Video list */}
        <div className="pt-2">
          <div className="text-muted text-xs uppercase tracking-wide mb-2 px-1">
            Видео этапа
          </div>
          <VideoList
            videos={stage.videos}
            currentId={currentVideo?.id ?? ''}
            watched={watched}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] p-4 bg-gradient-to-t from-bg via-bg to-transparent">
        <Button variant="cta" size="lg" full onClick={handleNext}>
          {nextStage ? 'Следующий этап →' : 'К карте курса'}
        </Button>
        <div className="text-center text-muted text-xs mt-2">
          Следующий этап откроется сразу — тестов нет
        </div>
      </div>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)}>
        <div className="space-y-3">
          <div className="text-white font-bold text-lg">
            Этап {stage.id}. {stage.title}
          </div>
          <div className="text-muted text-sm">{stage.description}</div>
          <div className="text-muted text-xs">
            Видео: {totalInStage}
          </div>
          <Button variant="ghost" full onClick={() => setInfoOpen(false)}>
            Понятно
          </Button>
        </div>
      </Modal>
    </div>
  );
};
