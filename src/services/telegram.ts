/**
 * Сервис-слой для интеграции с Telegram WebApp.
 * Приложение работает и без Telegram.
 */

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export const telegram = {
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  },

  init() {
    if (!this.isAvailable()) return;
    try {
      const wa = window.Telegram!.WebApp!;
      wa.ready();
      wa.expand();
      wa.setHeaderColor?.('#07111F');
      wa.setBackgroundColor?.('#07111F');
    } catch {
      // noop
    }
  },

  getUser(): { id: number; name: string } | null {
    if (!this.isAvailable()) return null;
    const u = window.Telegram!.WebApp!.initDataUnsafe?.user;
    if (!u) return null;
    return {
      id: u.id,
      name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Гость',
    };
  },

  haptic(type: 'success' | 'error' | 'tap' = 'tap') {
    if (!this.isAvailable()) return;
    const h = window.Telegram!.WebApp!.HapticFeedback;
    if (!h) return;
    if (type === 'tap') h.impactOccurred('light');
    else h.notificationOccurred(type);
  },
};
