import React from 'react';
import { Home, Map, BarChart3, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/course', icon: Map, label: 'Этапы' },
  { path: '/statistics', icon: BarChart3, label: 'Статистика' },
  { path: '/settings', icon: Settings, label: 'Настройки' },
];

export const BottomNavigation: React.FC = () => {
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <nav
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 pt-2 z-40"
    >
      <div className="glass rounded-3xl border border-white/5 flex items-center justify-around px-2 py-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = loc.pathname === t.path;
          return (
            <button
              key={t.path}
              onClick={() => nav(t.path)}
              aria-label={t.label}
              className={[
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition min-w-[64px]',
                active ? 'text-primary' : 'text-muted',
              ].join(' ')}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
