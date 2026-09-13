import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStage, PASSING_SCORE } from '../data/courseData';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { QuizQuestion } from '../components/QuizQuestion';
import { shuffleArray, shuffleQuestion, ShuffledQuestion } from '../utils/shuffle';
import { useProgressStore } from '../store/progressStore';
import { telegram } from '../services/telegram';
import { playCorrect, playWrong, playTap, buzz } from '../services/feedback';

export const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const stageId = Number(id);
  const stage = getStage(stageId);

  const submitQuiz = useProgressStore((s) => s.submitQuiz);
  const completeStage = useProgressStore((s) => s.completeStage);
  const registerAnswer = useProgressStore((s) => s.registerAnswer);
  const limit = useProgressStore((s) => s.settings.questionsPerQuiz);
  const strictMode = useProgressStore((s) => s.settings.strictMode);
  const autoNext = useProgressStore((s) => s.settings.autoNext);

  const questions: ShuffledQuestion[] = useMemo(() => {
    if (!stage) return [];
    const shuffled = shuffleArray(stage.questions).map(shuffleQuestion);
    return limit > 0 ? shuffled.slice(0, Math.min(limit, shuffled.length)) : shuffled;
  }, [stage?.id, limit]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ qId: string; correct: boolean }[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const nextTimer = useRef<number | null>(null);

  useEffect(() => {
    // reset on new stage
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setSeconds(0);
  }, [stageId]);

  // Чистим таймер автоперехода при смене этапа/выходе
  useEffect(() => {
    return () => {
      if (nextTimer.current) {
        clearTimeout(nextTimer.current);
        nextTimer.current = null;
      }
    };
  }, [stageId]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const goBack = () => nav(`/stage/${stageId}`);
  const handleBack = () => {
    if (answers.length > 0) setExitOpen(true);
    else goBack();
  };

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!stage || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Тест недоступен</div>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;

  const handleSelect = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    const correct = i === q.correctIndex;
    setAnswers((prev) => [...prev, { qId: q.id, correct }]);
    registerAnswer();
    if (strictMode) playTap();
    else if (correct) playCorrect();
    else playWrong();
    buzz();
    telegram.haptic(correct ? 'success' : 'error');
    if (autoNext) {
      nextTimer.current = window.setTimeout(() => handleNext(), 1400);
    }
  };

  const handleNext = () => {
    if (nextTimer.current) {
      clearTimeout(nextTimer.current);
      nextTimer.current = null;
    }
    if (index + 1 >= total) {
      finish(answersRef.current);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const finish = (list: { qId: string; correct: boolean }[]) => {
    const correct = list.filter((a) => a.correct).length;
    const percent = Math.round((correct / total) * 100);
    const passed = percent >= PASSING_SCORE;
    const wrongIds = list.filter((a) => !a.correct).map((a) => a.qId);

    submitQuiz(stage.id, {
      stageId: stage.id,
      correct,
      total,
      percent,
      wrongQuestionIds: wrongIds,
      passed,
      date: Date.now(),
    });

    if (passed) {
      completeStage(stage.id);
      telegram.haptic('success');
    } else {
      telegram.haptic('error');
    }

    nav(`/results/${stage.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#050c16]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#050c16]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              aria-label="Выйти из теста"
              className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="text-white font-bold">Тест</div>
            <div className="text-right">
              <div className="text-muted text-sm">
                {index + 1} из {total}
              </div>
              <div className="text-muted/70 text-xs tabular-nums">{fmtTime(seconds)}</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-card-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-6 pb-40">
        <QuizQuestion
          question={q}
          selected={selected}
          revealed={revealed}
          strict={strictMode}
          onSelect={handleSelect}
        />
      </div>

      {revealed && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] p-4 bg-gradient-to-t from-[#050c16] via-[#050c16] to-transparent">
          <Button variant="primary" size="lg" full onClick={handleNext}>
            {index + 1 >= total ? 'Завершить' : 'Дальше'}
          </Button>
        </div>
      )}

      <Modal open={exitOpen} onClose={() => setExitOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="text-white text-lg font-bold">Выйти из теста?</div>
          <div className="text-muted text-sm">
            Отвеченные вопросы не сохранятся, придётся проходить заново.
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" full onClick={() => setExitOpen(false)}>
              Остаться
            </Button>
            <Button variant="danger" full onClick={goBack}>
              Выйти
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
