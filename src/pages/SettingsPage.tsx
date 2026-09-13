import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Volume2, Wand2, Trash2, Vibrate, ListOrdered, FastForward,
  EyeOff, Type, Target, Download, Upload, RotateCcw, Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BottomNavigation } from '../components/BottomNavigation';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { useProgressStore } from '../store/progressStore';
import { STAGES, TOTAL_VIDEOS, TOTAL_QUESTIONS } from '../data/courseData';
import { SIGNS } from '../data/signs';

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; hint?: string; icon: React.ReactNode }> = ({
  value,
  onChange,
  label,
  hint,
  icon,
}) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-white/5">
    <div className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-white text-sm font-medium">{label}</div>
      {hint && <div className="text-muted text-xs mt-0.5">{hint}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      aria-label={label}
      className={[
        'w-12 h-7 rounded-full transition relative shrink-0',
        value ? 'bg-success' : 'bg-card-2',
      ].join(' ')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-6 h-6 bg-white rounded-full"
        style={{ left: value ? 22 : 2 }}
      />
    </button>
  </div>
);

function Segmented<T extends string | number>({ options, value, onChange }: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={[
            'flex-1 px-3 py-2.5 rounded-2xl text-sm font-semibold border transition',
            value === o.value
              ? 'bg-primary border-primary text-white'
              : 'bg-card border-white/5 text-muted',
          ].join(' ')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <div className="text-muted text-xs uppercase tracking-wide mb-2 px-1">{title}</div>
    <div className="space-y-2">{children}</div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const nav = useNavigate();
  const settings = useProgressStore((s) => s.settings);
  const setSetting = useProgressStore((s) => s.setSetting);
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const resetStage = useProgressStore((s) => s.resetStage);
  const importProgress = useProgressStore((s) => s.importProgress);

  const [resetOpen, setResetOpen] = useState(false);
  const [stageToReset, setStageToReset] = useState('1');
  const [stageMsg, setStageMsg] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const s = useProgressStore.getState();
    const payload = {
      completedStages: s.completedStages,
      currentStage: s.currentStage,
      watchedVideos: s.watchedVideos,
      testResults: s.testResults,
      totalCorrectAnswers: s.totalCorrectAnswers,
      totalWrongAnswers: s.totalWrongAnswers,
      settings: s.settings,
      streak: s.streak,
      daily: s.daily,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pdd-2026-progress.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const handleImportFile = async (f: File | undefined) => {
    setImportMsg('');
    if (!f) return;
    try {
      const text = await f.text();
      const ok = importProgress(JSON.parse(text));
      setImportMsg(ok ? 'Прогресс восстановлен!' : 'Не получилось: файл не похож на сохранение.');
    } catch {
      setImportMsg('Не получилось прочитать файл.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleResetStage = () => {
    const id = Number(stageToReset);
    resetStage(id);
    const st = STAGES.find((x) => x.id === id);
    setStageMsg(`Этап ${id}${st ? ` «${st.title}»` : ''} сброшен.`);
  };

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
          <div className="text-white font-bold">Настройки</div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-4 space-y-5">
        <Section title="Тесты">
          <div className="rounded-2xl bg-card border border-white/5 p-4 space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center text-primary shrink-0">
                <ListOrdered size={18} />
              </div>
              <div className="text-white text-sm font-medium">Вопросов в тесте</div>
            </div>
            <Segmented
              options={[
                { value: 10, label: '10' },
                { value: 15, label: '15' },
                { value: 0, label: 'Все' },
              ]}
              value={settings.questionsPerQuiz}
              onChange={(v) => setSetting('questionsPerQuiz', v)}
            />
          </div>
          <Toggle
            value={settings.autoNext}
            onChange={(v) => setSetting('autoNext', v)}
            label="Автопереход дальше"
            hint="Сам листает к следующему вопросу после ответа"
            icon={<FastForward size={18} />}
          />
          <Toggle
            value={settings.strictMode}
            onChange={(v) => setSetting('strictMode', v)}
            label="Строгий режим"
            hint="Не подсвечивать правильность до конца теста"
            icon={<EyeOff size={18} />}
          />
        </Section>

        <Section title="Оформление">
          <div className="rounded-2xl bg-card border border-white/5 p-4 space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center text-primary shrink-0">
                <Type size={18} />
              </div>
              <div className="text-white text-sm font-medium">Размер текста</div>
            </div>
            <Segmented
              options={[
                { value: 'normal', label: 'Обычный' },
                { value: 'large', label: 'Крупный' },
              ]}
              value={settings.fontScale}
              onChange={(v) => setSetting('fontScale', v)}
            />
          </div>
          <Toggle
            value={settings.animations}
            onChange={(v) => setSetting('animations', v)}
            label="Анимации"
            hint="Плавные переходы и эффекты"
            icon={<Wand2 size={18} />}
          />
        </Section>

        <Section title="Звук и вибрация">
          <Toggle
            value={settings.sound}
            onChange={(v) => setSetting('sound', v)}
            label="Звук"
            hint="Сигналы правильных и неверных ответов"
            icon={<Volume2 size={18} />}
          />
          <Toggle
            value={settings.vibration}
            onChange={(v) => setSetting('vibration', v)}
            label="Вибрация"
            hint="Короткий отклик при ответе"
            icon={<Vibrate size={18} />}
          />
        </Section>

        <Section title="Дневная цель">
          <div className="rounded-2xl bg-card border border-white/5 p-4 space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center text-primary shrink-0">
                <Target size={18} />
              </div>
              <div className="text-white text-sm font-medium">Вопросов в день</div>
            </div>
            <Segmented
              options={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 30, label: '30' },
              ]}
              value={settings.dailyGoal}
              onChange={(v) => setSetting('dailyGoal', v)}
            />
          </div>
        </Section>

        <Section title="Данные">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="rounded-2xl bg-card border border-white/5 px-4 py-3 flex items-center justify-center gap-2 text-sm text-white font-medium"
            >
              <Download size={16} className="text-primary" />
              Сохранить копию
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-2xl bg-card border border-white/5 px-4 py-3 flex items-center justify-center gap-2 text-sm text-white font-medium"
            >
              <Upload size={16} className="text-primary" />
              Восстановить
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void handleImportFile(e.target.files?.[0])}
          />
          {importMsg !== '' && (
            <div className="text-xs text-center text-muted">{importMsg}</div>
          )}
          <div className="rounded-2xl bg-card border border-white/5 p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center text-primary shrink-0">
                <RotateCcw size={18} />
              </div>
              <div className="text-white text-sm font-medium">Сбросить один этап</div>
            </div>
            <div className="flex gap-2">
              <select
                value={stageToReset}
                onChange={(e) => {
                  setStageToReset(e.target.value);
                  setStageMsg('');
                }}
                className="flex-1 rounded-xl bg-card-2 border border-white/5 px-3 py-2.5 text-sm text-white outline-none"
              >
                {STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    Этап {st.id}. {st.title}
                  </option>
                ))}
              </select>
              <Button variant="ghost" onClick={handleResetStage}>
                Сбросить
              </Button>
            </div>
            {stageMsg !== '' && (
              <div className="text-success text-xs">{stageMsg}</div>
            )}
          </div>
          <button
            onClick={() => setResetOpen(true)}
            className="w-full rounded-2xl bg-danger/15 border border-danger/40 px-4 py-4 flex items-center gap-3 text-danger font-semibold"
          >
            <Trash2 size={18} />
            Сбросить весь прогресс
          </button>
        </Section>

        <Section title="О приложении">
          <div className="rounded-2xl bg-card border border-white/5 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center text-primary shrink-0">
              <Info size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-bold">ПДД 2026 — Полный курс</div>
              <div className="text-muted text-xs mt-0.5">
                v1.0 · {STAGES.length} этапов · {TOTAL_VIDEOS} видео · {TOTAL_QUESTIONS} вопросов · {SIGNS.length} знаков
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)}>
        <div className="space-y-4">
          <div className="text-white text-lg font-bold">Сбросить весь прогресс?</div>
          <div className="text-muted text-sm">
            Все просмотренные видео, результаты тестов и открытые этапы будут удалены.
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" full onClick={() => setResetOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              full
              onClick={() => {
                resetProgress();
                setResetOpen(false);
                nav('/');
              }}
            >
              Сбросить
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNavigation />
    </div>
  );
};
