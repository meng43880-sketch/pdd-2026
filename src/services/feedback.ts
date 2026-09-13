/**
 * Звук (WebAudio, без файлов) и вибрация для ответов.
 * Настройки берутся из стора; вне Telegram и без разрешения — тихо ничего не делают.
 */
import { useProgressStore } from '../store/progressStore';
import { telegram } from './telegram';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, delayMs: number, durMs: number, type: OscillatorType = 'sine', gain = 0.06) {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + delayMs / 1000;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + durMs / 1000 + 0.05);
  } catch {
    // noop
  }
}

function soundOn(): boolean {
  try {
    return useProgressStore.getState().settings.sound;
  } catch {
    return false;
  }
}

/** Короткий нейтральный клик (нажатие, строгий режим) */
export function playTap() {
  if (!soundOn()) return;
  tone(620, 0, 70, 'sine', 0.05);
}

/** Правильный ответ — две восходящие ноты */
export function playCorrect() {
  if (!soundOn()) return;
  tone(523, 0, 120);
  tone(784, 110, 160);
}

/** Неправильный ответ — низкий сигнал */
export function playWrong() {
  if (!soundOn()) return;
  tone(220, 0, 200, 'sawtooth', 0.04);
  tone(174, 150, 240, 'sawtooth', 0.04);
}

/** Короткая вибрация при ответе (одинаковая, чтобы не подсказывать) */
export function buzz() {
  try {
    if (!useProgressStore.getState().settings.vibration) return;
    if (telegram.isAvailable()) return; // в Telegram работает свой haptic
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    navigator.vibrate(25);
  } catch {
    // noop
  }
}
