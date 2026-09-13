import React from 'react';

interface Props {
  title: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'success' | 'danger' | 'accent';
}

const toneCls: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-white',
  success: 'text-success',
  danger: 'text-danger',
  accent: 'text-accent',
};

export const ResultCard: React.FC<Props> = ({ title, value, sub, tone = 'default' }) => (
  <div className="rounded-2xl bg-card border border-white/5 p-4">
    <div className="text-muted text-xs uppercase tracking-wide">{title}</div>
    <div className={`text-2xl font-bold mt-1 ${toneCls[tone]}`}>{value}</div>
    {sub && <div className="text-muted text-xs mt-1">{sub}</div>}
  </div>
);
