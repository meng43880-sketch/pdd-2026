import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  percent: number; // 0..100
}

export const ProgressRoad: React.FC<Props> = ({ percent }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillPercent = Math.max(0, clamped - 4);
  // Машинку держим чуть внутри краёв, чтобы не обрезалась
  const carLeft = 2 + clamped * 0.96;

  return (
    <div className="relative w-full h-16 select-none">
      {/* Дорога */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-7 rounded-full bg-[#2a2f3a] overflow-hidden">
        {/* Зелёная пройденная часть */}
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.9, ease: [0.25, 0.8, 0.25, 1] }}
          className="h-full bg-gradient-to-r from-[#3dd68c] to-[#2ecc71]"
        />
        {/* Разметка (пунктир) */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] opacity-85"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 10px, #f0c040 10px 22px)',
          }}
        />
      </div>

      {/* Старт */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <div className="w-3 h-3 rounded-full bg-primary shadow-glow" />
      </div>

      {/* Финишный флаг */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0.5">
        <svg width="24" height="30" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="4" width="3" height="32" rx="1.5" fill="#c0c0c0" />
          <path d="M15 6h11v14H15V6z" fill="#fff" />
          <path
            d="M15 6h5.5v3.5H15V6zm5.5 3.5H26v3.5h-5.5V9.5zm-5.5 3.5h5.5v3.5H15v-3.5zm5.5 3.5H26V20h-5.5v-3.5z"
            fill="#111"
          />
        </svg>
      </div>

      {/* Машинка */}
      <motion.div
        initial={{ left: '2%' }}
        animate={{ left: `${carLeft}%` }}
        transition={{ duration: 0.9, ease: [0.25, 0.8, 0.25, 1] }}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[52px] h-8 z-10"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}
      >
        <svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          {/* Кузов */}
          <path
            d="M8 26h48c2 0 3.5-1.5 3.5-3.5V16c0-2-1.5-3.5-3.5-3.5H48l-4-6H22l-4 6H8c-2 0-3.5 1.5-3.5 3.5v6.5c0 2 1.5 3.5 3.5 3.5z"
            fill="#f5f5f5"
          />
          {/* Крыша */}
          <path d="M22 12.5h20l3 6H19l3-6z" fill="#e8e8e8" />
          {/* Окна */}
          <path d="M23 13.5h8v5H21.5l1.5-5z" fill="#7ec8e3" />
          <path d="M33 13.5h8.5l1.5 5H33v-5z" fill="#7ec8e3" />
          {/* Колёса */}
          <circle cx="16" cy="28" r="5.5" fill="#1a1a1a" />
          <circle cx="16" cy="28" r="2.8" fill="#555" />
          <circle cx="48" cy="28" r="5.5" fill="#1a1a1a" />
          <circle cx="48" cy="28" r="2.8" fill="#555" />
          {/* Фары */}
          <rect x="53" y="17" width="4" height="3" rx="1" fill="#ffd700" />
          <rect x="7" y="17" width="3" height="3" rx="1" fill="#ff6b6b" />
        </svg>
      </motion.div>
    </div>
  );
};