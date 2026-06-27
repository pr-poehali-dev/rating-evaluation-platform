import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ManagePanel from './ManagePanel';
import { Contest, Tab } from './types';

export default function SetupTab({
  contest,
  setTab,
  updateTitle,
  updateDate,
  addParticipant,
  removeParticipant,
  renameParticipant,
  setParticipantPhoto,
  addCriterion,
  removeCriterion,
  renameCriterion,
}: {
  contest: Contest;
  setTab: (tab: Tab) => void;
  updateTitle: (title: string) => void;
  updateDate: (date: string) => void;
  addParticipant: () => void;
  removeParticipant: (id: string) => void;
  renameParticipant: (id: string, name: string) => void;
  setParticipantPhoto: (id: string, photo: string | undefined) => void;
  addCriterion: () => void;
  removeCriterion: (id: string) => void;
  renameCriterion: (id: string, name: string) => void;
}) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm text-accent font-medium mb-1">Настройка</p>
          <h1 className="font-display text-4xl">Конкурс</h1>
        </div>
        <Button onClick={() => setTab('judge')} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Icon name="Play" size={16} /> Начать оценивание
        </Button>
      </div>

      <div className="rounded-2xl border border-border p-6 mb-8">
        <h3 className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">
          <Icon name="Info" size={15} /> Основное
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Название конкурса</label>
            <Input
              value={contest.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="bg-background"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Дата</label>
            <Input
              value={contest.date}
              onChange={(e) => updateDate(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <ManagePanel
          title="Участники"
          icon="Users"
          items={contest.participants}
          onRename={renameParticipant}
          onRemove={removeParticipant}
          onAdd={addParticipant}
          addLabel="Добавить участника"
          onPhoto={setParticipantPhoto}
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
  );
}
