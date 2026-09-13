import React from 'react';

interface Props {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: 'primary' | 'success' | 'accent' | 'danger';
}

const accentMap = {
  primary: 'text-primary',
  success: 'text-success',
  accent: 'text-accent',
  danger: 'text-danger',
};

export const StatsCard: React.FC<Props> = ({ label, value, icon, accent = 'primary' }) => (
  <div className="rounded-2xl bg-card border border-white/5 p-4 flex items-center gap-3">
    {icon && (
      <div className={`w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center ${accentMap[accent]}`}>
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="text-muted text-xs">{label}</div>
      <div className="text-lg font-bold text-white truncate">{value}</div>
    </div>
  </div>
);
