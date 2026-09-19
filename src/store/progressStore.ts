import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TestResult } from '../utils/progress';

export interface DayStreak {
  count: number;
  lastDate: string | null; // 'YYYY-MM-DD'
}

export interface DailyProgress {
  date: string; // 'YYYY-MM-DD'
  count: number; // отвечено вопросов сегодня
}

export interface AppSettings {
  sound: boolean;
  vibration: boolean;
  animations: boolean;
  questionsPerQuiz: number; // 0 = все вопросы этапа
  autoNext: boolean;
  strictMode: boolean;
  fontScale: 'normal' | 'large';
  dailyGoal: number; // вопросов в день
}

export interface UserProgress {
  completedStages: number[];
  currentStage: number;
  watchedVideos: Record<number, string[]>;
  testResults: Record<number, TestResult>;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  settings: AppSettings;
  streak: DayStreak;
  daily: DailyProgress;
}

interface ProgressState extends UserProgress {
  // actions
  markVideoWatched: (stageId: number, videoId: string) => void;
  isVideoWatched: (stageId: number, videoId: string) => boolean;
  areAllVideosWatched: (stageId: number) => boolean;
  submitQuiz: (stageId: number, result: TestResult) => void;
  completeStage: (stageId: number) => void;
  isStageUnlocked: (stageId: number) => boolean;
  isStageCompleted: (stageId: number) => boolean;
  resetProgress: () => void;
  setSetting: <K extends keyof UserProgress['settings']>(
    key: K,
    value: UserProgress['settings'][K]
  ) => void;
  registerAnswer: () => void;
  resetStage: (stageId: number) => void;
  importProgress: (data: unknown) => boolean;
}

const initial: UserProgress = {
  completedStages: [],
  currentStage: 1,
  watchedVideos: {},
  testResults: {},
  totalCorrectAnswers: 0,
  totalWrongAnswers: 0,
  settings: {
    sound: true,
    vibration: true,
    animations: true,
    questionsPerQuiz: 0,
    autoNext: false,
    strictMode: false,
    fontScale: 'normal',
    dailyGoal: 10,
  },
  streak: { count: 0, lastDate: null },
  daily: { date: '', count: 0 },
};

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function isValidStreak(v: unknown): v is DayStreak {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return typeof s.count === 'number' && (s.lastDate === null || typeof s.lastDate === 'string');
}

function isValidDaily(v: unknown): v is DailyProgress {
  if (!v || typeof v !== 'object') return false;
  const d = v as Record<string, unknown>;
  return typeof d.date === 'string' && typeof d.count === 'number';
}

