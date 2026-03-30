import type { Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import MessageCard from "@/components/MessageCard";

interface Props {
  messages: Message[];
  onDelete: (id: string) => void;
  onCompose: () => void;
}

function groupByTime(messages: Message[]) {
  const now = Date.now();
  const today: Message[] = [];
  const week: Message[] = [];
  const later: Message[] = [];

  messages.forEach((m) => {
    if (!m.scheduledFor) return;
    const diff = m.scheduledFor.getTime() - now;
    const days = diff / 86400000;
    if (days <= 1) today.push(m);
    else if (days <= 7) week.push(m);
    else later.push(m);
  });

  return { today, week, later };
}

export default function ScheduledScreen({ messages, onDelete, onCompose }: Props) {
  const { today, week, later } = groupByTime(messages);

  const Section = ({ title, items, icon }: { title: string; items: Message[]; icon: string }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name={icon as "Clock"} size={14} className="text-muted-foreground/60" />
          <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">{title}</span>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-muted-foreground/40">{items.length}</span>
        </div>
        <div className="space-y-3">
          {items.map((msg, i) => (
            <div key={msg.id} className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}>
              <MessageCard msg={msg} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/20 flex items-center justify-center">
            <Icon name="Clock" size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Отложенные</h1>
            <p className="text-muted-foreground/60 text-xs">{messages.length} сообщений запланировано</p>
          </div>
        </div>

        {/* Timeline visual */}
        {messages.length > 0 && (
          <div className="mt-4 glass-card rounded-2xl p-4 flex items-center justify-between">
            {[
              { label: "Сегодня", count: today.length, color: "text-red-400" },
              { label: "На неделе", count: week.length, color: "text-orange-400" },
              { label: "Позже", count: later.length, color: "text-violet-400" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className={`text-2xl font-black ${item.color}`}>{item.count}</span>
                <span className="text-xs text-muted-foreground/50 mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-5xl mb-4 animate-float">⏳</div>
            <p className="text-muted-foreground/60 text-sm text-center">
              Нет отложенных сообщений.<br />Создай напоминание!
            </p>
          </div>
        ) : (
          <>
            <Section title="Скоро" items={today} icon="AlertCircle" />
            <Section title="На этой неделе" items={week} icon="Calendar" />
            <Section title="Позже" items={later} icon="Archive" />
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onCompose}
        className="absolute bottom-24 right-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-10"
        style={{ boxShadow: "0 0 20px rgba(249,115,22,0.4)" }}
      >
        <Icon name="Plus" size={24} className="text-white" />
      </button>
    </div>
  );
}
