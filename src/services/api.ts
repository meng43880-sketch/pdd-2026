/**
 * Клиент для API бота (проверка доступа + оплата-заглушка).
 * Вне Telegram (браузер) работает через VITE_DEV_USER_ID.
 */
import { telegram } from './telegram';

const API_BASE: string = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:10000';

export type Tariff = 'standard' | 'premium';

export interface AccessInfo {
  user_id: number;
  is_paid: boolean;
  tariff: Tariff | null;
  price: number;
  purchase_date: string | null;
  course_name: string;
  standard_price: number;
  premium_price: number;
  support_link: string;
}

function getInitData(): string {
  if (!telegram.isAvailable()) return '';
  try {
    return window.Telegram!.WebApp!.initData ?? '';
  } catch {
    return '';
  }
}

function getUserId(): number | undefined {
  const tg = telegram.getUser();
  if (tg) return tg.id;
  const dev = import.meta.env.VITE_DEV_USER_ID;
  if (dev) {
    const n = Number(dev);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function toSnake(body: Record<string, unknown>): Record<string, unknown> {
  const auth = { init_data: getInitData(), user_id: getUserId() };
  return { ...auth, ...body };
}

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(body)),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) detail = data.error;
    } catch {
      // noop
    }
    throw new Error(detail);
  }

  return (await res.json()) as T;
}

export async function fetchAccess(): Promise<AccessInfo> {
  return request<AccessInfo>('/api/me', {});
}

export async function payAccess(tariff: Tariff): Promise<AccessInfo> {
  return request<AccessInfo>('/api/pay', { tariff });
}