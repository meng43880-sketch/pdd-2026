import React from 'react';
import { CheckCircle2, PlayCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Video } from '../data/courseData';

interface Props {
  videos: Video[];
  currentId: string;
  watched: string[];
  onSelect: (v: Video) => void;
}

export const VideoList: React.FC<Props> = ({ videos, currentId, watched, onSelect }) => {
  return (
    <div className="space-y-2">
      {videos.map((v) => {
        const isWatched = watched.includes(v.id);
        const isCurrent = v.id === currentId;
        return (
          <motion.button
            key={v.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(v)}
            className={[
              'w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 border transition',
              isCurrent
                ? 'bg-primary/15 border-primary/50'
                : 'bg-card border-white/5 hover:border-white/10',
            ].join(' ')}
          >
            <div className="shrink-0">
              {isWatched ? (
                <CheckCircle2 size={20} className="text-success" />
              ) : isCurrent ? (
                <PlayCircle size={20} className="text-primary" />
              ) : (
                <Circle size={20} className="text-muted/60" />
              )}
            </div>
            <div
              className={[
                'flex-1 text-sm truncate',
                isWatched && !isCurrent ? 'text-muted line-through' : 'text-white',
              ].join(' ')}
            >
              {v.title}
            </div>
            <div className="text-muted text-xs shrink-0">
              {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
