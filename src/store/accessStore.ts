import { create } from 'zustand';
import { fetchAccess, payAccess, getUserId, type AccessInfo, type Tariff } from '../services/api';

// Локальная «заглушка» оплаты: доступ выдаётся мгновенно и переживает перезагрузку
// даже без связи с бэкендом (демо-режим оплаты).
const GRANT_KEY = 'pdd_access_grant_v1';

interface LocalGrant {
  paid: true;
  tariff: Tariff;
  price: number;
  purchase_date: string;
  user_id: number | null;
}

function readGrant(): LocalGrant | null {
  try {
    const raw = localStorage.getItem(GRANT_KEY);
    if (!raw) return null;
    const g = JSON.parse(raw) as LocalGrant;
    if (!g || g.paid !== true) return null;
    return g;
  } catch {
    return null;
  }
}

function writeGrant(g: LocalGrant): void {
  try {
    localStorage.setItem(GRANT_KEY, JSON.stringify(g));
  } catch {
    // ignore
  }
}

export type AccessStatus = 'checking' | 'paid' | 'unpaid' | 'error';

interface AccessState {
  status: AccessStatus;
  user_id: number | null;
  tariff: Tariff | null;
  price: number;
  purchase_date: string | null;
  course_name: string;
  standard_price: number;
  premium_price: number;
  support_link: string;
  error: string;
  paid: boolean;
  load: () => Promise<void>;
  pay: (tariff: Tariff) => Promise<boolean>;
  setUnavailable: () => void;
}

const empty: AccessInfo = {
  user_id: 0,
  is_paid: false,
  tariff: null,
  price: 0,
  purchase_date: null,
  course_name: 'Курс ПДД',
  standard_price: 1990,
  premium_price: 2990,
  support_link: 'https://t.me/your_support_bot',
};

function apply(state: AccessState, data: AccessInfo): Pick<
  AccessState,
  'status' | 'paid' | 'user_id' | 'tariff' | 'price' | 'purchase_date' | 'course_name' | 'standard_price' | 'premium_price' | 'support_link' | 'error'
> {
  return {
    status: data.is_paid ? 'paid' : 'unpaid',
    paid: data.is_paid,
    user_id: data.user_id,
    tariff: data.tariff,
    price: data.price,
    purchase_date: data.purchase_date,
    course_name: data.course_name,
    standard_price: data.standard_price,
    premium_price: data.premium_price,
    support_link: data.support_link,
    error: '',
  };
}

export const useAccessStore = create<AccessState>((set, get) => {
  const devBypass = import.meta.env.VITE_DEV_BYPASS_PAYWALL === 'true';

  return {
    ...empty,
    status: devBypass ? 'paid' : 'checking',
    paid: devBypass,
    error: '',

    load: async () => {
      if (import.meta.env.VITE_DEV_BYPASS_PAYWALL === 'true') {
        set({ status: 'paid', paid: true });
        return;
      }
      set({ status: 'checking', error: '' });
      try {
        const data = await fetchAccess();
        if (data.is_paid) {
          set(apply(get(), data));
          return;
        }
        const grant = readGrant();
        if (grant) {
          // Бэкенд говорит «не оплачено», но на этом устройстве оплата уже активирована
          set({
            ...apply(get(), data),
            status: 'paid',
            paid: true,
            tariff: grant.tariff,
            price: grant.price,
            purchase_date: grant.purchase_date,
            user_id: grant.user_id ?? data.user_id,
            error: '',
          });
        } else {
          set({ ...apply(get(), data), status: 'unpaid', paid: false, error: '' });
        }
      } catch (e) {
        const grant = readGrant();
        if (grant) {
          set({
            status: 'paid',
            paid: true,
            tariff: grant.tariff,
            price: grant.price,
            purchase_date: grant.purchase_date,
            user_id: grant.user_id ?? get().user_id,
            error: '',
          });
        } else {
          set({ status: 'error', error: e instanceof Error ? e.message : 'Не удалось проверить доступ' });
        }
      }
    },

    pay: async (tariff) => {
      if (import.meta.env.VITE_DEV_BYPASS_PAYWALL === 'true') {
        set({ status: 'paid', paid: true, tariff, price: tariff === 'premium' ? get().premium_price : get().standard_price });
        return true;
      }
      // Демо-оплата: открываем доступ сразу, не дожидаясь ответа бэкенда.
      const price = tariff === 'premium' ? get().premium_price : get().standard_price;
      const grant: LocalGrant = {
        paid: true,
        tariff,
        price,
        purchase_date: new Date().toISOString(),
        user_id: getUserId() ?? null,
      };
      writeGrant(grant);
      set({
        status: 'paid',
        paid: true,
        tariff,
        price,
        purchase_date: grant.purchase_date,
        user_id: grant.user_id ?? get().user_id,
        error: '',
      });
      // Бэкенд синхронизируем в фоне — его сбой не отменяет выданный доступ.
      try {
        const data = await payAccess(tariff);
        set(apply(get(), data));
      } catch {
        // ignore: доступ уже выдан локально
      }
      return true;
    },

    setUnavailable: () => set({ status: 'error', error: 'Не удалось проверить доступ' }),
  };
});