export interface Video {
  id: string;
  title: string;
  url: string;
  duration: number; // seconds
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  image?: string; // картинка знака в самом вопросе, напр. '/signs/...'
  answerImages?: (string | undefined)[]; // картинки слева от вариантов ответа (параллельно answers)
}

export interface Stage {
  id: number;
  title: string;
  description: string;
  videos: Video[];
  questions: QuizQuestion[];
}

import { SIGNS, type SignItem } from './signs';

// Поиск знака по номеру (для привязки картинок к текстовым вариантам)
const SIGN_BY_NUMBER = new Map<string, SignItem>();
for (const s of SIGNS) {
  if (!SIGN_BY_NUMBER.has(s.number)) SIGN_BY_NUMBER.set(s.number, s);
}

export const FULL_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLdemoPDD2026';

const VIDEO_BASE = 'https://example.com/video';
const PASSING_SCORE = 70;

// ——— Названия 40 этапов ———
const STAGE_TITLES: { title: string; description: string }[] = [
  { title: 'Введение', description: 'Основы курса и правила дорожного движения' },
  { title: 'Общие положения', description: 'Термины и базовые понятия ПДД' },
  { title: 'Перекрёстки и приоритеты', description: 'Проезд перекрёстков всех типов' },
  { title: 'Обгон', description: 'Правила обгона и опережения' },
  { title: 'Остановка и стоянка', description: 'Где можно и нельзя останавливаться' },
  { title: 'Движение в городе', description: 'Городские дороги и улицы' },
  { title: 'Движение по автомагистралям', description: 'Выезд и движение по трассе' },
  { title: 'Световые приборы', description: 'Фары, габариты, противотуманки' },
  { title: 'Прочие ситуации', description: 'Нестандартные дорожные ситуации' },
  { title: 'Скорость движения', description: 'Ограничения и выбор скорости' },
  { title: 'Маневрирование', description: 'Начало движения, повороты, развороты' },
  { title: 'Расположение ТС на дороге', description: 'Полосы и ряды движения' },
  { title: 'Пешеходные переходы', description: 'Проезд пешеходных переходов' },
  { title: 'Железнодорожные переезды', description: 'Правила проезда переездов' },
  { title: 'Приоритет маршрутных ТС', description: 'Автобусы, троллейбусы, трамваи' },
  { title: 'Особые условия движения', description: 'Дождь, снег, туман, гололёд' },
  { title: 'Буксировка', description: 'Правила буксировки транспортных средств' },
  { title: 'Перевозка людей и грузов', description: 'Требования к перевозкам' },
  { title: 'Велосипеды и СИМ', description: 'Велосипедисты и средства индивидуальной мобильности' },
  { title: 'Гужевые повозки и животные', description: 'Движение гужевого транспорта' },
  { title: 'Дорожные знаки: предупреждающие', description: 'Предупреждающие знаки' },
  { title: 'Дорожные знаки: приоритета', description: 'Знаки приоритета' },
  { title: 'Дорожные знаки: запрещающие', description: 'Запрещающие знаки' },
  { title: 'Дорожные знаки: предписывающие', description: 'Предписывающие знаки' },
  { title: 'Дорожные знаки: особых предписаний', description: 'Знаки особых предписаний' },
  { title: 'Дорожные знаки: сервис', description: 'Знаки сервиса' },
  { title: 'Дорожные знаки: информационные', description: 'Информационные знаки' },
  { title: 'Дорожная разметка', description: 'Горизонтальная и вертикальная разметка' },
  { title: 'Сигналы светофора', description: 'Виды светофоров и их сигналы' },
  { title: 'Сигналы регулировщика', description: 'Позы и жесты регулировщика' },
  { title: 'Аварийная сигнализация', description: 'Когда включать аварийку' },
  { title: 'Начало движения', description: 'Порядок начала движения' },
  { title: 'Обязанности водителей', description: 'Документы, ответственность' },
  { title: 'Обязанности пешеходов', description: 'Правила для пешеходов' },
  { title: 'Обязанности пассажиров', description: 'Правила для пассажиров' },
  { title: 'Первая помощь', description: 'Основы первой помощи пострадавшим' },
  { title: 'Медицина: травмы', description: 'Травмы и способы их обработки' },
  { title: 'Медицина: реанимация', description: 'Сердечно-лёгочная реанимация' },
  { title: 'Правовые основы', description: 'Административная и уголовная ответственность' },
  { title: 'Экзамен и финал', description: 'Итоговое повторение и экзамен' },
];

// ——— Генерация видео для этапа (20 на этап) ———
const VIDEO_THEMES = [
  'Виды перекрёстков', 'Главная дорога', 'Помеха справа', 'Круговое движение',
  'Регулируемые перекрёстки', 'Нерегулируемые перекрёстки', 'Знаки приоритета',
  'Разметка на перекрёстке', 'Поворот налево', 'Поворот направо', 'Разворот',
  'Движение прямо', 'Светофор на перекрёстке', 'Регулировщик', 'Полосы движения',
  'Опережение', 'Остановка перед перекрёстком', 'Пешеходы на переходе',
  'Велодорожки', 'Трамвайные пути',
];

