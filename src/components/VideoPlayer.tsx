import React, { useRef, useState, useEffect } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from './Button';
import type { Video } from '../data/courseData';

interface Props {
  video: Video;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<Props> = ({ video, onEnded }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [video.id]);

  const reload = () => {
    setError(false);
    setLoading(true);
    if (ref.current) {
      ref.current.load();
      ref.current.play().catch(() => {});
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/5">
      {!error ? (
        <>
          <video
            ref={ref}
            src={video.url}
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
            onLoadedData={() => setLoading(false)}
            onEnded={() => onEnded?.()}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-muted text-sm">
              Загрузка видео…
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <AlertCircle size={36} className="text-danger" />
          <div className="text-white font-semibold">Видео не загрузилось</div>
          <div className="text-muted text-xs max-w-xs">
            Проверьте подключение к интернету или попробуйте снова.
          </div>
          <Button variant="ghost" size="md" onClick={reload}>
            <RotateCw size={16} className="inline mr-2" />
            Повторить
          </Button>
        </div>
      )}
    </div>
  );
};
