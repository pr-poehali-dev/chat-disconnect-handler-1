import type { Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  messages: Message[];
  scheduled: Message[];
}

export default function ProfileScreen({ messages, scheduled }: Props) {
  const total = messages.length + scheduled.length;
  const moods = messages.reduce((acc, m) => {
    const key = m.mood || "neutral";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMood = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];

  const MOOD_LABELS: Record<string, string> = {
    urgent: "🔥 Важные",
    idea: "💡 Идеи",
    happy: "✨ Позитив",
    neutral: "📝 Заметки",
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const count = messages.filter((m) => {
      const md = new Date(m.createdAt);
      return md.toDateString() === d.toDateString();
    }).length;
    return { day: d.toLocaleDateString("ru", { weekday: "short" }), count };
  });

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-y-auto">
      <div className="px-5 pt-14 pb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative animate-fade-in">
            <div className="w-24 h-24 rounded-3xl gradient-btn flex items-center justify-center neon-glow mb-4">
              <span className="text-4xl font-black text-white">А</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-green-400 flex items-center justify-center border-2 border-background">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black mt-2">Алексей</h2>
          <p className="text-muted-foreground/60 text-sm">alexey@example.com</p>
          <p className="text-xs text-violet-400 font-semibold mt-1">В Эхо с марта 2026</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in stagger-1">
          {[
            { label: "Заметок", value: messages.length, icon: "MessageSquare", color: "text-violet-400" },
            { label: "Отложено", value: scheduled.length, icon: "Clock", color: "text-orange-400" },
            { label: "Всего", value: total, icon: "Archive", color: "text-pink-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
              <Icon name={s.icon as "Clock"} size={18} className={`${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs text-muted-foreground/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Activity chart */}
        <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in stagger-2">
          <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-4">
            Активность за неделю
          </p>
          <div className="flex items-end justify-between gap-1 h-16">
            {days.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full rounded-t-lg gradient-btn opacity-80 transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "8px" : "3px" }}
                />
                <span className="text-[9px] text-muted-foreground/40">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top mood */}
        {topMood && (
          <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in stagger-3">
            <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
              Преобладающий тип
            </p>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{topMood[0] === "urgent" ? "🔥" : topMood[0] === "idea" ? "💡" : topMood[0] === "happy" ? "✨" : "📝"}</div>
              <div>
                <p className="font-bold">{MOOD_LABELS[topMood[0]]}</p>
                <p className="text-muted-foreground/50 text-xs">{topMood[1]} записей из {messages.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 animate-fade-in stagger-4">
          {[
            { icon: "Download", label: "Экспорт заметок", color: "text-violet-400" },
            { icon: "Share2", label: "Поделиться профилем", color: "text-pink-400" },
            { icon: "LogOut", label: "Выйти", color: "text-red-400" },
          ].map((a) => (
            <button
              key={a.label}
              className="w-full glass-card flex items-center justify-between px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <Icon name={a.icon as "Download"} size={18} className={a.color} />
                <span className="text-sm font-medium">{a.label}</span>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground/30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
