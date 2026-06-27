import { useState } from 'react';
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
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const participants = contest.participants;
  const currentIndex = participants.findIndex((p) => p.id === judgeParticipant);
  const participant = participants[currentIndex] ?? participants[0];
  const isLast = currentIndex === participants.length - 1;

  const allScored = contest.criteria.every(
    (k) => (scores[participant?.id]?.[k.id] ?? 0) > 0
  );

  const handleConfirm = () => {
    if (!participant) return;
    setConfirmed((prev) => new Set(prev).add(participant.id));
    if (!isLast) {
      setJudgeParticipant(participants[currentIndex + 1].id);
    } else {
      setTab('results');
    }
  };

  if (!participants.length) {
    return (
      <div className="animate-fade-up flex flex-col items-center justify-center py-24 gap-4">
        <Icon name="Users" size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground">Нет участников.</p>
        <Button onClick={() => setTab('setup')} variant="outline" className="gap-2">
          <Icon name="Settings" size={16} /> Перейти в настройку
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm text-accent font-medium mb-1">{contest.title}</p>
          <h1 className="font-display text-4xl">Оценивание</h1>
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

      <div className="flex gap-1.5 mb-8">
        {participants.map((p, i) => (
          <div
            key={p.id}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              confirmed.has(p.id)
                ? 'bg-accent'
                : p.id === participant?.id
                ? 'bg-accent/40'
                : 'bg-secondary'
            }`}
            title={`${i + 1}. ${p.name}`}
          />
        ))}
      </div>

      {participant && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {participant.photo ? (
            <div className="w-full bg-secondary" style={{ maxHeight: '360px', overflow: 'hidden' }}>
              <img
                src={participant.photo}
                alt={participant.name}
                className="w-full object-cover object-top"
                style={{ maxHeight: '360px' }}
              />
            </div>
          ) : (
            <div className="w-full bg-secondary flex flex-col items-center justify-center gap-3 text-muted-foreground py-14">
              <Icon name="User" size={56} />
              <span className="text-sm">Фото не загружено</span>
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Участник {currentIndex + 1} из {participants.length}
                </p>
                <h2 className="font-display text-3xl">{participant.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Средний балл</p>
                <p className="font-display text-4xl text-accent">
                  {avgFor(participant.id).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-7">
              {contest.criteria.map((k) => {
                const val = scores[participant.id]?.[k.id] ?? 0;
                return (
                  <div key={k.id}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{k.name}</span>
                      <span className="font-display text-2xl text-accent tabular-nums w-10 text-right">
                        {val}
                      </span>
                    </div>
                    <div className="relative flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-3">0</span>
                      <div className="relative flex-1">
                        <input
                          type="range"
                          min={0}
                          max={10}
                          step={1}
                          value={val}
                          onChange={(e) => setScore(participant.id, k.id, Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${val * 10}%, var(--secondary) ${val * 10}%, var(--secondary) 100%)`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-3">10</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-between gap-4">
              {currentIndex > 0 ? (
                <button
                  onClick={() => setJudgeParticipant(participants[currentIndex - 1].id)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Icon name="ChevronLeft" size={16} />
                  {participants[currentIndex - 1].name}
                </button>
              ) : <span />}

              <Button
                onClick={handleConfirm}
                disabled={!allScored}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
              >
                <Icon name="Check" size={16} />
                {isLast ? 'Завершить и смотреть результаты' : 'Подтвердить и перейти к следующему'}
              </Button>
            </div>

            {!allScored && (
              <p className="text-xs text-muted-foreground mt-3 text-right">
                Установите баллы по всем критериям, чтобы продолжить
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
