import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, CheckCircle2, AlertTriangle, Lightbulb,
  BookOpen, Hash, Brain, ChevronRight, X,
} from 'lucide-react';
import { SIGNS } from '../data/signs';
import { BottomNavigation } from '../components/BottomNavigation';

/* ============================================================
   Единый стиль всех картинок: flat-вектор, тёмный фон #0B1B30,
   дорога #22344E, акценты #1683FF / #FFC928 / #FF4D4F / #28C76F.
   Все сцены рисуются кодом (SVG) — один стиль, работает офлайн,
   ничего не ломается, в отличие от хотлинков из интернета.
   Картинка есть у КАЖДОГО пункта + большая у раздела.
   ============================================================ */

const signSrc = (num: string): string | undefined =>
  SIGNS.find((s) => s.number === num)?.src;

function Car({ x, y, color, flip = false, label = '' }: { x: number; y: number; color: string; flip?: boolean; label?: string }) {
  return (
    <g transform={`translate(${x},${y}) ${flip ? 'scale(-1,1)' : ''}`}>
      <rect x={-22} y={-10} width={44} height={20} rx={6} fill={color} />
      <rect x={-12} y={-7} width={20} height={14} rx={3} fill="#0B1B30" opacity={0.55} />
      <circle cx={-13} cy={11} r={4} fill="#0B1B30" />
      <circle cx={13} cy={11} r={4} fill="#0B1B30" />
      {label ? <text x={0} y={4} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">{label}</text> : null}
    </g>
  );
}

function Person({ x, y, color = '#FFC928' }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx={0} cy={-12} r={7} fill={color} />
      <rect x={-6} y={-4} width={12} height={18} rx={6} fill={color} />
    </g>
  );
}

/* ---------- универсальная картинка пункта ---------- */

const Art: React.FC<{ kind: string; caption: string; big?: boolean }> = ({ kind, caption, big }) => (
  <div className="rounded-2xl overflow-hidden border border-white/10">
    <svg viewBox={big ? '0 0 320 180' : '0 0 320 132'} className="w-full h-auto block" style={{ background: '#0B1B30' }}>
      <rect x={0} y={0} width={320} height={big ? 180 : 132} fill="#0B1B30" />
      <circle cx={294} cy={18} r={30} fill="#162438" />
      <circle cx={18} cy={big ? 164 : 118} r={24} fill="#101C2C" />
      <ArtBody kind={kind} big={!!big} />
    </svg>
    <div className="px-3 py-2 bg-card-2 text-[11px] text-muted leading-snug">{caption}</div>
  </div>
);

