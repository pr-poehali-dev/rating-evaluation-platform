import { useState, useMemo, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Criterion = { id: string; name: string };
type Scores = Record<string, Record<string, number>>;
type Participant = { id: string; name: string };
type Contest = {
  id: string;
  title: string;
  date: string;
  participants: Participant[];
  criteria: Criterion[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

const initialContests: Contest[] = [
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

type Tab = 'home' | 'judge' | 'results';

const STORAGE_KEY = 'contest-judge-v1';

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function Index() {
  const [contests, setContests] = useState<Contest[]>(() => load('contests', initialContests));
  const [activeId, setActiveId] = useState<string>(() => load('activeId', initialContests[0].id));
  const [tab, setTab] = useState<Tab>('home');
  const [scores, setScores] = useState<Scores>(() => load('scores', {}));
  const [judgeParticipant, setJudgeParticipant] = useState<string>(() => load('judgeParticipant', 'p1'));

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}:contests`, JSON.stringify(contests));
  }, [contests]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}:scores`, JSON.stringify(scores));
  }, [scores]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}:activeId`, JSON.stringify(activeId));
  }, [activeId]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}:judgeParticipant`, JSON.stringify(judgeParticipant));
  }, [judgeParticipant]);

  const contest = contests.find((c) => c.id === activeId)!;

  const setScore = (pid: string, kid: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [pid]: { ...prev[pid], [kid]: value },
    }));
  };

  const avgFor = (pid: string) => {
    const vals = contest.criteria.map((k) => scores[pid]?.[k.id] ?? 0);
    const filled = vals.filter((v) => v > 0);
    if (!filled.length) return 0;
    return filled.reduce((a, b) => a + b, 0) / contest.criteria.length;
  };

  const ranking = useMemo(
    () =>
      [...contest.participants]
        .map((p) => ({ ...p, avg: avgFor(p.id) }))
        .sort((a, b) => b.avg - a.avg),
    [contest, scores]
  );

  const updateContest = (patch: Partial<Contest>) =>
    setContests((cs) => cs.map((c) => (c.id === activeId ? { ...c, ...patch } : c)));

  const addParticipant = () =>
    updateContest({
      participants: [...contest.participants, { id: uid(), name: 'Новый участник' }],
    });
  const removeParticipant = (id: string) =>
    updateContest({ participants: contest.participants.filter((p) => p.id !== id) });
  const renameParticipant = (id: string, name: string) =>
    updateContest({
      participants: contest.participants.map((p) => (p.id === id ? { ...p, name } : p)),
    });

  const addCriterion = () =>
    updateContest({ criteria: [...contest.criteria, { id: uid(), name: 'Новый критерий' }] });
  const removeCriterion = (id: string) =>
    updateContest({ criteria: contest.criteria.filter((k) => k.id !== id) });
  const renameCriterion = (id: string, name: string) =>
    updateContest({
      criteria: contest.criteria.map((k) => (k.id === id ? { ...k, name } : k)),
    });

  const exportCSV = () => {
    const header = ['Место', 'Участник', ...contest.criteria.map((k) => k.name), 'Средний балл'];
    const rows = ranking.map((p, i) => [
      i + 1,
      p.name,
      ...contest.criteria.map((k) => scores[p.id]?.[k.id] ?? 0),
      p.avg.toFixed(2),
    ]);
    const csv = [header, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contest.title} — результаты.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPrint = () => {
    const header = ['Место', 'Участник', ...contest.criteria.map((k) => k.name), 'Средний балл'];
    const rows = ranking.map((p, i) => [
      `${i + 1}`,
      p.name,
      ...contest.criteria.map((k) => String(scores[p.id]?.[k.id] ?? 0)),
      p.avg.toFixed(2),
    ]);
    const thStyle = 'padding:8px 14px;text-align:left;border-bottom:2px solid #c9b99a;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#7c6f5e;';
    const tdStyle = 'padding:10px 14px;border-bottom:1px solid #ede8e0;font-size:15px;';
    const tdNumStyle = tdStyle + 'text-align:center;';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${contest.title} — результаты</title>
    <style>body{font-family:'Golos Text',system-ui,sans-serif;padding:40px;color:#1e1914;background:#fff;}
    h1{font-family:Georgia,serif;font-size:32px;margin:0 0 6px;}p{color:#7c6f5e;margin:0 0 28px;}
    table{width:100%;border-collapse:collapse;}tr:first-child td{font-weight:600;color:#bf6840;}
    @media print{button{display:none}}</style></head><body>
    <h1>${contest.title}</h1><p>${contest.date}</p>
    <table><thead><tr>${header.map((h) => `<th style="${thStyle}">${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, ci) => `<td style="${ci === 0 || ci >= 2 ? tdNumStyle : tdStyle}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <script>window.onload=()=>window.print();</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const addContest = () => {
    const nc: Contest = {
      id: uid(),
      title: 'Новый конкурс',
      date: 'без даты',
      criteria: [
        { id: uid(), name: 'Критерий 1' },
        { id: uid(), name: 'Критерий 2' },
        { id: uid(), name: 'Критерий 3' },
        { id: uid(), name: 'Критерий 4' },
        { id: uid(), name: 'Критерий 5' },
      ],
      participants: [],
    };
    setContests((cs) => [...cs, nc]);
    setActiveId(nc.id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => setTab('home')} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Icon name="Award" size={18} className="text-accent-foreground" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Оценка</span>
          </button>
          <nav className="flex items-center gap-1">
            {([
              ['home', 'Конкурсы'],
              ['judge', 'Оценивание'],
              ['results', 'Результаты'],
            ] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {tab === 'home' && (
          <div className="animate-fade-up">
            <div className="mb-10">
              <p className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-3">
                Судейская панель
              </p>
              <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4">
                Оценивайте чисто
                <br />
                и без суеты.
              </h1>
              <p className="text-muted-foreground text-lg max-w-md">
                Пять критериев, десятибалльная шкала, автоматический средний балл.
              </p>
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Ваши конкурсы
              </h2>
              <Button onClick={addContest} variant="ghost" className="gap-2 text-accent hover:text-accent">
                <Icon name="Plus" size={16} /> Новый конкурс
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {contests.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    setJudgeParticipant(c.participants[0]?.id ?? '');
                    setTab('judge');
                  }}
                  className="group text-left p-6 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-2xl mb-1">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.date}</p>
                    </div>
                    <Icon
                      name="ArrowUpRight"
                      size={20}
                      className="text-muted-foreground group-hover:text-accent transition-colors"
                    />
                  </div>
                  <div className="flex gap-5 mt-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Icon name="Users" size={15} /> {c.participants.length} участников
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="ListChecks" size={15} /> {c.criteria.length} критериев
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'judge' && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="text-sm text-accent font-medium mb-1">{contest.title}</p>
                <h1 className="font-display text-4xl">Оценивание участника</h1>
              </div>
              <Button onClick={() => setTab('results')} variant="outline" className="gap-2">
                <Icon name="Trophy" size={16} /> К результатам
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap mb-8">
              {contest.participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setJudgeParticipant(p.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    judgeParticipant === p.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              {!contest.participants.length && (
                <p className="text-muted-foreground text-sm">Добавьте участников в разделе «Управление» ниже.</p>
              )}
            </div>

            {judgeParticipant && contest.participants.some((p) => p.id === judgeParticipant) && (
              <div className="rounded-2xl bg-card border border-border p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-3xl">
                    {contest.participants.find((p) => p.id === judgeParticipant)?.name}
                  </h2>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Средний балл</p>
                    <p className="font-display text-4xl text-accent">
                      {avgFor(judgeParticipant).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-7">
                  {contest.criteria.map((k) => {
                    const val = scores[judgeParticipant]?.[k.id] ?? 0;
                    return (
                      <div key={k.id}>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="font-medium">{k.name}</span>
                          <span className="text-sm tabular-nums text-muted-foreground">{val}/10</span>
                        </div>
                        <div className="flex gap-1.5">
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                            <button
                              key={n}
                              onClick={() => setScore(judgeParticipant, k.id, n)}
                              className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                                n <= val
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-secondary text-muted-foreground hover:bg-accent/10'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <ManagePanel
                title="Участники"
                icon="Users"
                items={contest.participants}
                onRename={renameParticipant}
                onRemove={removeParticipant}
                onAdd={addParticipant}
                addLabel="Добавить участника"
              />
              <ManagePanel
                title="Критерии"
                icon="ListChecks"
                items={contest.criteria}
                onRename={renameCriterion}
                onRemove={removeCriterion}
                onAdd={addCriterion}
                addLabel="Добавить критерий"
              />
            </div>
          </div>
        )}

        {tab === 'results' && (
          <div className="animate-fade-up">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-sm text-accent font-medium mb-1">{contest.title}</p>
                <h1 className="font-display text-4xl">Итоговый рейтинг</h1>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportCSV} variant="outline" className="gap-2">
                  <Icon name="Download" size={16} /> Скачать CSV
                </Button>
                <Button onClick={exportPrint} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Icon name="Printer" size={16} /> Распечатать
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {ranking.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-5 p-5 rounded-2xl border transition-all ${
                    i === 0 ? 'bg-accent/5 border-accent/30' : 'bg-card border-border'
                  }`}
                >
                  <span
                    className={`font-display text-3xl w-10 text-center ${
                      i === 0 ? 'text-accent' : 'text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{p.name}</p>
                    <div className="h-1.5 mt-2 rounded-full bg-secondary overflow-hidden max-w-xs">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${(p.avg / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-display text-3xl tabular-nums">{p.avg.toFixed(2)}</span>
                </div>
              ))}
              {!ranking.length && (
                <p className="text-muted-foreground">Пока нет участников для рейтинга.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ManagePanel({
  title,
  icon,
  items,
  onRename,
  onRemove,
  onAdd,
  addLabel,
}: {
  title: string;
  icon: string;
  items: { id: string; name: string }[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-6">
      <h3 className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">
        <Icon name={icon} size={15} /> {title}
      </h3>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <Input
              value={it.name}
              onChange={(e) => onRename(it.id, e.target.value)}
              className="h-10 bg-background"
            />
            <button
              onClick={() => onRemove(it.id)}
              className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Icon name="Trash2" size={16} />
            </button>
          </div>
        ))}
      </div>
      <Button onClick={onAdd} variant="ghost" className="w-full mt-3 gap-2 text-accent hover:text-accent">
        <Icon name="Plus" size={16} /> {addLabel}
      </Button>
    </div>
  );
}