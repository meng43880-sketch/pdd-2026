import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface Props {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
  colorFrom?: string;
  colorTo?: string;
}

export const CircularProgress: React.FC<Props> = ({
  value,
  size = 200,
  stroke = 14,
  label,
  colorFrom = '#28C76F',
  colorTo = '#FFC928',
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const gradId = `grad-${Math.round(value)}-${size}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#162438" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label}
      </div>
    </div>
  );
};

export const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 1.1,
}) => {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(v));
    const controls = animate(mv, value, { duration });
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, duration, mv, rounded]);

  return <span>{display}</span>;
};
