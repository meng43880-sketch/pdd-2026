import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, BarChart3, Map, Settings, X, Shapes, GraduationCap, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

const items = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/course', icon: Map, label: 'Этапы' },
  { path: '/signs', icon: Shapes, label: 'Знаки' },
  { path: '/exam', icon: GraduationCap, label: 'Экзамен' },
  { path: '/memo', icon: BookOpen, label: 'Памятка' },
  { path: '/statistics', icon: BarChart3, label: 'Мой прогресс' },
  { path: '/settings', icon: Settings, label: 'Настройки' },
];

export const SideMenu: React.FC<Props> = ({ open, onClose }) => {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-white/5 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4">
              <div className="text-white font-bold">Меню</div>
              <button
                onClick={onClose}
                aria-label="Закрыть меню"
                className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center"
              >
                <X size={18} className="text-muted" />
              </button>
            </div>

            <div className="px-3 space-y-1">
              {items.map((it) => {
                const Icon = it.icon;
                const active = loc.pathname === it.path;
                return (
                  <button
                    key={it.path}
                    onClick={() => {
                      nav(it.path);
                      onClose();
                    }}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition',
                      active ? 'bg-card-2 text-white' : 'text-white/90 hover:bg-card-2',
                    ].join(' ')}
                  >
                    <Icon size={20} className={active ? 'text-accent' : 'text-primary'} />
                    <span className="text-sm font-medium">{it.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto p-4 border-t border-white/5">
              <div className="text-white font-bold">ПДД 2026</div>
              <div className="text-muted text-xs">Полный курс</div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
