import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, PlayCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { STAGES, TOTAL_VIDEOS } from '../data/courseData';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoList } from '../components/VideoList';
import { useProgressStore } from '../store/progressStore';
import { telegram } from '../services/telegram';
import { calcWatchedVideos } from '../utils/progress';

export const AllVideos: React.FC = () => {
  const nav = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);

  const watchedVideos = useProgressStore((s) => s.watchedVideos);
  const markVideoWatched = useProgressStore((s) => s.markVideoWatched);

  const watchedCount = useMemo(() => calcWatchedVideos(watchedVideos), [watchedVideos]);

  const [currentStageId, setCurrentStageId] = useState(STAGES[0]?.id ?? 1);
  const [currentVideoId, setCurrentVideoId] = useState(STAGES[0]?.videos[0]?.id ?? '');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const currentStage = useMemo(
    () => STAGES.find((s) => s.id === currentStageId) ?? STAGES[0],
    [currentStageId]
  );
  const currentVideo = useMemo(
    () => currentStage?.videos.find((v) => v.id === currentVideoId) ?? currentStage?.videos[0],
    [currentStage, currentVideoId]
  );

  // Раскрываем блок этапа, в котором сейчас играет видео
  useEffect(() => {
    if (currentStageId == null) return;
    setExpanded((prev) => ({ ...prev, [currentStageId]: true }));
  }, [currentStageId]);

  const handleSelect = (stageId: number, videoId: string) => {
    setCurrentStageId(stageId);
    setCurrentVideoId(videoId);
    telegram.haptic('tap');
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnded = () => {
    if (currentStageId == null || !currentVideo) return;
    markVideoWatched(currentStageId, currentVideo.id);
    telegram.haptic('tap');
  };

  const toggleStage = (stageId: number) => {
    setExpanded((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <div ref={topRef} className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav('/')}
              aria-label="Назад"
              className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold">Все видео курса</div>
              <div className="text-muted text-xs">
                {TOTAL_VIDEOS} роликов · {STAGES.length} этапов · просмотрено {watchedCount}
              </div>
            </div>
            {watchedCount > 0 && (
              <CheckCircle2 size={20} className="text-success shrink-0" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-4 space-y-4">
        {/* Player */}
        {currentStage && currentVideo && (
          <VideoPlayer video={currentVideo} onEnded={handleEnded} />
        )}

        <div className="px-1">
          <div className="text-white font-semibold truncate">{currentVideo?.title}</div>
          <div className="text-muted text-xs mt-1">
            Этап {currentStage?.id}. {currentStage?.title}
          </div>
        </div>

        {currentStage && currentVideo && !watchedVideos[currentStage.id]?.includes(currentVideo.id) && (
          <button
            onClick={() => markVideoWatched(currentStage.id, currentVideo.id)}
            className="w-full rounded-2xl bg-card border border-white/5 px-4 py-3 flex items-center justify-center gap-2 text-sm text-white"
          >
            <CheckCircle2 size={18} className="text-success" />
            Отметить просмотренным
          </button>
        )}

        {/* Список по этапам */}
        <div className="pt-2 space-y-2">
          <div className="text-muted text-xs uppercase tracking-wide mb-2 px-1">
            Весь курс по этапам
          </div>

          {STAGES.map((stage) => {
            const isOpen = !!expanded[stage.id];
            const stageWatched = watchedVideos[stage.id]?.length ?? 0;
            return (
              <div
                key={stage.id}
                className="rounded-2xl bg-card border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => toggleStage(stage.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {stage.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{stage.title}</div>
                    <div className="text-muted text-xs">
                      {stage.videos.length} видео{stageWatched > 0 ? ` · смотрено ${stageWatched}` : ''}
                    </div>
                  </div>
                  {stageWatched === stage.videos.length ? (
                    <CheckCircle2 size={18} className="text-success shrink-0" />
                  ) : (
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      className="shrink-0"
                    >
                      <ChevronDown size={18} className="text-muted" />
                    </motion.span>
                  )}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 -mt-1">
                    <VideoList
                      videos={stage.videos}
                      currentId={currentStageId === stage.id ? currentVideoId : ''}
                      watched={watchedVideos[stage.id] ?? []}
                      onSelect={(v) => handleSelect(stage.id, v.id)}
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-success/15 flex items-center justify-center">
              <PlayCircle size={22} className="text-success" />
            </div>
            <div className="text-white font-bold mt-2">Весь курс в одном месте</div>
            <div className="text-muted text-xs mt-1">
              Все этапы открыты — просто выбирай и смотри
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};