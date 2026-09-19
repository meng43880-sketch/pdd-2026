import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Zap, Crown, Check, RefreshCw, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Confetti } from '../components/Confetti';
import { StatsCard } from '../components/StatsCard';
import { useAccessStore } from '../store/accessStore';
import { telegram } from '../services/telegram';
import type { Tariff } from '../services/api';

const FEATURES: Record<Tariff, string[]> = {
  standard: ['50+ видеоуроков', '1000+ тестовых заданий', 'Разбор реальных билетов', 'Доступ навсегда'],
  premium: ['Всё из тарифа «Стандарт»', 'Личный разбор ошибок', 'Приоритетная поддержка', 'Экзамен-тренажёр'],
};

export const Paywall: React.FC = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();

  const status = useAccessStore((s) => s.status);
  const courseName = useAccessStore((s) => s.course_name);
  const standardPrice = useAccessStore((s) => s.standard_price);
  const premiumPrice = useAccessStore((s) => s.premium_price);
  const supportLink = useAccessStore((s) => s.support_link);
  const error = useAccessStore((s) => s.error);
  const pay = useAccessStore((s) => s.pay);
  const load = useAccessStore((s) => s.load);

  const initialTariff = useMemo(() => (params.get('tariff') === 'premium' ? 'premium' : 'standard'), [params]);
  const [tariff, setTariff] = useState<Tariff>(initialTariff);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'error') void load();
  }, [status, load]);

  if (status === 'paid') {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-success/20 flex items-center justify-center">
            <Check size={32} className="text-success" />
          </div>
          <div className="text-2xl font-black">Доступ уже активен</div>
          <div className="text-muted text-sm">Твой курс оплачен, можно начинать!</div>
          <div className="mt-4 w-full max-w-[320px]">
            <Button variant="success" size="lg" full onClick={() => nav('/')}>
              Открыть курс
            </Button>
          </div>
        </div>
        <SuccessModal open={success} onClose={() => setSuccess(false)} onDone={() => nav('/')} />
      </>
    );
  }

  const price = tariff === 'premium' ? premiumPrice : standardPrice;

  const handlePay = async () => {
    setPaying(true);
    setPayError('');
    const ok = await pay(tariff);
    setPaying(false);
    if (ok) {
      telegram.haptic('success');
      setSuccess(true);
    } else {
      telegram.haptic('error');
      setPayError(useAccessStore.getState().error || 'Оплата не прошла. Попробуй ещё раз.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col flex-1 px-5 pb-10 pt-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-cta/20 flex items-center justify-center">
            <Lock size={28} className="text-cta" />
          </div>
          <h1 className="text-3xl font-black mt-4 tracking-tight">{courseName}</h1>
          <div className="text-muted mt-2 text-sm leading-relaxed">
            Доступ к курсу открывается сразу после оплаты.<br />
            Ниже выбери подходящий тариф.
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {(['standard', 'premium'] as Tariff[]).map((key) => {
            const p = key === 'premium' ? premiumPrice : standardPrice;
            const active = tariff === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTariff(key);
                  setPayError('');
                  telegram.haptic('tap');
                }}
                className={[
                  'w-full text-left rounded-3xl border p-5 transition',
                  active
                    ? 'bg-card border-cta shadow-xl shadow-cta/10'
                    : 'bg-card border-white/5',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${active ? 'bg-cta/20 text-cta' : 'bg-card-2 text-primary'}`}>
                      {key === 'premium' ? <Crown size={22} /> : <Zap size={22} />}
                    </div>
                    <div>
                      <div className="text-white font-bold">
                        {key === 'premium' ? 'Премиум' : 'Стандарт'}
                      </div>
                      <div className="text-muted text-xs">Один раз · доступ навсегда</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={active ? 'text-cta font-black text-lg' : 'text-white font-bold text-lg'}>
                      {p} ₽
                    </div>
                  </div>
                </div>

                <div className={`mt-3 grid grid-cols-2 gap-1.5 ${active ? '' : 'opacity-70'}`}>
                  {FEATURES[key].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted">
                      <Check size={14} className="text-success shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {payError !== '' && (
          <div className="mt-4 text-center text-danger text-sm bg-danger/10 rounded-2xl py-3 px-4">
            {payError}
          </div>
        )}

        <div className="mt-6">
          <Button variant="cta" size="lg" full disabled={paying} onClick={handlePay}>
            {paying ? 'Оплачиваем…' : `Оплатить ${price} ₽`}
          </Button>
          <div className="text-muted text-xs text-center mt-2">
            Демо-оплата: кнопка «Оплатить» сразу активирует доступ.
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={() => void load()}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted py-2"
          >
            <RefreshCw size={16} className="text-primary" />
            Я уже оплатил — проверить доступ
          </button>
          <a
            href={supportLink}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 text-sm text-muted py-2"
          >
            <LifeBuoy size={16} className="text-primary" />
            Вопросы по оплате
          </a>
        </div>
      </div>

      <SuccessModal open={success} onClose={() => setSuccess(false)} onDone={() => nav('/')} />
    </div>
  );
};

const SuccessModal: React.FC<{ open: boolean; onClose: () => void; onDone: () => void }> = ({ open, onClose, onDone }) => (
  <Modal open={open} onClose={onClose}>
    <div className="relative text-center">
      <div className="pointer-events-none absolute inset-0">
        <Confetti trigger={open} />
      </div>
      <div className="w-16 h-16 mx-auto rounded-3xl bg-success/20 flex items-center justify-center">
        <Check size={30} className="text-success" />
      </div>
      <div className="text-2xl font-black text-white mt-4">Оплачено!</div>
      <div className="text-muted text-sm mt-2 leading-relaxed">
        Деньги списаны (демо-заглушка).<br />
        Доступ к курсу активирован. Можно начинать обучение!
      </div>
      <div className="mt-5 space-y-2">
        <Button variant="success" size="lg" full onClick={onDone}>
          Начать обучение
        </Button>
        <button onClick={onClose} className="text-muted text-sm py-1 w-full">
          Закрыть
        </button>
      </div>
    </div>
  </Modal>
);

// Небольшая сводка, используемая в личном кабинете
export const AccessSummary: React.FC = () => {
  const standardPrice = useAccessStore((s) => s.standard_price);
  const premiumPrice = useAccessStore((s) => s.premium_price);
  const courseName = useAccessStore((s) => s.course_name);
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatsCard label="Стандарт" value={`${standardPrice} ₽`} icon={<Zap size={18} />} accent="primary" />
      <StatsCard label="Премиум" value={`${premiumPrice} ₽`} icon={<Crown size={18} />} accent="accent" />
      <div className="col-span-2 text-muted text-xs">
        {courseName} · оплата один раз · доступ навсегда
      </div>
    </div>
  );
};