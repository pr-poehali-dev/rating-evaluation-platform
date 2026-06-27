import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Contest, Scores } from './types';

type RankedParticipant = { id: string; name: string; photo?: string; avg: number };

export default function ResultsTab({
  contest,
  scores,
  ranking,
}: {
  contest: Contest;
  scores: Scores;
  ranking: RankedParticipant[];
}) {
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

  return (
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
              className={`font-display text-3xl w-10 text-center shrink-0 ${
                i === 0 ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              {i + 1}
            </span>
            {p.photo
              ? <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
              : <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground shrink-0"><Icon name="User" size={18} /></div>
            }
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
  );
}