function buildVideos(stageId: number): Video[] {
  return VIDEO_THEMES.map((theme, idx) => ({
    id: `${stageId}-${idx + 1}`,
    title: `${String(idx + 1).padStart(2, '0')}. ${theme}`,
    url: `${VIDEO_BASE}/${stageId}/${idx + 1}.mp4`,
    duration: 60 + ((stageId * 7 + idx * 13) % 120),
  }));
}

// ——— Генерация вопросов для этапа (14 общих на этап; у этапов знаков — 15 по знакам) ———
// img: номера знаков для картинок слева от вариантов (null — без картинки)
const QUESTION_TEMPLATES: { q: string; a: string[]; c: number; e: string; img?: (string | null)[] }[] = [
  {
    q: 'Какой знак запрещает движение?',
    a: ['Движение запрещено', 'Въезд запрещен', 'Движение механических транспортных средств запрещено', 'Остановка запрещена'],
    c: 0,
    e: 'Знак 3.2 «Движение запрещено» запрещает движение всех транспортных средств.',
    img: ['3.2', '3.1', '3.3', '3.27'],
  },
  {
    q: 'Кто имеет преимущество на перекрёстке равнозначных дорог?',
    a: ['Помеха справа', 'Тот, кто быстрее', 'Тот, кто слева', 'Тот, кто прямо'],
    c: 0,
    e: 'На равнозначных дорогах действует правило «помеха справа».',
  },
  {
    q: 'С какой максимальной скоростью можно двигаться в городе?',
    a: ['60 км/ч', '50 км/ч', '80 км/ч', '40 км/ч'],
    c: 0,
    e: 'В населённых пунктах максимальная скорость — 60 км/ч.',
  },
  {
    q: 'Когда нужно включать указатель поворота?',
    a: ['Заранее, до начала манёвра', 'В момент поворота', 'После поворота', 'Не обязательно'],
    c: 0,
    e: 'Указатель поворота включается заранее, до начала выполнения манёвра.',
  },
  {
    q: 'Разрешён ли обгон справа?',
    a: ['Запрещён', 'Разрешён всегда', 'Разрешён на трассе', 'Разрешён днём'],
    c: 0,
    e: 'Обгон справа запрещён правилами дорожного движения.',
  },
  {
    q: 'Что означает жёлтый мигающий сигнал светофора?',
    a: ['Незапрещённый сигнал', 'Стоп', 'Приготовиться', 'Движение запрещено'],
    c: 0,
    e: 'Жёлтый мигающий сигнал разрешает движение и информирует о нерегулируемом перекрёстке.',
  },
  {
    q: 'Можно ли парковаться на пешеходном переходе?',
    a: ['Нет, запрещено', 'Да, если быстро', 'Да, ночью', 'Да, если нет пешеходов'],
    c: 0,
    e: 'Остановка и стоянка на пешеходном переходе запрещена.',
  },
  {
    q: 'С какой максимальной скоростью разрешено движение в жилой зоне?',
    a: ['20 км/ч', '30 км/ч', '40 км/ч', '60 км/ч'],
    c: 0,
    e: 'В жилых зонах и на дворовых территориях скорость — не более 20 км/ч.',
  },
  {
    q: 'Кто обязан быть пристёгнут ремнём безопасности?',
    a: ['Водитель и все пассажиры', 'Только водитель', 'Только передние пассажиры', 'Это лишь рекомендация'],
    c: 0,
    e: 'Водитель и пассажиры обязаны быть пристёгнуты, если транспортное средство оборудовано ремнями.',
  },
  {
    q: 'Что должен включать водитель днём для обозначения транспортного средства?',
    a: ['Ближний свет фар или ДХО', 'Дальний свет фар', 'Противотуманные фары', 'Ничего не нужно'],
    c: 0,
    e: 'В светлое время суток — ближний свет фар или дневные ходовые огни.',
  },
  {
    q: 'Разрешён ли разворот на пешеходном переходе?',
    a: ['Запрещён', 'Разрешён', 'Разрешён ночью', 'Разрешён вне населённого пункта'],
    c: 0,
    e: 'Разворот запрещён на пешеходных переходах, в тоннелях, на мостах, путепроводах и под ними.',
  },
  {
    q: 'Что означает красный сигнал светофора?',
    a: ['Движение запрещено', 'Движение разрешено', 'Можно ехать с осторожностью', 'Приготовиться к движению'],
    c: 0,
    e: 'Красный сигнал, в том числе мигающий, запрещает движение.',
  },
  {
    q: 'Кому обязан уступить водитель при выезде с прилегающей территории?',
    a: ['Всем участникам движения', 'Только пешеходам', 'Только автомобилям справа', 'Никому не обязан'],
    c: 0,
    e: 'При выезде с прилегающей территории водитель должен уступить дорогу всем участникам движения.',
  },
  {
    q: 'Разрешена ли буксировка на гибкой сцепке в гололедицу?',
    a: ['Нет, запрещена', 'Да, разрешена', 'Да, если ехать медленно', 'Да, только в светлое время'],
    c: 0,
    e: 'Буксировка на гибкой сцепке при гололедице запрещена.',
  },
];

