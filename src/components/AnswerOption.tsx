import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Props {
  index: number;
  text: string;
  state: 'idle' | 'correct' | 'wrong' | 'revealed';
  onClick: () => void;
  disabled?: boolean;
  image?: string;
}

const LETTERS = ['1', '2', '3', '4', '5', '6'];

export const AnswerOption: React.FC<Props> = ({ index, text, state, onClick, disabled, image }) => {
  const cls =
    state === 'correct'
      ? 'bg-success/20 border-success'
      : state === 'wrong'
      ? 'bg-danger/20 border-danger'
      : state === 'revealed'
      ? 'bg-success/10 border-success/60'
      : 'bg-card border-white/5 hover:border-white/15';

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      animate={state === 'wrong' ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left rounded-2xl px-4 py-4 flex items-center gap-3 border ${cls} transition`}
    >
      <div
        className={[
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
          state === 'correct'
            ? 'bg-success text-white'
            : state === 'wrong'
            ? 'bg-danger text-white'
            : state === 'revealed'
            ? 'bg-success/60 text-white'
            : 'bg-card-2 text-muted',
        ].join(' ')}
      >
        {LETTERS[index]}
      </div>
      {image && (
        <img
          src={encodeURI(image)}
          alt=""
          className="w-10 h-10 rounded-lg bg-white p-1 shrink-0 object-contain"
        />
      )}
      <div className="flex-1 text-sm text-white">{text}</div>
      {state === 'correct' && <Check size={20} className="text-success shrink-0" />}
      {state === 'wrong' && <X size={20} className="text-danger shrink-0" />}
    </motion.button>
  );
};
