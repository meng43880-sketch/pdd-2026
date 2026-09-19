import { create } from 'zustand';
import { fetchAccess, payAccess, type AccessInfo, type Tariff } from '../services/api';

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
        set(apply(get(), data));
      } catch (e) {
        set({ status: 'error', error: e instanceof Error ? e.message : 'Не удалось проверить доступ' });
      }
    },

    pay: async (tariff) => {
      if (import.meta.env.VITE_DEV_BYPASS_PAYWALL === 'true') {
        set({ status: 'paid', paid: true, tariff, price: tariff === 'premium' ? get().premium_price : get().standard_price });
        return true;
      }
      try {
        const data = await payAccess(tariff);
        set(apply(get(), data));
        return data.is_paid;
      } catch (e) {
        set({ status: 'error', error: e instanceof Error ? e.message : 'Оплата не прошла' });
        return false;
      }
    },

    setUnavailable: () => set({ status: 'error', error: 'Не удалось проверить доступ' }),
  };
});