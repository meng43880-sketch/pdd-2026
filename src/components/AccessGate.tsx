import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Paywall } from '../pages/Paywall';
import { useAccessStore } from '../store/accessStore';

const FullLoader: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6">
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity }}
      className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center"
    >
      <Lock size={22} className="text-primary" />
    </motion.div>
    <div className="text-white font-semibold">Проверяем доступ к курсу…</div>
    <div className="text-muted text-sm">Секунду</div>
  </div>
);

const ErrorScreen: React.FC<{ message: string }> = ({ message }) => {
  const load = useAccessStore((s) => s.load);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-danger/15 flex items-center justify-center">
        <Lock size={24} className="text-danger" />
      </div>
      <div className="text-white font-bold text-lg">Не удалось проверить доступ</div>
      <div className="text-muted text-sm">{message}</div>
      <div className="mt-3 w-full max-w-[260px]">
        <Button full onClick={() => void load()}>
          <RefreshCw size={16} className="mr-2" />
          Повторить
        </Button>
      </div>
    </div>
  );
};

/**
 * Пропускает к содержимому только после подтверждения оплаты.
 * Без оплаты показывает Paywall — доступа к курсу нет.
 */
export const AccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = useAccessStore((s) => s.status);
  const error = useAccessStore((s) => s.error);
  const load = useAccessStore((s) => s.load);

  useEffect(() => {
    if (status === 'checking') void load();
  }, [status, load]);

  if (status === 'checking') return <FullLoader />;
  if (status === 'error') return <ErrorScreen message={error} />;
  if (status !== 'paid') return <Paywall />;
  return <>{children}</>;
};