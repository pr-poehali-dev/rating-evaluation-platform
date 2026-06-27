import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ManagePanel({
  title,
  icon,
  items,
  onRename,
  onRemove,
  onAdd,
  addLabel,
  onPhoto,
}: {
  title: string;
  icon: string;
  items: { id: string; name: string; photo?: string }[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
  onPhoto?: (id: string, photo: string | undefined) => void;
}) {
  return (
    <div className="rounded-2xl border border-border p-6">
      <h3 className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">
        <Icon name={icon} size={15} /> {title}
      </h3>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            {onPhoto && (
              <label className="shrink-0 w-10 h-10 rounded-lg overflow-hidden cursor-pointer border border-border hover:border-accent/50 transition-colors flex items-center justify-center bg-secondary relative">
                {it.photo
                  ? <img src={it.photo} alt="" className="w-full h-full object-cover" />
                  : <Icon name="ImagePlus" size={16} className="text-muted-foreground" />}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => onPhoto(it.id, reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}
            <Input
              value={it.name}
              onChange={(e) => onRename(it.id, e.target.value)}
              className="h-10 bg-background"
            />
            {onPhoto && it.photo && (
              <button
                onClick={() => onPhoto(it.id, undefined)}
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Удалить фото"
              >
                <Icon name="ImageOff" size={16} />
              </button>
            )}
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
