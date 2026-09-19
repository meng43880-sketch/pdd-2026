import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Crown, Zap, Lock, CalendarDays, CreditCard,
  PlayCircle, Settings, History, LifeBuoy,
} from 'lucide-react';
import { Button } from '../components/Button';
import { BottomNavigation } from '../components/BottomNavigation';
import { StatsCard } from '../components/StatsCard';
import { useAccessStore } from '../store/accessStore';
import { useProgressStore } from '../store/progressStore';
import { STAGES, TOTAL_VIDEOS } from '../data/courseData';
import { calcWatchedVideos } from '../utils/progress';

const fmtDate = (iso: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const AccountPage: React.FC = () => {
  const nav = useNavigate();

  const paid = useAccessStore((s) => s.paid);
  const tariff = useAccessStore((s) => s.tariff);
  const price = useAccessStore((s) => s.price);
  const purchaseDate = useAccessStore((s) => s.purchase_date);
  const courseName = useAccessStore((s) => s.course_name);
  const supportLink = useAccessStore((s) => s.support_link);
  const load = useAccessStore((s) => s.load);

  const completed = useProgressStore((s) => s.completedStages);
  const watchedVideos = useProgressStore((s) => s.watchedVideos);
  const totalCorrect = useProgressStore((s) => s.totalCorrectAnswers);
  const totalWrong = useProgressStore((s) => s.totalWrongAnswers);
  const streak = useProgressStore((s) => s.streak);
  const daily = useProgressStore((s) => s.daily);
  const dailyGoal = useProgressStore((s) => s.settings.dailyGoal);

  const watched = useMemo(() => calcWatchedVideos(watchedVideos), [watchedVideos]);
  const percent = Math.round((completed.length / STAGES.length) * 100);
  const watchedPercent = TOTAL_VIDEOS ? Math.round((watched / TOTAL_VIDEOS) * 100) : 0;

  const tariffLabel = tariff === 'premium' ? 'Премиум' : 'Стандарт';
  const TariffIcon = tariff === 'premium' ? Crown : Zap;

  return (
    <div className="min-h-screen pb-32">
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => nav('/')}
            aria-label="Назад"
            className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-white font-bold">Личный кабинет</div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-4 space-y-4">
        {/* Статус подписки */}
        <div className={`rounded-3xl p-5 border ${paid ? 'border-success/30 bg-success/10' : 'border-white/5 bg-card'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paid ? 'bg-success/20 text-success' : 'bg-card-2 text-muted'}`}>
              {paid ? <TariffIcon size={24} /> : <Lock size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-white font-bold">{paid ? 'Доступ к курсу' : 'Доступ не оплачен'}</div>
                {paid && <BadgeCheck size={18} className="text-success shrink-0" />}
              </div>
              <div className="text-muted text-xs mt-0.5">
                {paid ? `${courseName} · тариф «${tariffLabel}» · безлимитный` : `${courseName} · оплата один раз`}
              </div>
            </div>
            <button
              onClick={() => void load()}
              className="text-xs text-primary font-semibold shrink-0"
            >
              Обновить
            </button>
          </div>

          {paid ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-card/70 border border-white/5 p-3 flex items-center gap-2">
                <CreditCard size={16} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-muted text-[10px] uppercase">Оплачено</div>
                  <div className="text-white text-sm font-bold">{price} ₽</div>
                </div>
              </div>
              <div className="rounded-2xl bg-card/70 border border-white/5 p-3 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-muted text-[10px] uppercase">Дата покупки</div>
                  <div className="text-white text-sm font-bold truncate">{fmtDate(purchaseDate)}</div>
                </div>
              </div>
            </div>
          ) : (
            <Button variant="cta" size="lg" full className="mt-4" onClick={() => nav('/paywall')}>
              Оплатить доступ
            </Button>
          )}
        </div>

        {/* Прогресс */}
        {paid && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatsCard label="Пройдено этапов" value={`${completed.length} / ${STAGES.length} · ${percent}%`} icon={<History size={18} />} accent="primary" />
              <StatsCard label="Просмотрено видео" value={`${watched} / ${TOTAL_VIDEOS} · ${watchedPercent}%`} icon={<PlayCircle size={18} />} accent="success" />
              <StatsCard label="Правильные ответы" value={`${totalCorrect}`} icon={<BadgeCheck size={18} />} accent="accent" />
              <StatsCard label="Ошибки" value={`${totalWrong}`} icon={<Lock size={18} />} accent="danger" />
            </div>

            <div className="rounded-2xl bg-card border border-white/5 p-4">
              <div className="text-muted text-xs uppercase tracking-wide">Активность</div>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1 text-muted text-sm">
                  Серия дней: <span className="text-white font-bold">{streak.count} дн.</span>
                </div>
                <div className="flex-1 text-muted text-sm">
                  Сегодня: <span className="text-white font-bold">{daily.count} / {dailyGoal}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Навигация */}
        <div className="space-y-2">
          {paid && (
            <Button variant="success" size="lg" full onClick={() => nav('/course')}>
              <PlayCircle size={18} className="mr-2" />
              Открыть курс
            </Button>
          )}
          <Button variant="ghost" size="lg" full onClick={() => nav('/settings')}>
            <Settings size={18} className="mr-2" />
            Настройки
          </Button>
          <a
            href={supportLink}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <Button variant="ghost" size="lg" full>
              <LifeBuoy size={18} className="mr-2" />
              Поддержка
            </Button>
          </a>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};