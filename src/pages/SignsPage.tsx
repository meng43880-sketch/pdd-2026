import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { SIGNS } from '../data/signs';
import { BottomNavigation } from '../components/BottomNavigation';

const CATEGORY_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const SignsPage: React.FC = () => {
  const nav = useNavigate();
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of SIGNS) {
      if (!map.has(s.categoryKey)) map.set(s.categoryKey, s.category);
    }
    return CATEGORY_ORDER.filter((k) => map.has(k)).map((k) => ({
      key: k,
      name: map.get(k)!,
    }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SIGNS.filter((s) => {
      if (category !== 'all' && s.categoryKey !== category) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.number.includes(q);
    });
  }, [category, query]);

  return (
    <div className="min-h-screen pb-32">
      {/* Top bar */}
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => nav('/')}
            aria-label="Назад"
            className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-white font-bold">Знаки</div>
          <div className="ml-auto text-muted text-xs">{filtered.length}</div>
        </div>
        <div className="max-w-[560px] mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 rounded-2xl bg-card border border-white/5 px-3">
            <Search size={16} className="text-muted shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти знак: название или номер"
              className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-muted/60 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-3">
        {/* Категории */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          <button
            onClick={() => setCategory('all')}
            className={[
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition',
              category === 'all'
                ? 'bg-primary border-primary text-white'
                : 'bg-card border-white/5 text-muted',
            ].join(' ')}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={[
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition',
                category === c.key
                  ? 'bg-primary border-primary text-white'
                  : 'bg-card border-white/5 text-muted',
              ].join(' ')}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Сетка знаков */}
        {filtered.length === 0 ? (
          <div className="text-center text-muted text-sm py-12">
            Ничего не найдено
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {filtered.map((s, i) => (
              <div
                key={`${s.src}-${i}`}
                className="rounded-2xl bg-card border border-white/5 p-2 flex flex-col items-center"
              >
                <img
                  src={encodeURI(s.src)}
                  alt={`Знак ${s.number}`}
                  loading="lazy"
                  className="w-full aspect-square object-contain rounded-xl bg-white p-1.5"
                />
                <div className="text-accent text-[11px] font-bold mt-1.5">{s.number}</div>
                <div className="text-white text-[11px] leading-tight text-center mt-0.5 line-clamp-2 min-h-[28px]">
                  {s.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};