function sanitizeProgress(data: unknown): UserProgress | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.completedStages) || typeof d.watchedVideos !== 'object' || d.watchedVideos === null) return null;
  if (typeof d.testResults !== 'object' || d.testResults === null) return null;
  const s = (d.settings ?? {}) as Record<string, unknown>;
  // Пересчитываем итоги по результатам, чтобы импорт не привёз накрутки
  const testResults = d.testResults as Record<number, TestResult>;
  let correct = 0;
  let wrong = 0;
  for (const r of Object.values(testResults)) {
    if (r && typeof r.correct === 'number' && typeof r.total === 'number') {
      correct += r.correct;
      wrong += r.total - r.correct;
    }
  }
  return {
    completedStages: (d.completedStages as unknown[]).filter((x): x is number => typeof x === 'number'),
    currentStage: typeof d.currentStage === 'number' ? d.currentStage : 1,
    watchedVideos: d.watchedVideos as Record<number, string[]>,
    testResults,
    totalCorrectAnswers: correct,
    totalWrongAnswers: wrong,
    settings: {
      ...initial.settings,
      ...(typeof s.sound === 'boolean' ? { sound: s.sound } : {}),
      ...(typeof s.vibration === 'boolean' ? { vibration: s.vibration } : {}),
      ...(typeof s.animations === 'boolean' ? { animations: s.animations } : {}),
      ...(typeof s.questionsPerQuiz === 'number' ? { questionsPerQuiz: s.questionsPerQuiz } : {}),
      ...(typeof s.autoNext === 'boolean' ? { autoNext: s.autoNext } : {}),
      ...(typeof s.strictMode === 'boolean' ? { strictMode: s.strictMode } : {}),
      ...(s.fontScale === 'large' || s.fontScale === 'normal' ? { fontScale: s.fontScale } : {}),
      ...(typeof s.dailyGoal === 'number' && s.dailyGoal > 0 ? { dailyGoal: s.dailyGoal } : {}),
    },
    streak: isValidStreak(d.streak) ? d.streak : initial.streak,
    daily: isValidDaily(d.daily) ? d.daily : initial.daily,
  };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      markVideoWatched: (stageId, videoId) =>
        set((state) => {
          const list = state.watchedVideos[stageId] ?? [];
          if (list.includes(videoId)) return state;
          return {
            ...state,
            watchedVideos: {
              ...state.watchedVideos,
              [stageId]: [...list, videoId],
            },
          };
        }),

      isVideoWatched: (stageId, videoId) => {
        const list = get().watchedVideos[stageId] ?? [];
        return list.includes(videoId);
      },

      areAllVideosWatched: (stageId) => {
        // Не требует STAGES внутри, чтобы не создавать цикл.
        const list = get().watchedVideos[stageId] ?? [];
        return list.length >= 20;
      },

      submitQuiz: (stageId, result) =>
        set((state) => {
          // Итоги считаем по последней попытке каждого этапа, чтобы пересдачи не накручивали счётчики
          const prev = state.testResults[stageId];
          const prevCorrect = prev?.correct ?? 0;
          const prevWrong = prev ? prev.total - prev.correct : 0;
          return {
            ...state,
            testResults: { ...state.testResults, [stageId]: result },
            totalCorrectAnswers: state.totalCorrectAnswers - prevCorrect + result.correct,
            totalWrongAnswers: state.totalWrongAnswers - prevWrong + (result.total - result.correct),
          };
        }),

      completeStage: (stageId) =>
        set((state) => {
          if (state.completedStages.includes(stageId)) return state;
          const next = stageId + 1;
          return {
            ...state,
            completedStages: [...state.completedStages, stageId],
            currentStage: next <= 40 ? next : state.currentStage,
          };
        }),

      isStageUnlocked: () => true,

      isStageCompleted: (stageId) => get().completedStages.includes(stageId),

      resetProgress: () => set(() => ({ ...initial })),

      setSetting: (key, value) =>
        set((state) => ({
          ...state,
          settings: { ...state.settings, [key]: value },
        })),

      registerAnswer: () =>
        set((state) => {
          const today = dayKey(new Date());
          const dailyBase = state.daily.date === today ? state.daily : { date: today, count: 0 };
          let streak = state.streak;
          if (streak.lastDate !== today) {
            const yesterday = dayKey(new Date(Date.now() - 86400000));
            streak = {
              count: streak.lastDate === yesterday ? streak.count + 1 : 1,
              lastDate: today,
            };
          }
          return {
            ...state,
            daily: { date: today, count: dailyBase.count + 1 },
            streak,
          };
        }),

      resetStage: (stageId) =>
        set((state) => {
          const prev = state.testResults[stageId];
          const watched = { ...state.watchedVideos };
          delete watched[stageId];
          const results = { ...state.testResults };
          delete results[stageId];
          return {
            ...state,
            completedStages: state.completedStages.filter((id) => id !== stageId),
            watchedVideos: watched,
            testResults: results,
            totalCorrectAnswers: state.totalCorrectAnswers - (prev?.correct ?? 0),
            totalWrongAnswers: state.totalWrongAnswers - (prev ? prev.total - prev.correct : 0),
          };
        }),

      importProgress: (data) => {
        const clean = sanitizeProgress(data);
        if (!clean) return false;
        set(() => ({ ...clean }));
        return true;
      },
    }),
    {
      name: 'pdd_course_progress',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Старые сохранения (v1): переносим понятные настройки, остальное — по умолчанию
      migrate: (persisted) => {
        const clean = sanitizeProgress(persisted);
        if (clean) return { ...clean } as UserProgress;
        return { ...initial };
      },
    }
  )
);
