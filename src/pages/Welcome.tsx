import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Zap, ListChecks, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { SideMenu } from '../components/SideMenu';

export const Welcome: React.FC = () => {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Фон — фото */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(bg.jpg)' }}
      />
      {/* Лёгкое затемнение для читаемости */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/65" />
      <div className="relative z-10 flex flex-col flex-1">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Открыть меню"
          className="w-11 h-11 rounded-2xl bg-card border border-white/5 flex items-center justify-center"
        >
          <Menu size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav('/account')}
            aria-label="Личный кабинет"
            className="w-11 h-11 rounded-2xl bg-card border border-white/5 flex items-center justify-center"
          >
            <User size={20} className="text-white" />
          </button>
          <div className="text-muted text-xs bg-card/60 border border-white/5 rounded-xl px-2 py-1.5">
            v1.0
          </div>
        </div>
      </div>

      <div className="px-5 pt-2">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black tracking-tight"
        >
          ПДД <span className="text-accent">2026</span>
        </motion.h1>
        <div className="text-muted mt-1">Полный курс</div>
      </div>

      {/* Welcome card */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mx-5 mt-5 rounded-3xl bg-card border border-white/5 p-5"
      >
        <div className="text-2xl font-bold text-white">Привет! 👋</div>
        <div className="text-muted mt-2 text-sm leading-relaxed">
          У нас <span className="text-white font-semibold">800</span> коротких роликов
          по всем билетам. Как тебе удобнее учиться?
        </div>
      </motion.div>

      {/* Two big choices */}
      <div className="px-5 mt-4 grid grid-cols-1 gap-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => nav('/all-videos')}
          className="text-left rounded-3xl p-5 bg-gradient-to-br from-primary to-[#0b5ec4] relative overflow-hidden"
          aria-label="Хочу всё сразу"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
            <Zap size={22} className="text-white" />
          </div>
          <div className="text-white text-xl font-bold">Хочу всё сразу!</div>
          <div className="text-white/80 text-sm mt-1">
            Все 800 видео одним списком прямо в приложении
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          onClick={() => nav('/course')}
          className="text-left rounded-3xl p-5 bg-gradient-to-br from-success to-[#1a9a52] relative overflow-hidden"
          aria-label="Пойду по этапам"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
            <ListChecks size={22} className="text-white" />
          </div>
          <div className="text-white text-xl font-bold">Пойду по этапам</div>
          <div className="text-white/80 text-sm mt-1">
            40 этапов — все открыты сразу, без тестов
          </div>
        </motion.button>
      </div>
      </div>
    </div>
  );
};
