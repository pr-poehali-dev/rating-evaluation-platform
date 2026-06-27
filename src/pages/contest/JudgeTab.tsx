import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Contest, Scores, Tab } from './types';

export default function JudgeTab({
  contest,
  scores,
  judgeParticipant,
  setJudgeParticipant,
  setTab,
  setScore,
  avgFor,
}: {
  contest: Contest;
  scores: Scores;
  judgeParticipant: string;
  setJudgeParticipant: (id: string) => void;
  setTab: (tab: Tab) => void;
  setScore: (pid: string, kid: string, value: number) => void;
  avgFor: (pid: string) => number;
}) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm text-accent font-medium mb-1">{contest.title}</p>
          <h1 className="font-display text-4xl">Оценивание участника</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTab('setup')} variant="outline" className="gap-2">
            <Icon name="Settings" size={16} /> Настройка
          </Button>
          <Button onClick={() => setTab('results')} variant="outline" className="gap-2">
            <Icon name="Trophy" size={16} /> К результатам
          </Button>
        </div>
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
          <p className="text-muted-foreground text-sm">
            Добавьте участников в{' '}
            <button className="underline text-accent" onClick={() => setTab('setup')}>Настройке конкурса</button>.
          </p>
        )}
      </div>

      {judgeParticipant && contest.participants.some((p) => p.id === judgeParticipant) && (
        <div className="rounded-2xl bg-card border border-border p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {(() => {
                const p = contest.participants.find((p) => p.id === judgeParticipant);
                return p?.photo ? (
                  <img src={p.photo} alt={p.name} className="w-14 h-14 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <Icon name="User" size={24} />
                  </div>
                );
              })()}
              <h2 className="font-display text-3xl">
                {contest.participants.find((p) => p.id === judgeParticipant)?.name}
              </h2>
            </div>
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
    </div>
  );
}
