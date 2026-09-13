import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnswerOption } from './AnswerOption';
import type { ShuffledQuestion } from '../utils/shuffle';

interface Props {
  question: ShuffledQuestion;
  selected: number | null;
  revealed: boolean;
  strict?: boolean;
  onSelect: (i: number) => void;
}

export const QuizQuestion: React.FC<Props> = ({ question, selected, revealed, strict, onSelect }) => {
  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <h2 className="text-xl font-bold text-white leading-snug">{question.question}</h2>
          {question.image && (
            <img
              src={encodeURI(question.image)}
              alt="Дорожный знак"
              className="mx-auto max-h-56 w-auto rounded-2xl bg-white p-3"
            />
          )}
          <div className="space-y-2 pt-2">
            {question.answers.map((a, i) => {
              let state: 'idle' | 'correct' | 'wrong' | 'revealed' = 'idle';
              // В строгом режиме правильность не подсвечиваем до конца
              if (revealed && !strict) {
                if (i === question.correctIndex) state = 'correct';
                else if (i === selected) state = 'wrong';
                else state = 'idle';
              } else if (selected === i) {
                state = 'idle';
              }
              return (
                <AnswerOption
                  key={i}
                  index={i}
                  text={a}
                  state={state}
                  disabled={revealed}
                  image={question.answerImages?.[i]}
                  onClick={() => onSelect(i)}
                />
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {revealed && !strict && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={[
            'rounded-2xl p-4 border text-sm',
            selected === question.correctIndex
              ? 'bg-success/10 border-success/40 text-success'
              : 'bg-danger/10 border-danger/40 text-danger',
          ].join(' ')}
        >
          <div className="font-semibold mb-1">
            {selected === question.correctIndex ? 'Правильно! 🎉' : 'Неверно'}
          </div>
          <div className="text-white/90">{question.explanation}</div>
        </motion.div>
      )}
      {revealed && strict && (
        <div className="text-center text-muted text-xs">Ответ принят</div>
      )}
    </div>
  );
};