function buildQuestions(stageId: number): QuizQuestion[] {
  return QUESTION_TEMPLATES.map((t, idx) => ({
    id: `${stageId}-q${idx + 1}`,
    question: t.q,
    answers: [...t.a],
    correctAnswer: t.c,
    explanation: t.e,
    answerImages: t.img?.map((n) => (n ? SIGN_BY_NUMBER.get(n)?.src : undefined)),
  }));
}

// ——— Вопросы по дорожным знакам ———
// Этап -> ключ категории знаков (1..8)
const SIGN_STAGE_MAP: Record<number, string> = {
  21: '1', // предупреждающие
  22: '2', // приоритета
  23: '3', // запрещающие
  24: '4', // предписывающие
  25: '5', // особых предписаний
  26: '7', // сервис
  27: '6', // информационные
  40: '8', // таблички (итоговое повторение)
};

// Названия, обрезанные в именах файлов — восстанавливаем полные
const SIGN_NAME_FIXES: Record<string, string> = {
  'Вид транспортного': 'Вид транспортного средства',
  'Кроме вида транспортных средства': 'Кроме вида транспортного средства',
  'Способ постановки транспортного средства на': 'Способ постановки транспортного средства на стоянку',
};

function signName(s: SignItem): string {
  return SIGN_NAME_FIXES[s.name] ?? s.name;
}

// Сравнение номеров знаков вида "1.1", "8.4.10"
function compareSignNumbers(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x - y;
  }
  return 0;
}

// Равномерно распределяет count индексов по массиву длины n
function spreadIndexes(n: number, count: number, offsetRatio: number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    let idx = Math.min(n - 1, Math.round(((i + offsetRatio) * (n - 1)) / count));
    while (used.has(idx) && used.size < n) idx = (idx + 1) % n;
    used.add(idx);
    out.push(idx);
  }
  return out;
}

// Собирает 3 дистрактора, отличных от правильного значения (возвращает сами знаки, чтобы взять и текст, и картинку)
function pickDistractors(pool: SignItem[], fromIdx: number, get: (s: SignItem) => string, correct: string): SignItem[] {
  const res: SignItem[] = [];
  const seen = new Set<string>([correct]);
  const n = pool.length;
  for (let step = 1; step < n && res.length < 3; step++) {
    const cand = pool[(fromIdx + step) % n];
    const v = get(cand);
    if (!seen.has(v)) {
      seen.add(v);
      res.push(cand);
    }
  }
  return res;
}

function buildSignQuestions(stageId: number, categoryKey: string): QuizQuestion[] {
  const pool = SIGNS.filter((s) => s.categoryKey === categoryKey)
    .sort((a, b) => compareSignNumbers(a.number, b.number));
  if (pool.length === 0) return buildQuestions(stageId);

  const categoryLower =
    pool[0].category.charAt(0).toLowerCase() + pool[0].category.slice(1);
  const out: QuizQuestion[] = [];
  let n = 0;

  // Тип 1: «Что означает этот знак?» — знак в вопросе + у каждого варианта
  for (const idx of spreadIndexes(pool.length, 8, 0)) {
    const s = pool[idx];
    const name = signName(s);
    const distractors = pickDistractors(pool, idx, signName, name);
    out.push({
      id: `${stageId}-s${++n}`,
      question: 'Что означает этот знак?',
      answers: [name, ...distractors.map(signName)],
      correctAnswer: 0,
      explanation: `Знак ${s.number} «${name}» — ${categoryLower}.`,
      image: s.src,
      answerImages: [s.src, ...distractors.map((d) => d.src)],
    });
  }

  // Тип 2: «Какой знак обозначает …?» — у каждого варианта свой знак
  for (const idx of spreadIndexes(pool.length, 7, 0.5)) {
    const s = pool[idx];
    const name = signName(s);
    const distractors = pickDistractors(pool, idx, signName, name);
    out.push({
      id: `${stageId}-s${++n}`,
      question: `Какой знак обозначает «${name}»?`,
      answers: [name, ...distractors.map(signName)],
      correctAnswer: 0,
      explanation: `«${name}» обозначается знаком ${s.number}.`,
      answerImages: [s.src, ...distractors.map((d) => d.src)],
    });
  }

  return out;
}

export const STAGES: Stage[] = STAGE_TITLES.map((info, idx) => {
  const id = idx + 1;
  const signCategory = SIGN_STAGE_MAP[id];
  return {
    id,
    title: info.title,
    description: info.description,
    videos: buildVideos(id),
    questions: signCategory ? buildSignQuestions(id, signCategory) : buildQuestions(id),
  };
});

export const TOTAL_STAGES = STAGES.length; // 40
export const TOTAL_VIDEOS = STAGES.reduce((sum, s) => sum + s.videos.length, 0); // 800
export const TOTAL_QUESTIONS = STAGES.reduce((sum, s) => sum + s.questions.length, 0);
export { PASSING_SCORE };

export const getStage = (id: number): Stage | undefined => STAGES.find((s) => s.id === id);
