import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Contest, Tab } from './types';

export default function HomeTab({
  contests,
  setActiveId,
  setContests,
  setJudgeParticipant,
  setTab,
  addContest,
}: {
  contests: Contest[];
  setActiveId: (id: string) => void;
  setContests: React.Dispatch<React.SetStateAction<Contest[]>>;
  setJudgeParticipant: (id: string) => void;
  setTab: (tab: Tab) => void;
  addContest: () => void;
}) {
  return (
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
          <div key={c.id} className="group relative text-left p-6 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all">
            <button
              onClick={() => {
                setActiveId(c.id);
                setJudgeParticipant(c.participants[0]?.id ?? '');
                setTab('judge');
              }}
              className="absolute inset-0 rounded-2xl"
              aria-label={`Открыть ${c.title}`}
            />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-2xl mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.date}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!confirm(`Удалить конкурс «${c.title}»?`)) return;
                  const rest = contests.filter((x) => x.id !== c.id);
                  setContests(rest);
                  if (rest.length) setActiveId(rest[0].id);
                }}
                className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Удалить конкурс"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
            <div className="flex gap-5 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Icon name="Users" size={15} /> {c.participants.length} участников
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="ListChecks" size={15} /> {c.criteria.length} критериев
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