const ArtBody: React.FC<{ kind: string; big: boolean }> = ({ kind }) => {
  switch (kind) {
    /* ===== 1. ТЕРМИНЫ ===== */
    case 'road-parts': return (<g><rect x={20} y={42} width={280} height={52} rx={10} fill="#22344E" /><rect x={20} y={52} width={70} height={32} rx={6} fill="#162438" /><text x={55} y={71} textAnchor="middle" fontSize={9} fill="#9BA9BA">тротуар</text><rect x={95} y={52} width={120} height={32} rx={6} fill="#2E3F59" /><text x={155} y={71} textAnchor="middle" fontSize={9} fill="#fff">проезжая часть</text><rect x={220} y={52} width={60} height={32} rx={6} fill="#3A4B63" /><text x={250} y={71} textAnchor="middle" fontSize={9} fill="#9BA9BA">обочина</text><Car x={140} y={112} color="#1683FF" /></g>);
    case 'driver': return (<g><Car x={90} y={66} color="#1683FF" label="А" /><Person x={200} y={70} /><Person x={225} y={70} color="#28C76F" /><text x={160} y={110} textAnchor="middle" fontSize={10} fill="#fff">вышел из авто = пешеход</text></g>);
    case 'main-road': return (<g><rect x={120} y={8} width={80} height={116} fill="#22344E" /><rect x={20} y={52} width={280} height={44} fill="#22344E" /><rect x={120} y={52} width={80} height={44} fill="#FFC928" opacity={0.25} /><Car x={160} y={30} color="#1683FF" /><Car x={60} y={74} color="#FFC928" /><text x={160} y={118} textAnchor="middle" fontSize={10} fill="#FFC928">жёлтая = главная</text></g>);
    case 'cross-reg': return (<g><rect x={130} y={6} width={60} height={120} fill="#22344E" /><rect x={30} y={46} width={260} height={40} fill="#22344E" /><circle cx={160} cy={66} r={9} fill="#28C76F" /><Car x={160} y={24} color="#1683FF" /><Car x={70} y={66} color="#FFC928" /><text x={160} y={116} textAnchor="middle" fontSize={10} fill="#9BA9BA">светофор = регулируемый</text></g>);
    case 'cross-yard': return (<g><rect x={20} y={40} width={280} height={56} rx={10} fill="#22344E" /><rect x={190} y={10} width={70} height={36} rx={6} fill="#162438" /><text x={225} y={32} textAnchor="middle" fontSize={10} fill="#fff">двор</text><path d="M225 46 L225 60" stroke="#FF4D4F" strokeWidth={3} strokeDasharray="5 4" /><Car x={110} y={68} color="#1683FF" /><text x={160} y={116} textAnchor="middle" fontSize={10} fill="#FF4D4F">выезд со двора — не перекрёсток</text></g>);
    case 'stop5': return (<g><rect x={30} y={50} width={260} height={44} rx={10} fill="#22344E" /><circle cx={70} cy={72} r={14} fill="none" stroke="#fff" strokeWidth={3} /><text x={70} y={76} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">5</text><Car x={180} y={72} color="#1683FF" /><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#9BA9BA">до 5 мин / посадка = остановка</text></g>);
    case 'overtake-def': return (<g><rect x={20} y={36} width={280} height={56} rx={10} fill="#22344E" /><line x1={20} y1={64} x2={300} y2={64} stroke="#fff" strokeWidth={2} strokeDasharray="10 8" /><Car x={90} y={78} color="#9BA9BA" /><Car x={160} y={50} color="#1683FF" /><path d="M112 72 Q160 40 210 66" stroke="#FFC928" strokeWidth={3} fill="none" /><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#9BA9BA">обгон — только через встречку</text></g>);
    case 'visibility': return (<g><rect x={20} y={44} width={280} height={52} rx={10} fill="#3A4B63" /><ellipse cx={160} cy={70} rx={110} ry={22} fill="#0B1B30" opacity={0.7} /><Car x={100} y={70} color="#1683FF" /><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#fff">&lt;300 м туман = недостаточная</text></g>);
    case 'route': return (<g><rect x={40} y={56} width={140} height={36} rx={10} fill="#FFC928" /><text x={110} y={79} textAnchor="middle" fontSize={14} fontWeight={900} fill="#0B1B30">А 12</text><line x1={40} y1={100} x2={280} y2={100} stroke="#9BA9BA" strokeWidth={2} /><line x1={40} y1={108} x2={280} y2={108} stroke="#9BA9BA" strokeWidth={2} /><text x={230} y={80} fontSize={10} fill="#9BA9BA">переезд + маршрут</text></g>);

    /* ===== 2. ОБЯЗАННОСТИ ===== */
    case 'docs': return (<g><rect x={50} y={26} width={70} height={70} rx={8} fill="#fff" /><text x={85} y={50} textAnchor="middle" fontSize={12} fontWeight={900} fill="#0B1B30">ВУ</text><rect x={58} y={58} width={54} height={7} rx={3} fill="#1683FF" /><rect x={58} y={69} width={54} height={7} rx={3} fill="#9BA9BA" /><rect x={150} y={30} width={120} height={30} rx={8} fill="#1683FF" /><text x={210} y={49} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">ОСАГО • СТС</text><text x={210} y={82} fontSize={10} fill="#9BA9BA">жезл вверх = остановись</text><Car x={210} y={98} color="#28C76F" /></g>);
    case 'dtp-steps': return (<g>{['1 стоп', '2 знак', '3 112'].map((t, i) => (<g key={t}><rect x={30 + i * 92} y={34} width={84} height={40} rx={10} fill={i === 0 ? '#FF4D4F' : '#22344E'} /><text x={72 + i * 92} y={58} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">{t}</text></g>))}<text x={160} y={100} textAnchor="middle" fontSize={10} fill="#9BA9BA">не двигай авто до фиксации</text></g>);
    case 'belt': return (<g><circle cx={90} cy={60} r={16} fill="#1683FF" /><path d="M78 74 L102 100 M102 74 L78 100" stroke="#fff" strokeWidth={5} strokeLinecap="round" /><rect x={150} y={40} width={110} height={34} rx={8} fill="#22344E" /><text x={205} y={61} textAnchor="middle" fontSize={11} fill="#fff">ремень всем</text><text x={160} y={106} textAnchor="middle" fontSize={10} fill="#FF4D4F">телефон только hands-free</text></g>);
    case 'triangle-warn': return (<g><path d="M80 24 L130 100 L30 100 Z" fill="#FF4D4F" /><path d="M80 42 L115 92 L45 92 Z" fill="#fff" /><text x={80} y={82} textAnchor="middle" fontSize={22} fontWeight={900} fill="#0B1B30">!</text><Car x={200} y={72} color="#1683FF" /><rect x={182} y={40} width={36} height={14} rx={7} fill="#FFC928" /><text x={200} y={50} textAnchor="middle" fontSize={9} fontWeight={800} fill="#0B1B30">15/30 м</text></g>);

    /* ===== 3. ЗНАКИ ===== */
    case 'sign-warn': return (<g><path d="M80 22 L128 98 L32 98 Z" fill="#fff" stroke="#FF4D4F" strokeWidth={6} /><text x={80} y={84} textAnchor="middle" fontSize={24} fontWeight={900} fill="#0B1B30">!</text><text x={190} y={62} fontSize={11} fill="#fff">50–100 м город</text><text x={190} y={78} fontSize={11} fill="#fff">150–300 трасса</text></g>);
    case 'sign-priority': return (<g><rect x={50} y={30} width={52} height={52} rx={8} fill="#FFC928" stroke="#fff" strokeWidth={3} transform="rotate(45 76 56)" /><path d="M170 84 L215 38 L260 84 Z" fill="#fff" stroke="#FF4D4F" strokeWidth={5} /><text x={215} y={76} textAnchor="middle" fontSize={16} fontWeight={900} fill="#0B1B30">▼</text><text x={160} y={112} textAnchor="middle" fontSize={10} fill="#9BA9BA">ромб — главный • ▼ — уступи</text></g>);
    case 'sign-ban': return (<g><circle cx={80} cy={62} r={26} fill="#fff" stroke="#FF4D4F" strokeWidth={8} /><text x={80} y={69} textAnchor="middle" fontSize={15} fontWeight={900} fill="#0B1B30">50</text><circle cx={180} cy={62} r={26} fill="#fff" stroke="#FF4D4F" strokeWidth={8} /><line x1={162} y1={80} x2={198} y2={44} stroke="#FF4D4F" strokeWidth={6} /><text x={245} y={58} fontSize={11} fill="#fff">кирпич</text><text x={245} y={73} fontSize={11} fill="#FF4D4F">⛔ въезд</text></g>);
    case 'sign-prescribe': return (<g><rect x={50} y={32} width={56} height={56} rx={28} fill="#1683FF" /><path d="M78 48 L78 72 M70 64 L78 48 L86 64" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" /><rect x={140} y={32} width={56} height={56} rx={28} fill="#1683FF" /><circle cx={168} cy={60} r={14} fill="none" stroke="#fff" strokeWidth={3} /><text x={230} y={58} fontSize={11} fill="#fff">синий круг</text><text x={230} y={73} fontSize={11} fill="#fff">= «только так»</text></g>);
    case 'sign-info': return (<g><rect x={40} y={32} width={80} height={56} rx={8} fill="#1683FF" /><text x={80} y={56} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">5.1</text><text x={80} y={72} textAnchor="middle" fontSize={10} fill="#fff">110</text><rect x={150} y={32} width={80} height={56} rx={8} fill="#22344E" stroke="#fff" strokeWidth={2} /><text x={190} y={56} textAnchor="middle" fontSize={11} fill="#fff">сервис</text><text x={190} y={72} textAnchor="middle" fontSize={14} fill="#fff">⛽ 🏥</text></g>);
    case 'sign-plate': return (<g><rect x={60} y={24} width={80} height={56} rx={8} fill="#fff" stroke="#FF4D4F" strokeWidth={5} /><line x1={60} y1={80} x2={140} y2={80} stroke="#FF4D4F" strokeWidth={5} /><rect x={160} y={44} width={100} height={30} rx={6} fill="#fff" /><text x={210} y={63} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0B1B30">8:00–18:00</text><text x={160} y={104} textAnchor="middle" fontSize={10} fill="#FFC928">табличка меняет зону/время</text></g>);
    case 'sign-yellow': return (<g><path d="M80 22 L128 98 L32 98 Z" fill="#FFC928" stroke="#0B1B30" strokeWidth={3} /><text x={80} y={84} textAnchor="middle" fontSize={24} fontWeight={900} fill="#0B1B30">!</text><text x={190} y={58} fontSize={11} fontWeight={700} fill="#FFC928">жёлтый фон —</text><text x={190} y={74} fontSize={11} fill="#fff">временный,</text><text x={190} y={90} fontSize={11} fill="#fff">он главнее</text></g>);

    /* ===== 4. РАЗМЕТКА ===== */
    case 'line-solid': return (<g><rect x={20} y={40} width={280} height={56} rx={10} fill="#22344E" /><line x1={60} y1={40} x2={60} y2={96} stroke="#fff" strokeWidth={4} /><line x1={72} y1={40} x2={72} y2={96} stroke="#fff" strokeWidth={4} /><Car x={150} y={68} color="#1683FF" /><line x1={150} y1={68} x2={66} y2={68} stroke="#FF4D4F" strokeWidth={3} /><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#FF4D4F">1.1 / 1.3 — пересекать запрещено</text></g>);
    case 'line-dashed': return (<g><rect x={20} y={40} width={280} height={56} rx={10} fill="#22344E" /><line x1={20} y1={68} x2={300} y2={68} stroke="#fff" strokeWidth={3} strokeDasharray="14 10" /><Car x={120} y={68} color="#28C76F" /><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#9BA9BA">1.5 прерывистая — можно • 1.6 длинный штрих = скоро сплошная</text></g>);
    case 'line-combo': return (<g><rect x={20} y={40} width={280} height={56} rx={10} fill="#22344E" /><line x1={160} y1={40} x2={160} y2={96} stroke="#fff" strokeWidth={4} /><line x1={170} y1={40} x2={170} y2={96} stroke="#FFC928" strokeWidth={3} strokeDasharray="10 8" /><Car x={110} y={68} color="#FF4D4F" /><Car x={220} y={68} color="#1683FF" /><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#9BA9BA">1.11: можно только со стороны прерывистой</text></g>);
    case 'line-stop': return (<g><rect x={20} y={40} width={280} height={56} rx={10} fill="#22344E" /><rect x={120} y={46} width={80} height={10} rx={3} fill="#fff" /><g>{[0, 1, 2, 3, 4].map((i) => (<rect key={i} x={60 + i * 36} y={66} width={20} height={24} rx={3} fill="#fff" opacity={0.9} />))}</g><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#9BA9BA">1.12 стоп-линия • 1.14 зебра • 1.17 жёлтая у остановки</text></g>);
    case 'vertical': return (<g><rect x={60} y={30} width={26} height={70} rx={6} fill="#fff" /><rect x={60} y={42} width={26} height={12} fill="#0B1B30" /><rect x={60} y={64} width={26} height={12} fill="#0B1B30" /><rect x={140} y={30} width={120} height={70} rx={8} fill="#22344E" stroke="#FF4D4F" strokeWidth={3} strokeDasharray="10 6" /><text x={200} y={60} textAnchor="middle" fontSize={11} fill="#fff">барьер</text><text x={200} y={78} textAnchor="middle" fontSize={11} fill="#FFC928">красно-белый</text></g>);

    /* ===== 5. СВЕТОФОР / РЕГУЛИРОВЩИК ===== */
    case 'light-rgy': return (<g><rect x={70} y={14} width={50} height={104} rx={12} fill="#101C2C" stroke="#22344E" strokeWidth={2} /><circle cx={95} cy={36} r={12} fill="#FF4D4F" /><circle cx={95} cy={66} r={12} fill="#3A4B63" /><circle cx={95} cy={96} r={12} fill="#28C76F" /><text x={190} y={50} fontSize={11} fill="#FF4D4F">красный = стоп</text><text x={190} y={68} fontSize={11} fill="#FFC928">жёлтый = стоп*</text><text x={190} y={86} fontSize={11} fill="#28C76F">миг. зелёный = тормози</text></g>);
    case 'light-arrow': return (<g><rect x={50} y={24} width={70} height={70} rx={12} fill="#101C2C" stroke="#22344E" strokeWidth={2} /><path d="M85 40 L85 78 M73 66 L85 78 L97 66" stroke="#28C76F" strokeWidth={5} fill="none" strokeLinecap="round" /><rect x={150} y={24} width={70} height={70} rx={12} fill="#101C2C" stroke="#22344E" strokeWidth={2} /><path d="M185 40 L185 78 M173 66 L185 78 L197 66" stroke="#3A4B63" strokeWidth={5} fill="none" strokeLinecap="round" /><text x={160} y={112} textAnchor="middle" fontSize={10} fill="#9BA9BA">погасшая секция = туда нельзя</text></g>);
    case 'light-rev': return (<g><rect x={60} y={30} width={90} height={50} rx={10} fill="#101C2C" stroke="#22344E" strokeWidth={2} /><text x={85} y={61} textAnchor="middle" fontSize={22} fontWeight={900} fill="#FF4D4F">✕</text><text x={125} y={61} textAnchor="middle" fontSize={22} fontWeight={900} fill="#28C76F">↓</text><rect x={170} y={30} width={90} height={50} rx={10} fill="#22344E" /><circle cx={195} cy={55} r={8} fill="#fff" /><circle cx={218} cy={55} r={8} fill="#fff" /><text x={160} y={108} textAnchor="middle" fontSize={10} fill="#9BA9BA">реверс: крест — полоса закрыта</text></g>);
    case 'regul-front': return (<g><circle cx={110} cy={50} r={15} fill="#FFC928" /><rect x={103} y={65} width={14} height={40} rx={7} fill="#1683FF" /><rect x={70} y={76} width={30} height={9} rx={4} fill="#FFC928" /><rect x={120} y={76} width={30} height={9} rx={4} fill="#FFC928" /><Car x={225} y={82} color="#FF4D4F" /><line x1={225} y1={82} x2={160} y2={82} stroke="#FF4D4F" strokeWidth={3} /><text x={160} y={118} textAnchor="middle" fontSize={10} fill="#FF4D4F">грудь / спина — стоим</text></g>);
    case 'regul-side': return (<g><circle cx={110} cy={50} r={15} fill="#FFC928" /><rect x={103} y={65} width={14} height={40} rx={7} fill="#1683FF" /><path d="M117 70 L160 70 M160 70 L152 64 M160 70 L152 76" stroke="#28C76F" strokeWidth={3} fill="none" /><Car x={225} y={70} color="#28C76F" /><text x={160} y={118} textAnchor="middle" fontSize={10} fill="#28C76F">боком — прямо и направо</text></g>);

    /* ===== 6. СПЕЦСИГНАЛЫ ===== */
    case 'spec-blue': return (<g><Car x={100} y={66} color="#FF4D4F" label="01" /><rect x={82} y={44} width={36} height={10} rx={5} fill="#1683FF" /><circle cx={90} cy={49} r={3} fill="#fff" /><Car x={220} y={66} color="#9BA9BA" /><path d="M140 66 L182 66" stroke="#FFC928" strokeWidth={3} strokeDasharray="8 6" /><text x={160} y={108} textAnchor="middle" fontSize={10} fill="#fff">синий + сирена = уступи, прижмись вправо</text></g>);
    case 'spec-yellow': return (<g><Car x={110} y={66} color="#FFC928" /><rect x={92} y={44} width={36} height={10} rx={5} fill="#FFC928" /><Car x={220} y={66} color="#1683FF" /><text x={160} y={108} textAnchor="middle" fontSize={10} fill="#9BA9BA">жёлтый маячок — внимания, без преимущества</text></g>);

    /* ===== 7-8. МАНЕВРЫ / ПОЛОСЫ ===== */
    case 'maneuver-shift': return (<g><rect x={20} y={28} width={280} height={64} rx={10} fill="#22344E" /><line x1={20} y1={60} x2={300} y2={60} stroke="#fff" strokeWidth={2} strokeDasharray="10 8" /><Car x={90} y={46} color="#1683FF" /><path d="M110 46 Q160 46 170 76" stroke="#FFC928" strokeWidth={3} fill="none" strokeDasharray="6 4" /><Car x={205} y={76} color="#FFC928" /><Car x={250} y={46} color="#28C76F" /><text x={160} y={110} textAnchor="middle" fontSize={10} fill="#9BA9BA">поворотник не даёт преимущества</text></g>);
    case 'maneuver-turn': return (<g><rect x={110} y={6} width={100} height={104} fill="#22344E" /><rect x={30} y={46} width={260} height={40} fill="#22344E" /><path d="M160 86 L160 60 L190 60" stroke="#1683FF" strokeWidth={4} fill="none" /><Car x={160} y={100} color="#1683FF" /><Car x={80} y={66} color="#FFC928" /><text x={160} y={122} textAnchor="middle" fontSize={9} fill="#9BA9BA">направо — к правому краю • налево — к левому</text></g>);
    case 'maneuver-back': return (<g><rect x={20} y={30} width={280} height={60} rx={10} fill="#22344E" /><Car x={160} y={60} color="#1683FF" flip /><path d="M138 60 L100 60" stroke="#FFC928" strokeWidth={3} strokeDasharray="6 4" /><Person x={80} y={64} color="#FF4D4F" /><text x={160} y={110} textAnchor="middle" fontSize={10} fill="#9BA9BA">задний ход — только безопасно, везде смотри</text></g>);
    case 'lanes': return (<g><rect x={110} y={6} width={100} height={100} rx={10} fill="#22344E" /><line x1={143} y1={6} x2={143} y2={106} stroke="#fff" strokeWidth={2} strokeDasharray="8 6" /><line x1={177} y1={6} x2={177} y2={106} stroke="#fff" strokeWidth={2} strokeDasharray="8 6" /><Car x={127} y={40} color="#1683FF" /><Car x={160} y={76} color="#FFC928" /><Car x={193} y={40} color="#28C76F" /><text x={160} y={120} textAnchor="middle" fontSize={10} fill="#9BA9BA">за городом держись правее</text></g>);
    case 'tram': return (<g><rect x={20} y={40} width={280} height={52} rx={10} fill="#22344E" /><line x1={20} y1={58} x2={300} y2={58} stroke="#9BA9BA" strokeWidth={2} /><line x1={20} y1={74} x2={300} y2={74} stroke="#9BA9BA" strokeWidth={2} /><rect x={100} y={46} width={80} height={22} rx={6} fill="#FFC928" /><text x={140} y={61} textAnchor="middle" fontSize={10} fontWeight={800} fill="#0B1B30">Трамвай</text><Car x={230} y={84} color="#1683FF" /><text x={160} y={112} textAnchor="middle" fontSize={10} fill="#9BA9BA">встречные пути — никогда нельзя</text></g>);

    /* ===== 9-10. СКОРОСТЬ / ОБГОН ===== */
    case 'speed': return (<g><circle cx={80} cy={62} r={36} fill="#101C2C" stroke="#22344E" strokeWidth={3} /><text x={80} y={70} textAnchor="middle" fontSize={24} fontWeight={900} fill="#fff">60</text><rect x={130} y={26} width={160} height={26} rx={8} fill="#22344E" /><text x={210} y={43} textAnchor="middle" fontSize={11} fill="#fff">город 60 • двор 20</text><rect x={130} y={58} width={160} height={26} rx={8} fill="#22344E" /><text x={210} y={75} textAnchor="middle" fontSize={11} fill="#fff">трасса 90 • маг. 110</text><rect x={130} y={90} width={160} height={22} rx={8} fill="#FF4D4F" /><text x={210} y={105} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">×2 скорость = ×4 путь</text></g>);
    case 'distance': return (<g><Car x={90} y={62} color="#1683FF" /><Car x={210} y={62} color="#FFC928" /><path d="M112 62 L188 62" stroke="#28C76F" strokeWidth={2} strokeDasharray="6 4" /><text x={150} y={52} fontSize={10} fill="#28C76F">дистанция</text><text x={160} y={102} textAnchor="middle" fontSize={10} fill="#9BA9BA">≈ половина скорости: 60 → 30 м</text></g>);
    case 'overtake-ban': return (<g><rect x={20} y={30} width={280} height={60} rx={10} fill="#22344E" /><circle cx={60} cy={60} r={18} fill="#fff" stroke="#FF4D4F" strokeWidth={5} /><line x1={48} y1={72} x2={72} y2={48} stroke="#FF4D4F" strokeWidth={4} /><Car x={160} y={60} color="#1683FF" /><Car x={240} y={60} color="#FF4D4F" flip /><text x={160} y={110} textAnchor="middle" fontSize={10} fill="#FF4D4F">переход • переезд • мост • подъём — нельзя</text></g>);
    case 'razjezd': return (<g><rect x={60} y={20} width={200} height={60} rx={10} fill="#22344E" /><rect x={60} y={40} width={80} height={20} rx={6} fill="#FF4D4F" /><Car x={100} y={88} color="#1683FF" /><Car x={220} y={40} color="#FFC928" flip /><path d="M60 10 L120 40" stroke="#9BA9BA" strokeWidth={3} /><text x={160} y={112} textAnchor="middle" fontSize={10} fill="#9BA9BA">вниз уступает • препятствие у тебя — ты стоишь</text></g>);

    /* ===== 11-12. ОСТАНОВКА / ПЕРЕКРЁСТКИ ===== */
    case 'stop-ban': return (<g><rect x={20} y={36} width={280} height={52} rx={10} fill="#22344E" /><g>{[0, 1, 2, 3, 4].map((i) => (<rect key={i} x={60 + i * 30} y={44} width={16} height={36} rx={3} fill="#fff" />))}</g><rect x={230} y={40} width={30} height={44} rx={6} fill="#FF4D4F" /><text x={245} y={66} textAnchor="middle" fontSize={15} fontWeight={900} fill="#fff">P</text><line x1={245} y1={40} x2={245} y2={84} stroke="#fff" strokeWidth={2} /><text x={160} y={108} textAnchor="middle" fontSize={10} fill="#FF4D4F">5 м до зебры • 15 м от остановки ОТ</text></g>);
    case 'stop-meters': return (<g>{[['5', 60], ['15', 115], ['50', 170], ['3м', 230]].map(([t, x]) => (<g key={t as string}><rect x={(x as number) - 24} y={34} width={48} height={40} rx={10} fill="#22344E" stroke="#1683FF" strokeWidth={2} /><text x={x as number} y={59} textAnchor="middle" fontSize={14} fontWeight={900} fill="#fff">{t}</text></g>))}<text x={160} y={102} textAnchor="middle" fontSize={10} fill="#9BA9BA">5 — переход • 15 — ОТ • 50 — переезд • 3 — до сплошной</text></g>);
    case 'cross-algo': return (<g>{['Свет?', 'Главн?', 'Трам?'].map((t, i) => (<g key={t}><rect x={30 + i * 92} y={32} width={84} height={40} rx={10} fill={i === 0 ? '#1683FF' : '#22344E'} /><text x={72 + i * 92} y={56} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{t}</text></g>))}<text x={160} y={100} textAnchor="middle" fontSize={10} fill="#9BA9BA">регулировщик → светофор → знаки → справа</text></g>);
    case 'cross-circle': return (<g><circle cx={160} cy={60} r={34} fill="#22344E" /><circle cx={160} cy={60} r={16} fill="#2E3F59" /><Car x={160} y={26} color="#1683FF" /><Car x={210} y={70} color="#FFC928" flip /><Car x={110} y={80} color="#28C76F" /><text x={160} y={110} textAnchor="middle" fontSize={10} fill="#9BA9BA">круг: кто на кругу — тот главный</text></g>);

    /* ===== 13-16 ===== */
    case 'ped-zebra': return (<g><rect x={20} y={36} width={280} height={52} rx={10} fill="#22344E" /><g>{[0, 1, 2, 3, 4, 5].map((i) => (<rect key={i} x={56 + i * 32} y={42} width={18} height={40} rx={3} fill="#fff" opacity={0.9} />))}</g><Person x={250} y={66} /><Car x={60} y={102} color="#1683FF" /><text x={160} y={120} textAnchor="middle" fontSize={9} fill="#9BA9BA">встал впереди — встань тоже, обгон запрещён</text></g>);
    case 'tram-stop': return (<g><rect x={40} y={44} width={120} height={34} rx={8} fill="#FFC928" /><text x={100} y={65} textAnchor="middle" fontSize={12} fontWeight={900} fill="#0B1B30">Трамвай</text><Person x={200} y={62} /><Person x={222} y={62} color="#28C76F" /><Car x={90} y={100} color="#1683FF" /><text x={190} y={104} fontSize={10} fill="#FF4D4F">идёт посадка — стой</text></g>);
    case 'rail-red': return (<g><rect x={20} y={56} width={280} height={22} rx={6} fill="#3A4B63" /><rect x={60} y={20} width={14} height={38} fill="#FF4D4F" /><rect x={246} y={20} width={14} height={38} fill="#FF4D4F" /><circle cx={160} cy={40} r={11} fill="#FF4D4F" /><Car x={160} y={100} color="#1683FF" /><text x={160} y={120} textAnchor="middle" fontSize={10} fill="#9BA9BA">красный мигает = стоп • 5 м / 10 м</text></g>);
    case 'rail-stuck': return (<g><Car x={160} y={58} color="#FF4D4F" /><Person x={90} y={62} /><Person x={230} y={62} color="#28C76F" /><path d="M100 80 L60 100 M220 80 L260 100" stroke="#FFC928" strokeWidth={3} /><text x={160} y={112} textAnchor="middle" fontSize={10} fill="#fff">заглох: людей — вон, беги навстречу поезду</text></g>);
    case 'highway': return (<g><rect x={20} y={34} width={280} height={58} rx={10} fill="#22344E" /><rect x={20} y={60} width={280} height={7} fill="#28C76F" /><Car x={100} y={50} color="#1683FF" /><Car x={210} y={78} color="#FFC928" /><text x={160} y={110} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">5.1: 110 км/ч • стоп только на площадках</text></g>);
    case 'living': return (<g><rect x={40} y={30} width={64} height={56} rx={8} fill="#1683FF" /><text x={72} y={56} textAnchor="middle" fontSize={20} fill="#fff">⌂</text><text x={72} y={74} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">20</text><Person x={160} y={60} /><Person x={185} y={60} color="#28C76F" /><Car x={240} y={62} color="#FFC928" /><text x={160} y={108} textAnchor="middle" fontSize={10} fill="#9BA9BA">пешеход везде главный, сквозной — запрещён</text></g>);

    /* ===== 17-22 ===== */
    case 'light-night': return (<g><circle cx={80} cy={62} r={24} fill="#FFF7CC" /><circle cx={80} cy={62} r={32} fill="none" stroke="#FFC928" strokeWidth={2} strokeDasharray="6 6" /><Car x={200} y={62} color="#1683FF" flip /><path d="M104 62 L178 62" stroke="#FFC928" strokeWidth={3} strokeDasharray="8 6" /><text x={160} y={108} textAnchor="middle" fontSize={10} fill="#9BA9BA">встречка ближе 150 м — переключись на ближний</text></g>);
    case 'tow': return (<g><Car x={100} y={62} color="#1683FF" /><path d="M122 62 L178 62" stroke="#FFC928" strokeWidth={3} strokeDasharray="4 4" /><Car x={200} y={62} color="#9BA9BA" /><text x={160} y={98} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">4–6 м • 50 км/ч • аварийка сзади</text></g>);
    case 'kids': return (<g><rect x={90} y={36} width={60} height={50} rx={10} fill="#22344E" stroke="#1683FF" strokeWidth={2} /><Person x={120} y={62} color="#1683FF" /><text x={205} y={52} fontSize={11} fill="#fff">до 7 — кресло</text><text x={205} y={68} fontSize={11} fill="#fff">7–11 сзади — ремень</text><text x={205} y={84} fontSize={11} fill="#FFC928">спереди — кресло</text></g>);
    case 'cargo': return (<g><rect x={60} y={52} width={120} height={34} rx={8} fill="#1683FF" /><rect x={180} y={44} width={56} height={42} rx={6} fill="#8B5E34" /><line x1={180} y1={44} x2={236} y2={44} stroke="#FF4D4F" strokeWidth={3} /><circle cx={90} cy={92} r={9} fill="#0B1B30" stroke="#9BA9BA" strokeWidth={2} /><circle cx={200} cy={92} r={9} fill="#0B1B30" stroke="#9BA9BA" strokeWidth={2} /><text x={160} y={114} textAnchor="middle" fontSize={10} fill="#9BA9BA">+1 м сзади / +0,4 сбоку — знак «крупногабарит»</text></g>);
    case 'study-u': return (<g><rect x={70} y={30} width={180} height={52} rx={12} fill="#fff" /><text x={160} y={62} textAnchor="middle" fontSize={24} fontWeight={900} fill="#0B1B30">У</text><rect x={70} y={88} width={180} height={18} rx={9} fill="#FFC928" /><text x={160} y={101} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0B1B30">инструктор + педали + зеркала</text></g>);
    case 'fault': return (<g><circle cx={90} cy={62} r={26} fill="none" stroke="#FF4D4F" strokeWidth={5} /><path d="M90 46 L90 62 L103 70" stroke="#FF4D4F" strokeWidth={5} strokeLinecap="round" /><rect x={130} y={32} width={130} height={60} rx={10} fill="#22344E" /><text x={195} y={54} textAnchor="middle" fontSize={10} fill="#fff">тормоза • руль •</text><text x={195} y={69} textAnchor="middle" fontSize={10} fill="#fff">фары • шины —</text><text x={195} y={84} textAnchor="middle" fontSize={10} fontWeight={800} fill="#FF4D4F">ехать нельзя</text></g>);

    /* ===== 23-28 ===== */
    case 'safety-rain': return (<g><path d="M40 96 Q150 96 150 46" stroke="#1683FF" strokeWidth={4} fill="none" /><path d="M40 96 Q150 96 190 96" stroke="#FF4D4F" strokeWidth={4} strokeDasharray="8 6" fill="none" /><Car x={60} y={96} color="#1683FF" /><text x={230} y={52} fontSize={11} fill="#9BA9BA">мокро ×2</text><text x={230} y={68} fontSize={11} fill="#9BA9BA">лёд ×5–10</text><text x={230} y={88} fontSize={11} fontWeight={800} fill="#FFC928">дистанция ×2</text></g>);
    case 'aid': return (<g><rect x={50} y={32} width={90} height={60} rx={12} fill="#fff" /><rect x={77} y={40} width={26} height={44} rx={4} fill="#FF4D4F" /><rect x={64} y={53} width={52} height={18} rx={4} fill="#FF4D4F" /><text x={200} y={56} fontSize={14} fontWeight={900} fill="#fff">30 : 2</text><text x={200} y={74} fontSize={10} fill="#9BA9BA">100–120/мин</text><text x={200} y={88} fontSize={10} fill="#9BA9BA">5–6 см</text></g>);
    case 'fine': return (<g><rect x={60} y={28} width={200} height={60} rx={12} fill="#fff" /><text x={160} y={52} textAnchor="middle" fontSize={12} fontWeight={800} fill="#0B1B30">ЛИШЕНИЕ / ШТРАФ</text><rect x={80} y={62} width={160} height={8} rx={4} fill="#FF4D4F" /><rect x={80} y={74} width={110} height={8} rx={4} fill="#9BA9BA" /><text x={160} y={106} textAnchor="middle" fontSize={10} fill="#9BA9BA">пьяный • встречка • скрылся</text></g>);
    case 'trap': return (<g><path d="M110 24 L170 96 L50 96 Z" fill="#FFC928" /><path d="M110 40 L153 88 L67 88 Z" fill="#0B1B30" /><text x={110} y={78} textAnchor="middle" fontSize={26} fontWeight={900} fill="#FFC928">!</text><text x={215} y={52} fontSize={11} fill="#fff">остановка ≠</text><text x={215} y={67} fontSize={11} fill="#fff">стоянка</text><text x={215} y={82} fontSize={11} fill="#fff">обгон ≠ опереж.</text></g>);
    case 'numbers': return (<g>{[['5', 55], ['15', 108], ['50', 161], ['150', 218]].map(([t, x]) => (<g key={t as string}><rect x={(x as number) - 24} y={34} width={48} height={42} rx={10} fill="#22344E" stroke="#1683FF" strokeWidth={2} /><text x={x as number} y={60} textAnchor="middle" fontSize={15} fontWeight={900} fill="#fff">{t}</text></g>))}<text x={160} y={102} textAnchor="middle" fontSize={11} fill="#FFC928">м — выучи за 10 минут</text></g>);
    case 'algo': return (<g>{['Знак?', 'Метры?', '3 м?'].map((t, i) => (<g key={t}><rect x={30 + i * 92} y={32} width={84} height={40} rx={10} fill={i === 0 ? '#1683FF' : '#22344E'} /><text x={72 + i * 92} y={56} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{t}</text></g>))}<text x={160} y={100} textAnchor="middle" fontSize={10} fill="#9BA9BA">остановка: знак → разметка → метры</text></g>);

    default: return (<g><rect x={20} y={36} width={280} height={52} rx={10} fill="#22344E" /><Car x={120} y={62} color="#1683FF" /><Car x={200} y={62} color="#FFC928" flip /><text x={160} y={108} textAnchor="middle" fontSize={10} fill="#9BA9BA">смотри на знаки и разметку целиком</text></g>);
  }
};

/* ---------- типы ---------- */

type Level = 'must' | 'should' | 'pro';

interface MemoBlock {
  title: string;
  rule: string;
  example?: string;
  exception?: string;
  mistake?: string;
  art: string;
  artCaption: string;
}

interface MemoSection {
  id: string;
  title: string;
  lead: string;
  level: Level;
  art: string;
  artCaption: string;
  signs?: string[];
  blocks: MemoBlock[];
  remember: string[];
  warn?: string;
}

const LEVEL_META: Record<Level, { label: string; cls: string }> = {
  must: { label: 'Обязательно знать', cls: 'bg-danger/15 text-danger border-danger/30' },
  should: { label: 'Нужно понимать', cls: 'bg-accent/15 text-accent border-accent/30' },
  pro: { label: 'Для уверенности', cls: 'bg-success/15 text-success border-success/30' },
};

/* ---------- ДАННЫЕ: 28 разделов, картинка у каждого пункта ---------- */

const SECTIONS: MemoSection[] = [
  {
    id: '1-terminy', title: '1. Общие положения — термины',
    lead: 'Термин → простое объяснение → пример из жизни. База всех билетов.',
    level: 'must', art: 'road-parts',
    artCaption: 'Дорога = проезжая часть + обочина + тротуар. Ехать можно только по проезжей части.',
    blocks: [
      { title: 'Водитель, участник, пешеход', rule: 'Водитель — управляет ТС. Участник — любой в движении (водитель, пешеход, пассажир). Пешеход — вне ТС и не работает на дороге.', example: 'Вышел из машины — уже пешеход. Ведёшь велосипед рядом — тоже пешеход.', art: 'driver', artCaption: 'Статус меняется мгновенно: руль в руках — водитель, идёшь рядом — пешеход.' },
      { title: 'Дорога, проезжая часть, полоса', rule: 'Дорога — всё обустроенное. Проезжая часть — где едут. Полоса — один ряд. Разделительная полоса — не для движения и стоянки.', example: 'Остановился на разделительной — нарушение.', mistake: 'Обочина — не полоса, ехать по ней нельзя.', art: 'road-parts', artCaption: 'Разделительную полосу нельзя пересекать, ехать и стоять на ней.' },
      { title: 'Главная дорога', rule: 'Знаки 2.1, 2.3.x, 5.1, или твёрдое покрытие против грунтовки, или любая дорога против выезда с прилегающей.', example: 'Выезд со двора — всегда второстепенный, даже без знака.', art: 'main-road', artCaption: 'Главная меняет направление — уступаешь тем, кто тоже на главной.' },
      { title: 'Перекрёсток: регулируемый и нет', rule: 'Регулируемый — светофор/регулировщик. Нерегулируемый — знаки или равнозначный. Выезд с прилегающей — не перекрёсток.', example: 'Мигает жёлтый — стал нерегулируемым, смотри знаки.', mistake: 'Дворовый выезд считают перекрёстком — помеха справа там не работает.', art: 'cross-reg', artCaption: 'Сначала определи тип: регулируемый? главная? равнозначный?' },
      { title: 'Прилегающая территория', rule: 'Дворы, АЗС, парковки: ПДД действуют, но это не перекрёсток, сквозное движение запрещено, выезжающий уступает всем.', example: 'Выезжаешь с АЗС — пропусти всех, даже пешехода на тротуаре.', art: 'cross-yard', artCaption: 'Выезд с прилегающей: уступи машинам, пешеходам и велосипедам.' },
      { title: 'Остановка, стоянка, вынужденная', rule: 'Остановка — до 5 мин или посадка/погрузка. Стоянка — дольше. Вынужденная — поломка, опасность, состояние.', example: '3 мин высаживаешь — остановка, под 3.28 можно.', art: 'stop5', artCaption: '5 минут — граница: дольше без посадки = уже стоянка.' },
      { title: 'Обгон, опережение, перестроение', rule: 'Обгон — только с выездом на встречку. Опережение — быстрее попутно. Перестроение — смена полосы. Уступить — не заставить менять скорость.', example: 'Объехал по соседней полосе — это опережение, разрешено почти везде.', mistake: '«Обгон справа» — нет такого, справа только опережение.', art: 'overtake-def', artCaption: 'Нет встречки — нет обгона. Это спрашивают в каждом 5-м билете.' },
      { title: 'Видимость: недостаточная и ограниченная', rule: 'Недостаточная — погода/ночь, меньше 300 м. Ограниченная — рельеф, строения, поворот, подъём.', example: 'Туман 150 м — снижай скорость и включай свет.', art: 'visibility', artCaption: 'Меньше 300 м видимости — действуют запреты обгона и разворота.' },
      { title: 'Маршрутное ТС, переезд', rule: 'Маршрутное — автобус/троллейбус/трамвай по маршруту. Переезд — пересечение с ж/д.', exception: 'Трамвай обычно первый, кроме выезда из депо.', art: 'route', artCaption: 'Автобус с буквой «А» на полосе — не занимай его полосу.' },
    ],
    remember: ['Двор — не перекрёсток', 'Обгон — только через встречку', 'Остановка — 5 минут', 'Разделительная — не для езды', 'Уступить ≠ остановиться'],
  },
  {
    id: '2-obyazannosti', title: '2. Общие обязанности водителей',
    lead: 'Документы, состояние, ДТП. Алгоритм при ДТП учи наизусть.',
    level: 'must', art: 'dtp-steps',
    artCaption: 'При ДТП: стоп → аварийка → знак 15/30 м → 112. Машину не двигай до фиксации.',
    blocks: [
      { title: 'Документы и остановка по требованию', rule: 'Вози права, СТС, ОСАГО. По требованию остановись и передай документы.', example: 'Жезл вверх — поворотник, остановка справа, документы готовы.', art: 'docs', artCaption: 'Права + СТС + ОСАГО — три документа, которые всегда с собой.' },
      { title: 'Ремни, пассажиры, телефон, состояние', rule: 'Пристегнись сам и проверь пассажиров. Телефон — только hands-free. Нельзя ехать пьяным, уставшим, больным.', mistake: 'Держать телефон в руке даже на светофоре — уже нарушение.', art: 'belt', artCaption: 'Ремень — всем, где он есть. Телефон в руке = штраф.' },
      { title: 'Что делать при ДТП — алгоритм', rule: '1) Стоп, не двигай авто. 2) Аварийка + знак 15 м город / 30 м трасса. 3) Ручник, заглуши. 4) Помощь + 112. 5) Фото, свидетели, схема. 6) Убери с дороги после фиксации. 7) Дождись полицию или европротокол.', example: 'Царапина без пострадавших — европротокол, но фото обязательны.', exception: 'Уехать можно: отвезти тяжелораненого (вернуться!), убрать дорогу после фиксации, европротокол.', art: 'dtp-steps', artCaption: 'Сначала зафиксируй следы — потом убирай машину с дороги.' },
      { title: 'Неисправность, знак, аварийка', rule: 'Аварийка: ДТП, вынужденная остановка в запрещённом месте, ослепление, буксировка сзади, дети. Знак: от 15 м в городе, от 30 м за городом.', example: 'Заглох на мосту — аварийка + знак + убери авто быстрее.', art: 'triangle-warn', artCaption: 'Треугольник ставь за машиной по ходу: 15 м город, 30 м трасса.' },
    ],
    remember: ['15 м город / 30 м трасса', 'Сначала фото — потом убирай', 'Скрылся с ДТП — лишение', 'Ослепили — аварийка + тормози прямо'],
  },
  {
    id: '3-znaki', title: '3. Дорожные знаки',
    lead: 'Форма решает: треугольник — предупреди, круг — запрети/прикажи.',
    level: 'must', art: 'sign-yellow',
    artCaption: 'Жёлтый фон — временный знак, он главнее постоянного. Знак главнее разметки.',
    signs: ['2.1', '2.4', '2.5', '3.27', '3.28', '3.24'],
    blocks: [
      { title: '3.1 Предупреждающие (1.x)', rule: 'Только предупреждают, ничего не запрещают. Город — за 50–100 м, трасса — за 150–300 м.', example: '1.23 «Дети» у школы — будь готов тормозить.', mistake: 'Думают, треугольник даёт приоритет — нет.', art: 'sign-warn', artCaption: 'Треугольник с красной каймой: опасность впереди, а не запрет.' },
      { title: '3.2 Приоритет (2.x)', rule: '2.1 — ты первый. 2.4 — уступи с главной. 2.5 STOP — встань + уступи. 2.6/2.7 — очередь в узком месте.', example: '2.4 + табличка 8.13 — уступаешь тем, кто на главной.', art: 'sign-priority', artCaption: 'Ромб — главная. Перевёрнутый треугольник — уступи. STOP — встань.' },
      { title: '3.3 Запрещающие (3.x)', rule: '3.1 «кирпич» — сюда нельзя. 3.2 — дальше никому. 3.18 — запрет поворотов, 3.19 — только разворота. 3.20 — обгон запрещён. 3.27 — нельзя даже встать, 3.28 — встать можно, стоять нет.', example: '3.19 запрещает разворот, но налево во двор — можно!', mistake: 'Путают 3.27 и 3.28: крест — ничего нельзя.', art: 'sign-ban', artCaption: 'Красная кайма — запрет. 3.27 крест — даже остановка запрещена.' },
      { title: '3.4 Предписывающие (4.x)', rule: 'Синий круг — «только так»: 4.1 направления, 4.3 круг, 4.6 минимальная скорость.', example: '4.1.1 «только прямо» — разворот запрещён.', art: 'sign-prescribe', artCaption: 'Синий круг приказывает: едешь только по стрелке.' },
      { title: '3.5 Информационные (5.x)', rule: 'Вводят режим: 5.1 магистраль, 5.21 жилая, 5.5 одностороннее, 5.19 переход.', example: 'Увидел 5.1 — действуют правила магистрали.', art: 'sign-info', artCaption: 'Синий прямоугольник включает новый режим движения.' },
      { title: '3.6 Сервис (6.x–7.x)', rule: 'Только информируют: заправка, больница, мойка. Не вводят запретов.', example: 'Знак сервиса не разрешает стоянку под запретом.', art: 'sign-info', artCaption: 'Сервис подсказывает, но ничего не разрешает и не запрещает.' },
      { title: '3.7 Таблички (8.x)', rule: 'Работают только со знаком сверху: время, зона, способ, категория. Меняют смысл знака.', example: '3.28 + 8.5.1 «8–18» — ночью стоять можно.', mistake: 'Отвечают по знаку, не глядя на табличку под ним.', art: 'sign-plate', artCaption: 'Табличка без знака не работает. Читай связку целиком.' },
    ],
    remember: ['Жёлтый фон — главнее', 'Табличка одна не работает', 'Кирпич ≠ Движение запрещено', 'STOP = встань + уступи'],
    warn: 'При споре: временный знак > постоянный знак > временная разметка > постоянная.',
  },
  {
    id: '4-razmetka', title: '4. Дорожная разметка',
    lead: '1.x — горизонтальная. Жёлтая временная главнее белой.',
    level: 'must', art: 'line-combo',
    artCaption: '1.11 сплошная + прерывистая: пересекать только со стороны прерывистой.',
    blocks: [
      { title: '1.1, 1.2, 1.3 — сплошные', rule: '1.1 разделяет потоки — не пересекай. 1.2 край — можно для остановки. 1.3 двойная при 4+ полосах — не пересекай.', example: 'Разворот через двойную — грубое нарушение.', art: 'line-solid', artCaption: 'Сплошная и двойная сплошная: пересекать запрещено всегда.' },
      { title: '1.5, 1.6, 1.7 — прерывистые', rule: '1.5 делит полосы — можно. 1.6 приближения с длинным штрихом — скоро сплошная! 1.7 на перекрёстках.', mistake: 'Начинают обгон на 1.6 — через 50 м уже сплошная.', art: 'line-dashed', artCaption: 'Длинный штрих 1.6 — предупреждение: готовься вернуться.' },
      { title: '1.9 и 1.11 — реверс и комбо', rule: '1.9 двойная прерывистая — реверс, только на зелёную стрелку. 1.11 — пересекай со стороны прерывистой.', example: 'Слева сплошная — обгонять нельзя.', art: 'line-combo', artCaption: 'Комбо-линия: смотри, с какой стороны ты едешь.' },
      { title: '1.4, 1.10, 1.17 — жёлтые запреты', rule: '1.4 жёлтая сплошная у края — остановка запрещена (как 3.27). 1.10 жёлтая прерывистая — стоянка запрещена. 1.17 у остановки ОТ — не стой.', example: 'Жёлтая линия у бордюра — ищи другое место.', art: 'line-stop', artCaption: 'Жёлтая разметка = запрет, как соответствующий знак.' },
      { title: '1.12–1.23: стоп, зебра, стрелы, А', rule: '1.12 стоп-линия — встань на красный. 1.13 треугольник — уступи. 1.14 зебра — пешеход главный. 1.18 стрелы — куда можно. 1.23 «А» — полоса маршрутных.', example: 'Стрела «только прямо» — с полосы нельзя поворачивать.', art: 'line-stop', artCaption: 'Стрелы и буква А на асфальте — обязательны, как знаки.' },
      { title: 'Вертикальная разметка', rule: 'Полосы на опорах, барьерах, тоннелях. Красно-белое — опасное место. Чёрно-белое — направляющее.', example: 'Красно-белый щит на опоре моста — объезжай по стрелке.', art: 'vertical', artCaption: 'Вертикальная не делит полосы, а показывает препятствие.' },
    ],
    remember: ['1.1 и 1.3 — никогда', '1.6 — скоро сплошная', '1.11 — со стороны прерывистой', 'Жёлтая главнее белой'],
  },
  {
    id: '5-svetofor', title: '5. Светофоры и регулировщик',
    lead: 'Регулировщик отменяет светофор и знаки приоритета.',
    level: 'must', art: 'regul-side',
    artCaption: 'Грудь/спина — стоп. Боком — прямо и направо. Рука вверх — стоп всем.',
    blocks: [
      { title: 'Красный, жёлтый, зелёный', rule: 'Красный — стоп. Жёлтый — стоп, кроме случая экстренного торможения. Зелёный — можно. Мигающий зелёный — скоро жёлтый, не ускоряйся.', example: 'Можешь встать плавно на жёлтый — стой.', art: 'light-rgy', artCaption: 'Жёлтый тоже запрещает: ехать можно, только если встанешь лишь юзом.' },
      { title: 'Стрелки и допсекции', rule: 'Стрелка = круг. Допсекция горит — туда можно. Погасла — туда нельзя, даже на зелёный. Стрелка с красным — можно, уступив всем.', example: 'Зелёный прямо + тёмная стрелка направо — направо стой.', mistake: 'Едут на стрелку с красным как на главную — уступаешь всем.', art: 'light-arrow', artCaption: 'Тёмная секция — запрет. Горящая с красным — уступи всем.' },
      { title: 'Реверсивный, трамвайный, пешеходный', rule: 'Реверс: крест — закрыта, стрелка — открыта, погас — уходи вправо. Белые точки — трамвайный. Человечек — пешеходный.', example: 'Реверс погас над тобой — перестройся вправо.', art: 'light-rev', artCaption: 'Красный крест над полосой — съезжай с неё немедленно.' },
      { title: 'Регулировщик: грудь и спина', rule: 'Руки в стороны/вниз: грудь и спина — стоп. Рука вверх — стоп всем. Со спины при руке вперёд — всем стоп.', example: 'Стоит к тебе грудью — стоишь, даже на зелёный.', art: 'regul-front', artCaption: 'Видишь грудь или спину — стой. Это 90% ошибок.' },
      { title: 'Регулировщик: боком и рука вперёд', rule: 'Боком — прямо и направо. Правая рука вперёд: слева — куда угодно, со стороны груди — только направо, справа и со спины — стоп. Трамвай — «из рукава в рукав».', example: 'Боком к тебе — налево и разворот нельзя.', mistake: '«Можно» ≠ «приоритет»: трамвай и пешеходы всё равно первые.', art: 'regul-side', artCaption: 'Боком разрешает прямо и направо, но трамвай пропускаешь.' },
    ],
    remember: ['Регулировщик главнее светофора', 'Погасшая секция — запрет', 'Стрелка+красный — уступи всем', 'Рука вверх — стоп всем'],
  },
  {
    id: '6-specsignaly', title: '6. Специальные сигналы',
    lead: 'Синий + звук = уступи. Остальное — без преимущества.',
    level: 'should', art: 'spec-blue',
    artCaption: 'Скорая с синим маячком и сиреной: прижмись вправо, не обгоняй.',
    blocks: [
      { title: 'Синий маячок + сирена', rule: 'Скорая, полиция, пожарные с синим и звуком — имеют преимущество. Освободи полосу, не обгоняй, прижмись вправо.', example: 'Скорая сзади в пробке — подвинься, даже на разметку.', art: 'spec-blue', artCaption: 'Без звука преимущества нет — только с сиреной.' },
      { title: 'Жёлтый маячок и звуковой сигнал', rule: 'Жёлтый (дорожники, эвакуатор) — только внимание, преимущества нет. Сигнал в городе — лишь от ДТП, за городом — и перед обгоном.', mistake: 'Уступают машине только с маячком без сирены.', art: 'spec-yellow', artCaption: 'Жёлтый мигает — просто будь осторожен, уступать не обязан.' },
    ],
    remember: ['Синий + звук = уступи', 'Жёлтый — без преимущества', 'Не обгоняй спецтранспорт'],
  },
  {
    id: '7-manevr', title: '7. Начало движения и маневрирование',
    lead: 'Поворотник предупреждает, но не даёт преимущества.',
    level: 'must', art: 'maneuver-shift',
    artCaption: 'Перестраиваешься — уступи тем, кто уже на полосе. Обоюдно — уступи правому.',
    blocks: [
      { title: 'Начало движения', rule: 'Перед стартом уступи попутным и встречным, включи поворотник, убедись в безопасности.', example: 'Отъезжаешь от бордюра — ждёшь, пока проедут.', art: 'maneuver-shift', artCaption: 'Старт — тоже манёвр: сначала смотри, потом едешь.' },
      { title: 'Кому уступать при перестроении', rule: 'Уступи тем, кто едет без смены полосы. При обоюдном — помеха справа: уступает левый.', example: 'Оба перестраиваетесь — ты слева, ждёшь.', art: 'maneuver-shift', artCaption: 'Главное правило перестроения: правый всегда прав при обоюдном.' },
      { title: 'Повороты и разворот', rule: 'Направо — к правому краю. Налево/разворот — к левому краю, с трамвайных попутных при занятых полосах. Не выезжай на встречку.', example: 'Разворот на перекрёстке — правыми бортами.', mistake: 'Поворачивают налево с середины — подрезают.', art: 'maneuver-turn', artCaption: 'Займи край перед поворотом, держи свою сторону на выезде.' },
      { title: 'Задний ход и сигналы', rule: 'Задний ход — только безопасно. Запрещён: перекрёстки, переходы, тоннели, мосты, переезды. Поворотник — заранее, но без преимущества.', example: 'Во дворе сдаёшь назад — пешеход сзади главный.', art: 'maneuver-back', artCaption: 'Не видишь — выйди и посмотри. Зеркал мало.' },
    ],
    remember: ['Поворотник ≠ преимущество', 'Обоюдно — уступи правому', 'Налево — с левого края', 'Задний ход — только безопасно'],
    warn: 'Сигнал не освобождает от обязанности уступить. Сначала смотри — потом крути.',
  },
  {
    id: '8-raspolozhenie', title: '8. Расположение ТС на дороге',
    lead: 'Держись правой, левую — для обгона и поворота.',
    level: 'must', art: 'lanes',
    artCaption: 'За городом — правее. Крайняя левая — для обгона, налево и разворота.',
    blocks: [
      { title: 'Выбор полосы', rule: 'Езжай по полосам. В городе — любая, за городом — правая. Крайняя левая — обгон/поворот. Грузовикам >2,5 т левая — только для поворота.', example: 'Трасса свободна справа — вернись вправо.', art: 'lanes', artCaption: 'Пустая правая, а ты в левой — уже нарушение за городом.' },
      { title: 'Трамвайные пути и встречка', rule: 'Попутные трамвайные — можно при занятых полосах и для налево (не мешая трамваю). Встречные трамвайные и встречка при 4+ полосах — нельзя.', mistake: 'Выезд на встречные трамвайные — лишение.', art: 'tram', artCaption: 'Попутные — можно при пробке, встречные — никогда.' },
      { title: 'Реверс, разделительная, одностороннее', rule: 'Реверс — только на зелёный. Разделительную не пересекай. Одностороннее — въезд/выезд по знакам.', example: 'Реверс погас — уходи вправо с полосы.', art: 'lanes', artCaption: 'Разделительная — не полоса и не обочина, на ней нельзя.' },
    ],
    remember: ['За городом — правее', 'Встречка при 4+ — табу', 'Встречный трамвай — нельзя', 'Реверс — по стрелке'],
  },
  {
    id: '9-skorost', title: '9. Скорость движения',
    lead: '60 / 20 / 90 / 110 / 50. Путь растёт квадратично.',
    level: 'must', art: 'speed',
    artCaption: 'Город 60, двор 20, трасса 90, магистраль 110, буксировка 50. Знак 3.24 главнее.',
    blocks: [
      { title: 'Таблица скоростей', rule: 'Город — 60. Жилая/двор — 20. Трасса легковые — 90. Магистраль — 110. Буксировка — 50. С прицепом — 70/90. Знак 3.24 перекрывает всё.', example: 'Знак 5.1 — можно 110, но знак 3.24 «90» — едешь 90.', art: 'speed', artCaption: 'Выучи пятёрку: 20 — 50 — 60 — 90 — 110.' },
      { title: 'Дистанция, интервал, торможение', rule: 'Скорость — по погоде, не только по знаку. Дистанция ≈ скорость/2. Интервал больше в дождь. Резко тормози лишь от ДТП.', mistake: '60 в туман 50 м — путь уже больше видимости.', art: 'distance', artCaption: 'Дистанция = скорость пополам: 60 → 30 м, 90 → 45 м.' },
    ],
    remember: ['60 / 20 / 90 / 110 / 50', 'Дистанция = скорость/2', '×2 скорость = ×4 путь', 'Резкое торможение — лишь от ДТП'],
  },
  {
    id: '10-obgon', title: '10. Обгон, опережение, встречный разъезд',
    lead: 'Обгон — только через встречку. Спрашивай запреты.',
    level: 'must', art: 'overtake-ban',
    artCaption: 'Запрещён: переход, переезд и 100 м до него, мост, регулируемый перекрёсток.',
    blocks: [
      { title: 'Что такое обгон и когда можно', rule: 'Обгон = встречка + возврат. Можно: нет запрета, разметка позволяет, встречка свободна, впереди не обгоняют, обгоняемый не мигает налево.', example: 'Впереди мигает налево — обгонять нельзя.', art: 'overtake-def', artCaption: 'Нет выезда на встречку — это опережение, а не обгон.' },
      { title: 'Где обгон запрещён', rule: 'Переходы, переезды + 100 м, мосты/тоннели, регулируемые перекрёстки, второстепенная на нерегулируемом, подъём, ограниченная видимость, 3.20, сплошная.', mistake: 'По главной на нерегулируемом — можно, на второстепенной — нет.', art: 'overtake-ban', artCaption: 'Переход и переезд — обгон запрещён всегда, без исключений.' },
      { title: 'Опережение и встречный разъезд', rule: 'Опережение в городе — по любой полосе. Разъезд: препятствие у тебя — ты стоишь. На подъёме вниз уступает. Узкое место — по 2.6/2.7.', example: 'Знак 2.6 у тебя — стой, пропусти встречных.', art: 'razjezd', artCaption: 'Кто едет вниз на подъёме — тот и уступает.' },
    ],
    remember: ['Обгон — только встречка', '100 м до переезда — стоп', 'Переход — никогда', 'Вниз уступает'],
  },
  {
    id: '11-ostanovka', title: '11. Остановка и стоянка',
    lead: 'Экзаменационный раздел. Выучи метры: 5 / 15 / 50.',
    level: 'must', art: 'stop-meters',
    artCaption: '5 м — до перехода. 15 м — от остановки ОТ. 50 м — стоянка от переезда.',
    signs: ['3.27', '3.28'],
    blocks: [
      { title: 'Где запрещены обе', rule: 'Трамвайные пути, тоннели, мосты (<3 полос), переходы и 5 м перед ними, 5 м от края пересекаемой, 15 м от остановок ОТ, <3 м до сплошной, закрываешь знаки.', example: 'Встал за 3 м до зебры — закрыл обзор.', art: 'stop-ban', artCaption: 'Зебра, перекрёсток, остановка — самые частые ловушки билетов.' },
      { title: 'Где запрещена только стоянка', rule: '50 м от переездов, за городом на проезжей части, под 3.28–3.30, с табличками.', example: '2 мин у переезда высадить — можно, 20 мин — стоянка, нельзя.', art: 'stop-meters', artCaption: 'Остановиться можно почти везде, а оставить — нет.' },
      { title: 'Как стоять правильно + знаки', rule: 'У правого края, слева — лишь в городе на односторонней/двухполосной без трамвая. За городом — обочина. 3.27 — ничего нельзя, 3.28 — остановка можно.', mistake: 'Второй ряд «на минутку» — нарушение.', art: 'stop-meters', artCaption: '3.27 крест — стой запрещена. 3.28 полоса — встать на 5 мин можно.' },
    ],
    remember: ['5 м — переход и край', '15 м — остановка ОТ', '50 м — стоянка у переезда', '3 м до сплошной оставь'],
  },
  {
    id: '12-perekrestki', title: '12. Проезд перекрёстков',
    lead: 'Самый большой раздел. Алгоритм из 6 шагов.',
    level: 'must', art: 'cross-algo',
    artCaption: 'Порядок: регулировщик → светофор → знаки → помеха справа. Трамвай на равных — первый.',
    signs: ['2.1', '2.4', '2.5'],
    blocks: [
      { title: 'Алгоритм за 6 шагов', rule: '1) Регулируемый? 2) Главная? 3) Главная меняет направление? 4) Равные? помеха справа. 5) Трамвай на равных — первый. 6) Разрешающий ≠ приоритет.', example: 'Оба на зелёный, ты налево — пропусти встречных прямо.', art: 'cross-algo', artCaption: 'Иди по стрелкам, а не по памяти: тип → главная → трамвай → справа.' },
      { title: 'Регулируемый: стрелка, стоп, затор', rule: 'Стоп-линия — встань на красный. Стрелка с красным — уступи всем. Затор впереди — не въезжай.', example: 'Стрелка направо + красный — едешь, пропуская всех.', art: 'cross-reg', artCaption: 'Затор за перекрёстком — стой перед ним, не создавай пробку.' },
      { title: 'Нерегулируемый и круг', rule: 'На главной — первый, при смене главной — уступи тем, кто тоже на главной справа. Со второстепенной — всем с главной. Круг 4.3 — уступи тем, кто на кругу.', example: 'Главная уходит направо — считай как два перекрёстка.', mistake: 'Круг без знаков — по помехе справа, не «всегда главный».', art: 'cross-circle', artCaption: 'Въезжаешь на круг — уступи тем, кто уже крутится.' },
    ],
    remember: ['Сначала тип перекрёстка', 'Трамвай на равных — первый', 'Стрелка+красный — уступи', 'Затор — не въезжай', 'Круг — уступи кругу'],
    warn: '10 типовых схем для повторения: прямо/прямо, налево/прямо, разворот, смена главной (2), круг, трамвай, стрелка, затор, 4 авто на равных.',
  },
  {
    id: '13-peshehody', title: '13. Пешеходные переходы и остановки',
    lead: 'Пешеход на зебре почти всегда прав.',
    level: 'must', art: 'ped-zebra',
    artCaption: 'Ступил на зебру — пропусти. Машина рядом встала — встань тоже.',
    blocks: [
      { title: 'Регулируемый и нерегулируемый переход', rule: 'Зелёный пешеходу — стой. Без светофора — уступи идущему или явно намеренному. Впереди встали — тоже стой, не объезжай.', example: 'Справа встали перед зеброй — там пешеход, не жми.', art: 'ped-zebra', artCaption: 'Закрыл обзор пешеходу — уже создал аварийную ситуацию.' },
      { title: 'Вело, дети, трамвай, автобус', rule: 'Вело должен спешиться на переходе. Детей пропускай вдвойне внимательно. У трамвая без островка — стой при посадке. Автобус с «детьми» — снизь скорость.', mistake: 'Сигналить пешеходу на переходе — нарушение.', art: 'tram-stop', artCaption: 'Трамвай высаживает — стоишь, пока двери не закрылись.' },
    ],
    remember: ['Встали перед зеброй — встань', 'Обгон на переходе — запрещён', 'Трамвай высаживает — стой', 'Разворот на переходе — запрещён'],
  },
  {
    id: '14-pereezd', title: '14. Железнодорожные переезды',
    lead: 'Красный мигает — стой, даже если шлагбаум поднят.',
    level: 'must', art: 'rail-red',
    artCaption: 'Стоп: 5 м до шлагбаума, 10 м до рельса. Затор за переездом — не въезжай.',
    blocks: [
      { title: 'Где встать и когда стоп', rule: 'Стоп у 2.5, стоп-линии, шлагбаума (5 м), без него — 10 м до рельса. Запрещено: красный, закрытый шлагбаум, запрет дежурного, затор.', example: 'Затор сразу за рельсами — жди до переезда.', art: 'rail-red', artCaption: 'Поезд не остановится: 5 м и 10 м — твоя страховка.' },
      { title: 'Заглох на переезде — алгоритм', rule: '1) Высади всех. 2) Пошли людей вдоль путей навстречу поезду. 3) Толкай/стартер на передаче. 4) При поезде — беги навстречу ему. 5) Звони 112.', mistake: 'Сидят и долго крутят стартер — теряют время.', art: 'rail-stuck', artCaption: 'Люди — вон из машины сразу, железо потом.' },
      { title: 'Обгон и стоянка у переезда', rule: 'Обгон запрещён на переезде и за 100 м до него. Стоянка ближе 50 м — запрещена.', example: 'Знак 1.1 — обгон уже запрещён, не только на рельсах.', art: 'overtake-ban', artCaption: '100 м до переезда — уже без обгона. 50 м — без стоянки.' },
    ],
    remember: ['Красный — стоп всегда', '5 м / 10 м', 'Затор — не въезжай', '100 м — без обгона', 'Заглох — людей вон'],
  },
  {
    id: '15-magistral', title: '15. Автомагистрали',
    lead: 'Знак 5.1: быстро, без остановок и пешеходов.',
    level: 'should', art: 'highway',
    artCaption: '5.1: 110 км/ч, остановка лишь на площадках, разворот и задний ход запрещены.',
    blocks: [
      { title: 'Что такое магистраль', rule: 'Зелёный знак 5.1: полосы, разделительная, без пересечений. Легковые — 110, грузовики/автобусы — ниже.', example: '5.3 «Дорога для авто» — почти те же запреты.', art: 'highway', artCaption: 'Увидел зелёный 5.1 — включи режим магистрали в голове.' },
      { title: 'Что запрещено', rule: 'Пешеходы, вело, СИМ, тихоходы <40, учебная езда, разворот, задний ход, остановка вне площадок, фурам — дальше второй полосы.', mistake: 'Фото на обочине магистрали — запрещено.', art: 'stop-ban', artCaption: 'Остановка на магистрали — только на площадке с карманом.' },
    ],
    remember: ['5.1 — 110', 'Разворот и задний ход — нет', 'Стоп — только площадки', 'Пешеход — нет'],
  },
  {
    id: '16-zhilaya', title: '16. Жилые зоны',
    lead: 'Знак 5.21: пешеход идёт по проезжей части.',
    level: 'should', art: 'living',
    artCaption: '5.21: 20 км/ч, пешеход везде главный, сквозной и учебная запрещены.',
    blocks: [
      { title: 'Правила зоны', rule: 'Скорость 20. Пешеходы где хотят, но без создания помех. Сквозной, учебная, долгий прогрев — запрещены.', example: 'Объезд пробки через двор — сквозное, запрещено.', art: 'living', artCaption: 'Двор — не трасса срезать: сквозной проезд запрещён.' },
      { title: 'Выезд из зоны', rule: 'Выезд из жилой/двора — как со второстепенной: уступи всем.', example: 'Направо со двора — пропусти машины и пешехода на тротуаре.', art: 'cross-yard', artCaption: 'Выезжаешь — ты всегда второстепенный, помехи справа нет.' },
    ],
    remember: ['20 км/ч', 'Пешеход главный', 'Сквозь — нельзя', 'Выезд — уступи всем'],
  },
  {
    id: '17-svet', title: '17. Световые приборы',
    lead: 'Днём — ДХО/ближний. Ночью — не слепи.',
    level: 'should', art: 'light-night',
    artCaption: 'Встречка ближе 150 м — переключись на ближний. В светлом городе — без дальнего.',
    blocks: [
      { title: 'Когда что включать', rule: 'День — ДХО/ближний всегда. Ночь/тоннель — ближний/дальний. Туман — ближний + передние ПТФ, задние ПТФ — лишь в сильный туман.', example: 'Задние туманки в ясную ночь — слепишь сзади.', art: 'light-night', artCaption: 'ДХО днём — обязательно. Забыл свет — уже нарушение.' },
      { title: 'Дальний: переключение и запрет', rule: 'Встречка <150 м — ближний. Ослепил — заранее ближний. Освещённый город и ослепление сзади — только ближний.', mistake: 'Моргать дальним «в спину» — ослепление, запрещено.', art: 'light-night', artCaption: '150 м до встречки — граница дальнего и ближнего.' },
    ],
    remember: ['День — ДХО/ближний', '150 м — ближний', 'Город светлый — без дальнего', 'Задние ПТФ — лишь туман'],
  },
  {
    id: '18-buksir', title: '18. Буксировка',
    lead: 'Гибкая 4–6 м, жёсткая до 4 м, скорость 50.',
    level: 'pro', art: 'tow',
    artCaption: 'Гибкая — только без гололёда. Сзади — аварийка. Гололёд — лишь жёсткая/эвакуатор.',
    blocks: [
      { title: 'Сцепки и требования', rule: 'Гибкая 4–6 м с флажками, жёсткая до 4 м, частичная — эвакуатор. Скорость 50. Сзади — аварийка, руль/тормоза работают, водитель за рулём.', example: 'Трос в гололёд — запрещено.', art: 'tow', artCaption: 'Трос 4–6 м с флажками, иначе его не видно.' },
      { title: 'Когда запрещена', rule: 'Гололёд на гибкой, неисправные тормоза/руль, мото без коляски, два прицепа, автобусы с прицепом.', mistake: 'Тянут без тормозов на тросе — лишь частичной погрузкой.', art: 'fault', artCaption: 'Нет тормозов или руля — только эвакуатор, трос нельзя.' },
    ],
    remember: ['4–6 м гибкая', '50 км/ч', 'Гололёд — без троса', 'Аварийка сзади'],
  },
  {
    id: '19-lyudi', title: '19. Перевозка людей',
    lead: 'Ремни всем, дети — в кресле, по числу мест.',
    level: 'should', art: 'kids',
    artCaption: 'До 7 — кресло везде. 7–11 сзади — ремень, спереди — кресло.',
    blocks: [
      { title: 'Ремни, дети, посадка', rule: 'Пристегнуты все, где есть ремни. До 7 — кресло везде. 7–11: сзади ремень, спереди кресло. Мото — шлем. Посадка — после остановки.', example: '8 лет сзади пристёгнут — можно. Спереди — лишь в кресле.', art: 'kids', artCaption: 'Ребёнок на руках — вылетает при ударе. Только кресло.' },
      { title: 'Где и сколько везти', rule: 'Строго по числу мест. В кузове — лишь оборудованный со стажем. Детей в кузове/прицепе — запрещено.', mistake: 'Лишний пассажир без места — нарушение.', art: 'belt', artCaption: 'Нет места и ремня — везти нельзя, даже «тут рядом».' },
    ],
    remember: ['Все пристёгнуты', 'До 7 — кресло везде', 'Спереди до 11 — кресло', 'По числу мест'],
  },
  {
    id: '20-gruz', title: '20. Перевозка грузов',
    lead: 'Не закрывай обзор, свет, номера. Крепи надёжно.',
    level: 'pro', art: 'cargo',
    artCaption: 'Выступ >1 м сзади/спереди или >0,4 сбоку — знак. Ночью + фонари.',
    blocks: [
      { title: 'Габариты и крепление', rule: 'Не превышай без разрешения, крепи, распределяй. Сзади >1 м — красный щит, ночью — красный фонарь; спереди — белый.', example: 'Доски 1,5 м сзади: днём щит, ночью фонарь.', art: 'cargo', artCaption: 'Торчит больше метра — обозначь, иначе удар сзади.' },
      { title: 'Что запрещено грузу', rule: 'Нельзя: шуметь/пылить, закрывать фары/номера, волочиться, мешать рулить. Опасные — по спецправилам.', mistake: 'Закрыл номер грузом — нарушение.', art: 'cargo', artCaption: 'Груз закрыл фару или номер — переложи или не едь.' },
    ],
    remember: ['1 м / 0,4 м — знак', 'Не закрывай свет и номер', 'Крепи надёжно', 'Ночью — фонари'],
  },
  {
    id: '21-uchebnaya', title: '21. Учебная езда',
    lead: 'Знак «У», инструктор, педали и зеркала.',
    level: 'pro', art: 'study-u',
    artCaption: 'Учебная — лишь с инструктором, вне магистралей. Ученик знает ПДД.',
    blocks: [
      { title: 'Требования', rule: 'Авто со знаком «У», допедали, зеркала инструктора. Инструктор с правами и стажем. Ученик знает ПДД.', example: 'Учишь друга на своей без педалей — передача руля.', art: 'study-u', artCaption: 'Без буквы «У» и педалей — это не учебная езда.' },
      { title: 'Где запрещена', rule: 'Магистрали, жилые по знаку, места запрета учебной езды. Возраст: мото/авто — с 16/18 в автошколе.', mistake: 'Новичка на магистраль «привыкать» — запрещено.', art: 'highway', artCaption: 'Магистраль для ученика — табу, даже с инструктором.' },
    ],
    remember: ['Знак У + педали', 'Инструктор рядом', 'Магистраль — нет', 'Ученик знает ПДД'],
  },
  {
    id: '22-neispravnosti', title: '22. Неисправности — ехать нельзя',
    lead: 'Тормоза, руль, свет, шины, дворник — стоп.',
    level: 'must', art: 'fault',
    artCaption: 'Тормоза, руль, фары ночью, шины, сцепное — движение запрещено.',
    blocks: [
      { title: 'Движение запрещено', rule: 'Рабочие тормоза, рулевое, сцепное, фары/фонари ночью и в тумане, дворник водителя в дождь, шины (порезы, корд, протектор).', example: 'Одна фара ночью — жди светло или эвакуатор.', art: 'fault', artCaption: 'Горит «тормоза!» на панели — ехать запрещено.' },
      { title: 'До сервиса — осторожно', rule: 'Зеркала, стёкла, глушитель, ремни, номера — до устранения, но доехать можно.', mistake: 'Едут с лысой резиной «до шиномонтажа» — уже стоп.', art: 'fault', artCaption: 'Раздели: «ехать нельзя» и «до сервиса можно».' },
    ],
    remember: ['Тормоза/руль — стоп', 'Ночь без фар — стоп', 'Шины лысые — стоп', 'Дворник в дождь — стоп'],
  },
  {
    id: '23-bezopasnost', title: '23. Основы безопасности',
    lead: 'Дистанция, погода, занос и аквапланирование.',
    level: 'should', art: 'safety-rain',
    artCaption: 'Мокро/лёд/туман — скорость ниже, дистанция ×2. Всё плавно.',
    blocks: [
      { title: 'Дистанция и тормозной путь', rule: 'Сухо — 2 сек до впереди. Мокро — ×2. Реакция ~1 сек = 17 м на 60. Мокрый путь ×2, лёд ×5–10.', example: 'Дождь 90 км/ч — держи 70–90 м, а не 45.', art: 'distance', artCaption: 'Считай секундами: «раз-два» до машины впереди.' },
      { title: 'Ночь, туман, занос, аквапланирование', rule: 'Ночь — скорость под фары. Туман — ближний, без обгонов. Ослепили — аварийка + тормози прямо. Занос: передний — газу чуть, задний — газ отпусти + руль в сторону заноса. Лужа — газ отпусти, руль прямо.', mistake: 'Тормоз в пол в заносе — разворот.', art: 'safety-rain', artCaption: 'Занос: смотри куда ехать, руль — в сторону заноса.' },
    ],
    remember: ['Дистанция ×2 в дождь', 'Скорость — под видимость', 'Ослепили — тормози прямо', 'Лёд — всё плавно'],
  },
  {
    id: '24-pomoshch', title: '24. Первая помощь',
    lead: 'Сначала убери опасность. Кровь важнее перелома.',
    level: 'should', art: 'aid',
    artCaption: '30 : 2, 100–120/мин, 5–6 см. Дышит без сознания — на бок.',
    blocks: [
      { title: 'Порядок при ДТП', rule: '1) Стоп, знак, 112. 2) Убери огонь/дым. 3) Сильное кровотечение — жгут + время. 4) Не дышит — СЛР 30:2. 5) Дышит без сознания — на бок.', example: 'Фонтан крови — сначала жгут, потом остальное.', art: 'aid', artCaption: 'Сильная кровь из конечности — жгут выше раны + записка.' },
      { title: 'Чего нельзя', rule: 'Не вынимай предметы из ран, не двигай при травме спины без угрозы, не давай лекарства/воду.', mistake: 'Снимают шлем при травме шеи — можно добить.', art: 'aid', artCaption: 'Спина травмирована — двигай лишь при пожаре.' },
    ],
    remember: ['112 первым', 'Кровь — жгут + время', '30:2, 100–120', 'Без сознания — на бок'],
    warn: 'Жгут — лишь при сильном кровотечении конечности. Слабое остановит давящая повязка.',
  },
  {
    id: '25-otvetstvennost', title: '25. Ответственность водителя',
    lead: 'Что лишает прав, а что — штраф.',
    level: 'should', art: 'fine',
    artCaption: 'Пьяный, встречка, скрылся, повторный красный — лишение. Ремень и ОСАГО — штраф.',
    blocks: [
      { title: 'Лишение прав', rule: 'Пьянка/отказ, встречка, скрылся с ДТП, повторный красный и крупное превышение, подложные номера.', example: 'Уехал с царапины «не заметил» — всё равно лишение.', art: 'fine', artCaption: 'Скрылся с места даже мелкого ДТП — лишение прав.' },
      { title: 'Штрафы и предупреждение', rule: 'Превышение, ремень, телефон, без ОСАГО, не уступил пешеходу, стоянка под знаком. Предупреждение — мелкое впервые.', mistake: 'Без ОСАГО «разок» — штраф при каждой остановке.', art: 'fine', artCaption: 'Нет ОСАГО — штраф каждый раз, когда остановят.' },
    ],
    remember: ['Пьяный — лишение', 'Скрылся — лишение', 'Встречка — лишение', 'ОСАГО вози всегда'],
  },
  {
    id: '26-lovushki', title: 'Экзаменационные ловушки',
    lead: '10 пар, где сыплются чаще всего. Прочти дважды.',
    level: 'must', art: 'trap',
    artCaption: 'Разрешение двигаться ≠ преимущество. Знак с табличкой — другой ответ.',
    blocks: [
      { title: 'Остановка vs стоянка', rule: 'Остановка — до 5 мин/посадка. Стоянка — дольше. Под 3.28 остановка можно.', example: '4 мин высаживаешь — можно. 6 мин — нельзя.', art: 'stop5', artCaption: 'Смотри время и посадку, а не «на минутку».' },
      { title: 'Обгон vs опережение', rule: 'Обгон — встречка. Опережение — попутно. Справа обгона нет.', example: 'Объехал справа по полосе — ищи не запрет обгона.', art: 'overtake-def', artCaption: 'Вопрос про «обгон» без встречки — это опережение.' },
      { title: 'Главная vs преимущество', rule: 'Главная — статус дороги. Преимущество — право первым в ситуации.', example: 'На главной при её повороте уступаешь тем, кто тоже на главной.', art: 'main-road', artCaption: 'Главная не даёт права таранить: смотри манёвр.' },
      { title: 'Знак vs разметка', rule: 'Временный знак > постоянный > временная разметка > постоянная. Жёлтая — временная.', example: 'Знак разрешает, разметка запрещает — слушай знак.', art: 'sign-yellow', artCaption: 'Спор знака и разметки — всегда побеждает знак.' },
      { title: 'Допсекция светофора', rule: 'Погасла — туда нельзя. Горит с красным — можно, уступив всем.', example: 'Зелёный прямо + тёмная направо — направо стой.', art: 'light-arrow', artCaption: 'Тёмная стрелка — самая частая ловушка билетов.' },
      { title: 'Трамвай и перестроение', rule: 'Трамвай первый на равных (кроме депо). Перестроение — уступи попутным; поворот — займи край.', example: 'Поворачиваешь с путей — уступи встречным.', art: 'tram', artCaption: 'Трамвай против авто на равных — ставь на трамвай.' },
      { title: 'Двор vs перекрёсток, переход vs вело', rule: 'Выезд со двора — не перекрёсток, уступает выезжающий. Переход — пешеход главный; велодорожка — по знакам.', example: 'Выезжаешь с АЗС — помехи справа у тебя нет.', art: 'cross-yard', artCaption: 'Двор, АЗС, парковка — всегда второстепенные.' },
    ],
    remember: ['Читай «разрешено/запрещено»', 'Смотри знак+табличка+разметка', 'Трамвай почти всегда первый', 'Разрешено ≠ приоритет'],
  },
  {
    id: '27-cifry', title: 'Цифры, которые нужно знать',
    lead: 'Зубрёжка за 10 минут перед экзаменом.',
    level: 'must', art: 'numbers',
    artCaption: '5 — переход. 15 — остановка ОТ и знак в городе. 30 — знак за городом. 50 — переезд.',
    blocks: [
      { title: 'Расстояния', rule: '5 м — переход/край. 15 м — остановки ОТ + знак ДТП в городе. 30 м — знак за городом. 50 м — стоянка от переезда. 100 м — без обгона до переезда. 150 м — ближний, знаки за городом 150–300. 300 м — недостаточная видимость.', example: '10 м от остановки — нарушение, нужно 15.', art: 'numbers', artCaption: 'Выучи лесенку: 5 — 15 — 30 — 50 — 100 — 150 — 300.' },
      { title: 'Скорости', rule: '20 — двор/жилая. 50 — буксировка. 60 — город. 70 — с прицепом вне города. 90 — трасса. 110 — магистраль.', example: 'Буксируешь 60 — уже превышение.', art: 'speed', artCaption: 'Лесенка скоростей: 20 — 50 — 60 — 90 — 110.' },
      { title: 'Время и условия', rule: 'Разворот запрещён: переход, тоннель, мост, переезд, видимость <100 м. Жгут — записка со временем. Экзамен: 20 вопросов/20 мин, ошибка +5 вопросов.', example: 'Видимость 80 м — разворот запрещён без знака.', art: 'algo', artCaption: '5 мест без разворота + 20/20 на экзамене.' },
    ],
    remember: ['5 / 15 / 30 / 50 / 100 / 150 / 300', '20 / 50 / 60 / 90 / 110', '5 мест без разворота', '20/20 +5 за ошибку'],
  },
  {
    id: '28-algoritm', title: 'Как решать билет — алгоритмы',
    lead: 'Три схемы покрывают 80% вопросов. Иди по стрелкам.',
    level: 'must', art: 'cross-algo',
    artCaption: 'Перекрёсток: регулируемый? → главная? → трамвай? → помеха справа?',
    blocks: [
      { title: 'Перекрёсток', rule: 'Регулируемый? → свет/регулировщик. Нет? → главная? → кто на главной. Равные? → трамвай → справа → манёвр (налево — пропусти встречных).', example: 'Ты на второстепенной налево, по главной едут — пропускаешь.', art: 'cross-algo', artCaption: 'Не гадай: тип → главная → трамвай → справа → манёвр.' },
      { title: 'Остановка', rule: 'Знак 3.27/3.28? → жёлтая разметка? → переход/перекрёсток/ОТ? → метры 5/15/50 → 3 м до сплошной? → край/обочина?', example: 'Знака нет, но 4 м до перехода — «запрещено».', art: 'algo', artCaption: 'Проверяй по цепочке: знак → разметка → место → метры.' },
      { title: 'Обгон', rule: 'Есть встречка? → 3.20? → сплошная? → участок (переход/переезд/мост/подъём)? → встречка свободна + никто не обгоняет?', example: 'Прерывистая, но конец подъёма — запрещено.', art: 'overtake-ban', artCaption: 'Один «да» на запрет — ответ «запрещено».' },
    ],
    remember: ['Сначала тип, потом детали', 'Смотри картинку целиком', 'Табличка меняет ответ', 'Лёгкие билеты — сначала'],
  },
];

/* ---------- мелкие компоненты ---------- */

const SignRow: React.FC<{ numbers?: string[] }> = ({ numbers }) => {
  if (!numbers?.length) return null;
  const items = numbers.map((n) => ({ n, src: signSrc(n) })).filter((x) => x.src);
  if (!items.length) return null;
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
      {items.map((s) => (
        <div key={s.n} className="shrink-0 w-[76px] rounded-xl bg-white p-1.5 text-center">
          <img src={encodeURI(s.src!)} alt={`Знак ${s.n}`} loading="lazy" className="w-full aspect-square object-contain" />
          <div className="text-[11px] font-extrabold text-bg">{s.n}</div>
        </div>
      ))}
    </div>
  );
};

export const MemoPage: React.FC = () => {
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | Level>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTIONS.filter((s) => {
      if (level !== 'all' && s.level !== level) return false;
      if (!q) return true;
      const hay = [s.title, s.lead, ...s.blocks.flatMap((b) => [b.title, b.rule, b.example ?? '', b.mistake ?? ''])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, level]);

  const scrollTo = (id: string) => {
    document.getElementById(`memo-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-[560px] mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => nav('/')} aria-label="Назад" className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center shrink-0">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="min-w-0">
            <div className="text-white font-bold leading-tight">Памятка ПДД — полный курс</div>
            <div className="text-muted text-xs">28 разделов • картинка к каждому пункту • ловушки • цифры</div>
          </div>
        </div>
        <div className="max-w-[560px] mx-auto px-4 pb-3 space-y-2">
          <div className="flex items-center gap-2 rounded-2xl bg-card border border-white/5 px-3">
            <Search size={16} className="text-muted shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти: обгон, 5 метров, регулировщик…"
              className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-muted/60 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Очистить"><X size={16} className="text-muted" /></button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {([
              { k: 'all', label: 'Все' },
              { k: 'must', label: 'Обязательно' },
              { k: 'should', label: 'Понимать' },
              { k: 'pro', label: 'Для уверенности' },
            ] as const).map((f) => (
              <button
                key={f.k}
                onClick={() => setLevel(f.k)}
                className={[
                  'shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition',
                  level === f.k ? 'bg-primary border-primary text-white' : 'bg-card border-white/10 text-muted',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
            <div className="ml-auto text-muted text-xs self-center shrink-0">{filtered.length}/28</div>
          </div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pt-4">
        <div className="rounded-3xl bg-card border border-white/5 p-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <BookOpen size={16} className="text-primary" /> Содержание
          </div>
          <div className="mt-2 space-y-1">
            {SECTIONS.map((s, i) => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-xl hover:bg-white/5 transition">
                <span className="text-muted text-xs font-bold w-6 shrink-0">{i + 1}</span>
                <span className="text-white/90 text-[13px] leading-tight flex-1">{s.title}</span>
                <ChevronRight size={14} className="text-muted shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filtered.length === 0 && (
            <div className="text-center text-muted text-sm py-12">Ничего не найдено — попробуй другой запрос</div>
          )}
          {filtered.map((s) => {
            const idx = SECTIONS.indexOf(s);
            const meta = LEVEL_META[s.level];
            return (
              <div key={s.id} id={`memo-${s.id}`} className="rounded-3xl bg-card border border-white/5 p-5 scroll-mt-40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-black shrink-0 text-sm">
                    {idx + 1}
                  </div>
                  <div className="text-white font-bold leading-tight flex-1">{s.title}</div>
                </div>
                <div className={`mt-2 inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.cls}`}>{meta.label}</div>
                <div className="text-muted text-sm mt-2">{s.lead}</div>

                <div className="mt-3">
                  <Art kind={s.art} caption={s.artCaption} big />
                </div>
                <SignRow numbers={s.signs} />

                <div className="mt-3 space-y-3">
                  {s.blocks.map((b, j) => (
                    <div key={j} className="rounded-2xl bg-card-2/60 border border-white/5 p-3.5">
                      <div className="text-white text-sm font-bold">{b.title}</div>
                      <div className="mt-2">
                        <Art kind={b.art} caption={b.artCaption} />
                      </div>
                      <div className="mt-2.5 flex gap-2 text-[13px]">
                        <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
                        <div className="text-white/90 leading-relaxed">{b.rule}</div>
                      </div>
                      {b.example && (
                        <div className="mt-1.5 flex gap-2 text-[13px]">
                          <Lightbulb size={15} className="text-accent shrink-0 mt-0.5" />
                          <div className="text-white/75 leading-relaxed"><span className="text-accent font-semibold">Пример: </span>{b.example}</div>
                        </div>
                      )}
                      {b.exception && (
                        <div className="mt-1 text-[13px] text-white/75 leading-relaxed"><span className="font-semibold text-white">Исключение: </span>{b.exception}</div>
                      )}
                      {b.mistake && (
                        <div className="mt-1.5 flex gap-2 text-[13px]">
                          <AlertTriangle size={15} className="text-danger shrink-0 mt-0.5" />
                          <div className="text-white/75 leading-relaxed"><span className="text-danger font-semibold">Ловушка: </span>{b.mistake}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {s.warn && (
                  <div className="mt-3 rounded-2xl bg-danger/10 border border-danger/40 p-3 flex gap-2.5 text-[13px]">
                    <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
                    <div className="text-white/90 leading-relaxed">{s.warn}</div>
                  </div>
                )}

                <div className="mt-3 rounded-2xl bg-primary/10 border border-primary/30 p-3.5">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-extrabold uppercase tracking-wide">
                    <Hash size={13} /> 5 вещей запомнить
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {s.remember.map((r, k) => (
                      <li key={k} className="text-white/90 text-[13px] leading-relaxed">• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-3xl bg-gradient-to-br from-primary/25 to-success/15 border border-white/10 p-5">
          <div className="flex items-center gap-2 text-white font-bold"><Brain size={16} className="text-accent" /> Как повторять</div>
          <div className="text-white/85 text-[13px] mt-1.5 leading-relaxed">
            День 1 — разделы 1–7. День 2 — 8–14. День 3 — 15–22. День 4 — 23–28 + «Цифры» и «Ловушки».
            Перед экзаменом прогони только блоки «5 вещей запомнить» и три алгоритма из раздела 28.
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};
