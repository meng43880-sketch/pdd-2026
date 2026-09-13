import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Piece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotate: number;
}

const COLORS = ['#FFC928', '#28C76F', '#1683FF', '#FF8A00', '#FF4D4F'];

export const Confetti: React.FC<{ trigger?: boolean }> = ({ trigger }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const arr: Piece[] = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.4,
      rotate: Math.random() * 360,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 2600);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', rotate: p.rotate + 720, opacity: 0.9 }}
          transition={{ duration: 2.2, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            width: 8,
            height: 14,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
};
