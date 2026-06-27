import { useState, useMemo } from 'react';
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

export default function Index() {
  const [contests, setContests] = useState<Contest[]>(initialContests);
  const [activeId, setActiveId] = useState<string>(initialContests[0].id);
  const [tab, setTab] = useState<Tab>('home');
  const [scores, setScores] = useState<Scores>({});
  const [judgeParticipant, setJudgeParticipant] = useState<string>('p1');

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
            <p className="text-sm text-accent font-medium mb-1">{contest.title}</p>
            <h1 className="font-display text-4xl mb-8">Итоговый рейтинг</h1>
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
