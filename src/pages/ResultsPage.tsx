import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getStage, PASSING_SCORE, TOTAL_VIDEOS, STAGES } from '../data/courseData';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { CircularProgress, AnimatedNumber } from '../components/CircularProgress';
import { ResultCard } from '../components/ResultCard';
import { useProgressStore } from '../store/progressStore';
import { calcWatchedVideos } from '../utils/progress';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const stageId = Number(id);
  const stage = getStage(stageId);

  const result = useProgressStore((s) => s.testResults[stageId]);
  const watchedVideos = useProgressStore((s) => s.watchedVideos);

  const watchedCount = useMemo(() => calcWatchedVideos(watchedVideos), [watchedVideos]);

  if (!stage || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-white font-bold">Нет результатов</div>
          <Button className="mt-4" onClick={() => nav('/course')}>
            К карте курса
          </Button>
        </div>
      </div>
    );
  }

  const passed = result.passed;
  const nextStage = STAGES.find((s) => s.id === stage.id + 1);

  const wrongQuestions = result.wrongQuestionIds
    .map((qid) => stage.questions.find((q) => q.id === qid))
    .filter(Boolean) as typeof stage.questions;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Confetti trigger={passed} />

      {/* Top bar */}
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => nav('/course')}
            aria-label="Назад"
            className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-white font-bold">Результат</div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-6 pb-40 space-y-5">
        {/* Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-black"
          >
            {passed ? (
              <>
                Этап {stage.id} <span className="text-success">пройден!</span>
              </>
            ) : (
              <>
                Этап пока <span className="text-danger">не пройден</span>
              </>
            )}
          </motion.div>
          <div className="text-muted mt-1 text-sm">
            {passed
              ? 'Отличный результат'
              : `Для прохождения нужно набрать минимум ${PASSING_SCORE}%`}
          </div>
        </div>

        {/* Circular progress */}
        <div className="flex justify-center">
          <CircularProgress
            value={result.percent}
            size={200}
            label={
              <>
                <div className="text-5xl font-black">
                  <AnimatedNumber value={result.percent} />
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <ResultCard
            title="Правильных ответов"
            value={`${result.correct} из ${result.total}`}
            sub={`${result.percent}%`}
            tone={passed ? 'success' : 'default'}
          />
          <ResultCard
            title="Прогресс курса"
            value={`${watchedCount} / ${TOTAL_VIDEOS}`}
            sub="видео просмотрено"
            tone="accent"
          />
        </div>

        {/* Errors */}
        {wrongQuestions.length > 0 && (
          <div className="rounded-2xl bg-card border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-danger" />
              <div className="text-white font-semibold">Разбор ошибок</div>
            </div>
            <div className="space-y-3">
              {wrongQuestions.map((q) => (
                <div key={q.id} className="text-sm flex gap-3">
                  {q.image && (
                    <img
                      src={encodeURI(q.image)}
                      alt="Дорожный знак"
                      className="w-14 h-14 rounded-xl bg-white p-1 shrink-0 object-contain"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-white font-medium">{q.question}</div>
                    <div className="text-muted text-xs mt-1">{q.explanation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next step */}
        <div className="rounded-2xl bg-card border border-white/5 p-4">
          <div className="text-white font-semibold mb-1">
            {passed ? 'Ты освоил тему' : 'Что дальше?'}
          </div>
          <div className="text-muted text-sm">
            {passed
              ? `Следующий этап — «${nextStage?.title ?? 'Финал'}»`
              : 'Пересмотри видео по ошибкам и попробуй ещё раз. Следующий этап заблокирован.'}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {passed && nextStage && (
            <Button
              variant="yellow"
              size="lg"
              full
              onClick={() => nav(`/stage/${nextStage.id}`)}
            >
              К следующему этапу
              <ArrowRight size={18} className="inline ml-2" />
            </Button>
          )}
          {passed && !nextStage && (
            <Button variant="success" size="lg" full onClick={() => nav('/course')}>
              <CheckCircle2 size={18} className="inline mr-2" />
              Курс завершён!
            </Button>
          )}
          <Button
            variant={passed ? 'ghost' : 'cta'}
            size="lg"
            full
            onClick={() => nav(`/quiz/${stage.id}`)}
          >
            <RefreshCw size={16} className="inline mr-2" />
            Повторить тест
          </Button>
          <Button
            variant="ghost"
            size="lg"
            full
            onClick={() => nav('/course')}
          >
            К карте курса
          </Button>
        </div>
      </div>
    </div>
  );
};
