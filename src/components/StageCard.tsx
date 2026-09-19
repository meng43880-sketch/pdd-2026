import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import type { Stage } from '../data/courseData';

export type StageStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

interface Props {
  stage: Stage;
  status: StageStatus;
  onClick: () => void;
}

export const StageCard: React.FC<Props> = ({ stage, status, onClick }) => {
  const disabled = status === 'LOCKED';

  const statusMap: Record<StageStatus, { icon: React.ReactNode; text: string; cls: string }> = {
    LOCKED: {
      icon: <Lock size={18} className="text-muted" />,
      text: 'Заблокирован',
      cls: 'text-muted',
    },
    AVAILABLE: {
      icon: <Unlock size={18} className="text-primary" />,
      text: 'Смотреть',
      cls: 'text-primary font-semibold',
    },
    IN_PROGRESS: {
      icon: <Clock size={18} className="text-accent" />,
      text: 'Продолжить',
      cls: 'text-accent font-semibold',
    },
    COMPLETED: {
      icon: <CheckCircle2 size={18} className="text-success" />,
      text: 'Пройдено',
      cls: 'text-success font-semibold',
    },
  };

  const s = statusMap[status];

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={disabled ? undefined : onClick}
      className={[
        'w-full text-left rounded-2xl p-4 border flex items-center gap-3 transition',
        disabled
          ? 'bg-card/60 border-white/5 opacity-60 cursor-not-allowed'
          : 'bg-card border-white/5 hover:border-white/10 active:border-primary/40',
      ].join(' ')}
      aria-label={`Этап ${stage.id}: ${stage.title}`}
    >
      <div
        className={[
          'w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0',
          status === 'COMPLETED'
            ? 'bg-success/15 text-success'
            : status === 'AVAILABLE'
            ? 'bg-primary/15 text-primary'
            : status === 'IN_PROGRESS'
            ? 'bg-accent/15 text-accent'
            : 'bg-card-2 text-muted',
        ].join(' ')}
      >
        #{stage.id}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold truncate">{stage.title}</div>
        <div className="text-muted text-xs mt-0.5 truncate">
          {stage.videos.length} видео
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {status === 'AVAILABLE' && <PlayCircle size={18} className="text-primary" />}
        {s.icon}
      </div>
    </motion.button>
  );
};
