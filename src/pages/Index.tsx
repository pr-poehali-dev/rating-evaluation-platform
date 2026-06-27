import { useState, useMemo, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Contest, Scores, Tab, uid, load, initialContests, STORAGE_KEY } from './contest/types';
import HomeTab from './contest/HomeTab';
import SetupTab from './contest/SetupTab';
import JudgeTab from './contest/JudgeTab';
import ResultsTab from './contest/ResultsTab';

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

  const contest = contests.find((c) => c.id === activeId) ?? contests[0];

  const setScore = (pid: string, kid: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [pid]: { ...prev[pid], [kid]: value },
    }));
  };

  const avgFor = (pid: string) => {
    if (!contest) return 0;
    const vals = contest.criteria.map((k) => scores[pid]?.[k.id] ?? 0);
    const filled = vals.filter((v) => v > 0);
    if (!filled.length) return 0;
    return filled.reduce((a, b) => a + b, 0) / contest.criteria.length;
  };

  const ranking = useMemo(
    () =>
      contest
        ? [...contest.participants]
            .map((p) => ({ ...p, avg: avgFor(p.id) }))
            .sort((a, b) => b.avg - a.avg)
        : [],
    [contest, scores]
  );

  const updateContest = (patch: Partial<Contest>) =>
    setContests((cs) => cs.map((c) => (c.id === activeId ? { ...c, ...patch } : c)));

  const updateTitle = (title: string) => updateContest({ title });
  const updateDate = (date: string) => updateContest({ date });

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
  const setParticipantPhoto = (id: string, photo: string | undefined) =>
    updateContest({
      participants: contest.participants.map((p) => (p.id === id ? { ...p, photo } : p)),
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
    setTab('setup');
  };

  if (!contest) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Нет конкурсов</p>
        <Button onClick={addContest} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Icon name="Plus" size={16} /> Создать конкурс
        </Button>
      </div>
    );
  }

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
              ['setup', 'Настройка'],
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
          <HomeTab
            contests={contests}
            setActiveId={setActiveId}
            setContests={setContests}
            setJudgeParticipant={setJudgeParticipant}
            setTab={setTab}
            addContest={addContest}
          />
        )}

        {tab === 'setup' && (
          <SetupTab
            contest={contest}
            setTab={setTab}
            updateTitle={updateTitle}
            updateDate={updateDate}
            addParticipant={addParticipant}
            removeParticipant={removeParticipant}
            renameParticipant={renameParticipant}
            setParticipantPhoto={setParticipantPhoto}
            addCriterion={addCriterion}
            removeCriterion={removeCriterion}
            renameCriterion={renameCriterion}
          />
        )}

        {tab === 'judge' && (
          <JudgeTab
            contest={contest}
            scores={scores}
            judgeParticipant={judgeParticipant}
            setJudgeParticipant={setJudgeParticipant}
            setTab={setTab}
            setScore={setScore}
            avgFor={avgFor}
          />
        )}

        {tab === 'results' && (
          <ResultsTab
            contest={contest}
            scores={scores}
            ranking={ranking}
          />
        )}
      </main>
    </div>
  );
}
