import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { STAGES } from '../data/courseData';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { QuizQuestion } from '../components/QuizQuestion';
import { Confetti } from '../components/Confetti';
import { CircularProgress } from '../components/CircularProgress';
import { ResultCard } from '../components/ResultCard';
import { shuffleArray, shuffleQuestion, type ShuffledQuestion } from '../utils/shuffle';
import { useProgressStore } from '../store/progressStore';
import { telegram } from '../services/telegram';
import { playCorrect, playWrong, playTap, buzz } from '../services/feedback';

const EXAM_QUESTIONS = 20;
const EXAM_SECONDS = 20 * 60;
const MAX_MISTAKES = 2;

interface ExamResult {
  correct: number;
  total: number;
  wrongIds: string[];
}

export const ExamPage: React.FC = () => {
  const nav = useNavigate();
  const [attempt, setAttempt] = useState(0);

  // 20 случайных вопросов со всего курса
  const questions: ShuffledQuestion[] = useMemo(() => {
    const pool = shuffleArray(STAGES.flatMap((s) => s.questions));
    return pool.slice(0, EXAM_QUESTIONS).map(shuffleQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ qId: string; correct: boolean }[]>([]);
  const [left, setLeft] = useState(EXAM_SECONDS);
  const [exitOpen, setExitOpen] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  const registerAnswer = useProgressStore((s) => s.registerAnswer);
  const strictMode = useProgressStore((s) => s.settings.strictMode);
  const autoNext = useProgressStore((s) => s.settings.autoNext);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const nextTimer = useRef<number | null>(null);

  // Чистим таймер автоперехода при новой попытке/выходе
  useEffect(() => {
    return () => {
      if (nextTimer.current) {
        clearTimeout(nextTimer.current);
        nextTimer.current = null;
      }
    };
  }, [attempt]);

  const total = questions.length;
  const q = questions[index];

  const doFinish = (list: { qId: string; correct: boolean }[]) => {
    const correct = list.filter((a) => a.correct).length;
    const res: ExamResult = {
      correct,
      total: questions.length,
      wrongIds: list.filter((a) => !a.correct).map((a) => a.qId),
    };
    setResult(res);
    telegram.haptic(res.total - res.correct <= MAX_MISTAKES ? 'success' : 'error');
  };

  // Таймер: по истечении — автозавершение
  useEffect(() => {
    if (result) return;
    if (left <= 0) {
      doFinish(answersRef.current);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, result, attempt]);

  const handleSelect = (i: number) => {
    if (revealed || result) return;
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
      doFinish(answersRef.current);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const retry = () => {
    if (nextTimer.current) {
      clearTimeout(nextTimer.current);
      nextTimer.current = null;
    }
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setLeft(EXAM_SECONDS);
    setResult(null);
    setAttempt((a) => a + 1);
  };

  const goHome = () => nav('/');
  const handleBack = () => {
    if (!result && answers.length > 0) setExitOpen(true);
    else goHome();
  };

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ——— Экран результата ———
  if (result) {
    const mistakes = result.total - result.correct;
    const passed = mistakes <= MAX_MISTAKES;
    const percent = Math.round((result.correct / result.total) * 100);
    const wrongQuestions = result.wrongIds
      .map((qid) => questions.find((x) => x.id === qid))
      .filter(Boolean) as ShuffledQuestion[];

    return (
      <div className="min-h-screen bg-[#050c16]">
        <Confetti trigger={passed} />
        <div className="sticky top-0 z-30 bg-[#050c16]/90 backdrop-blur border-b border-white/5">
          <div className="max-w-[560px] mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={goHome}
              aria-label="Назад"
              className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="text-white font-bold">Экзамен</div>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-[560px] mx-auto px-4 pt-6 pb-40 space-y-5">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black"
            >
              {passed ? (
                <>Экзамен <span className="text-success">сдан!</span></>
              ) : (
                <>Экзамен <span className="text-danger">не сдан</span></>
              )}
            </motion.div>
            <div className="text-muted mt-1 text-sm">
              {passed
                ? 'Так держать!'
                : `Допущено ошибок: ${mistakes} (максимум ${MAX_MISTAKES})`}
            </div>
          </div>

          <div className="flex justify-center">
            <CircularProgress
              value={percent}
              size={200}
              label={
                <>
                  <div className="text-5xl font-black">
                    {percent}
                    <span className="text-2xl">%</span>
                  </div>
                  <div className="text-muted text-xs mt-1">
                    {result.correct} из {result.total} верно
                  </div>
                </>
              }
              colorFrom={passed ? '#28C76F' : '#FF8A00'}
              colorTo={passed ? '#FFC928' : '#FF4D4F'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              title="Правильных ответов"
              value={`${result.correct} из ${result.total}`}
              sub={`${percent}%`}
              tone={passed ? 'success' : 'default'}
            />
            <ResultCard
              title="Ошибок"
              value={`${mistakes}`}
              sub={`лимит ${MAX_MISTAKES}`}
              tone={passed ? 'success' : 'default'}
            />
          </div>

          {wrongQuestions.length > 0 && (
            <div className="rounded-2xl bg-card border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-danger" />
                <div className="text-white font-semibold">Разбор ошибок</div>
              </div>
              <div className="space-y-3">
                {wrongQuestions.map((wq) => (
                  <div key={wq.id} className="text-sm flex gap-3">
                    {wq.image && (
                      <img
                        src={encodeURI(wq.image)}
                        alt="Дорожный знак"
                        className="w-14 h-14 rounded-xl bg-white p-1 shrink-0 object-contain"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-white font-medium">{wq.question}</div>
                      <div className="text-muted text-xs mt-1">{wq.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button variant={passed ? 'success' : 'cta'} size="lg" full onClick={retry}>
              Пройти ещё раз
            </Button>
            <Button variant="ghost" size="lg" full onClick={() => nav('/course')}>
              К карте курса
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ——— Экран вопросов ———
  return (
    <div className="min-h-screen bg-[#050c16]">
      <div className="sticky top-0 z-30 bg-[#050c16]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              aria-label="Выйти из экзамена"
              className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="text-white font-bold">Экзамен</div>
            <div className="text-right">
              <div className="text-muted text-sm">
                {index + 1} из {total}
              </div>
              <div
                className={[
                  'text-xs tabular-nums font-semibold',
                  left < 60 ? 'text-danger' : 'text-muted/70',
                ].join(' ')}
              >
                {fmtTime(left)}
              </div>
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
        <div
          style={{
            paddingTop: '1rem',
            paddingInline: '1rem',
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
          }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] bg-gradient-to-t from-[#050c16] via-[#050c16] to-transparent"
        >
          <Button variant="primary" size="lg" full onClick={handleNext}>
            {index + 1 >= total ? 'Завершить' : 'Дальше'}
          </Button>
        </div>
      )}

      <Modal open={exitOpen} onClose={() => setExitOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="text-white text-lg font-bold">Выйти из экзамена?</div>
          <div className="text-muted text-sm">
            Результат не сохранится, придётся начинать заново.
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" full onClick={() => setExitOpen(false)}>
              Остаться
            </Button>
            <Button variant="danger" full onClick={goHome}>
              Выйти
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
