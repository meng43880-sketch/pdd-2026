import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, PlayCircle } from 'lucide-react';
import { FULL_PLAYLIST_URL } from '../data/courseData';
import { Button } from '../components/Button';

export const AllVideos: React.FC = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => nav('/')}
            aria-label="Назад"
            className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-white font-bold">Все видео курса</div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-6 space-y-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
          <PlayCircle size={32} className="text-primary" />
        </div>
        <div className="text-white font-bold text-lg">800 коротких роликов</div>
        <div className="text-muted text-sm">
          Откроется внешний плейлист со всеми видео курса.
        </div>
        <a
          href={FULL_PLAYLIST_URL}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <Button variant="cta" size="lg" full>
            <ExternalLink size={18} className="inline mr-2" />
            Открыть плейлист
          </Button>
        </a>
      </div>
    </div>
  );
};
