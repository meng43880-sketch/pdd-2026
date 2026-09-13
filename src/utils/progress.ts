import { STAGES, TOTAL_VIDEOS } from '../data/courseData';

export interface TestResult {
  stageId: number;
  correct: number;
  total: number;
  percent: number;
  wrongQuestionIds: string[];
  passed: boolean;
  date: number;
}

export function calcWatchedVideos(watchedVideos: Record<number, string[]>): number {
  return Object.values(watchedVideos).reduce((sum, arr) => sum + arr.length, 0);
}

export function calcVideoPercent(watched: number): number {
  if (TOTAL_VIDEOS === 0) return 0;
  return Math.round((watched / TOTAL_VIDEOS) * 100);
}

export function calcStageProgress(completedStages: number[]): number {
  return Math.round((completedStages.length / STAGES.length) * 100);
}
