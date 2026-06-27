export type Criterion = { id: string; name: string };
export type Scores = Record<string, Record<string, number>>;
export type Participant = { id: string; name: string; photo?: string };
export type Contest = {
  id: string;
  title: string;
  date: string;
  participants: Participant[];
  criteria: Criterion[];
};

export type Tab = 'home' | 'judge' | 'results';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const STORAGE_KEY = 'contest-judge-v1';

export const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const initialContests: Contest[] = [
  {
    id: 'c1',
    title: 'Конкурс молодых вокалистов',
    date: '14 июня 2026',
    criteria: [
      { id: 'k1', name: 'Техника' },
      { id: 'k2', name: 'Артистизм' },
      { id: 'k3', name: 'Чистота интонации' },
      { id: 'k4', name: 'Сценический образ' },
      { id: 'k5', name: 'Сложность программы' },
    ],
    participants: [
      { id: 'p1', name: 'Анна Светлова' },
      { id: 'p2', name: 'Дмитрий Орлов' },
      { id: 'p3', name: 'Мария Зайцева' },
    ],
  },
];
