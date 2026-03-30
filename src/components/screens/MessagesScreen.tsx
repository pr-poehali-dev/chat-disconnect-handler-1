import { useState } from "react";
import type { Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import MessageCard from "@/components/MessageCard";

interface Props {
  messages: Message[];
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onCompose: () => void;
}

const MOOD_FILTER = [
  { value: "all", label: "Все" },
  { value: "urgent", label: "🔥 Важное" },
  { value: "idea", label: "💡 Идеи" },
  { value: "happy", label: "✨ Радость" },
  { value: "neutral", label: "📝 Заметки" },
];

export default function MessagesScreen({ messages, onDelete, onPin, onCompose }: Props) {
  const [filter, setFilter] = useState("all");

  const pinned = messages.filter((m) => m.isPinned);
  const others = messages.filter((m) => !m.isPinned);

  const filtered = (list: Message[]) =>
    filter === "all" ? list : list.filter((m) => m.mood === filter);

  const filteredPinned = filtered(pinned);
  const filteredOthers = filtered(others);
  const total = filteredPinned.length + filteredOthers.length;

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black">Мои заметки</h1>
            <p className="text-muted-foreground/60 text-xs mt-0.5">{total} записей</p>
          </div>
          <div className="w-10 h-10 rounded-2xl gradient-btn flex items-center justify-center neon-glow cursor-pointer">
            <span className="text-sm font-bold text-white">АИ</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {MOOD_FILTER.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f.value
                  ? "gradient-btn text-white neon-glow"
                  : "glass-card text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
        {filteredPinned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Pin" size={12} className="text-violet-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Закреплённые</span>
            </div>
            <div className="space-y-3">
              {filteredPinned.map((msg, i) => (
                <div key={msg.id} className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}>
                  <MessageCard msg={msg} onDelete={onDelete} onPin={onPin} />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredOthers.length > 0 && (
          <div className="space-y-3">
            {filteredOthers.map((msg, i) => (
              <div key={msg.id} className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}>
                <MessageCard msg={msg} onDelete={onDelete} onPin={onPin} />
              </div>
            ))}
          </div>
        )}

        {total === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-muted-foreground/60 text-sm text-center">
              Нет заметок в этой категории
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onCompose}
        className="absolute bottom-24 right-5 w-14 h-14 rounded-2xl gradient-btn flex items-center justify-center neon-glow shadow-2xl active:scale-90 transition-transform z-10"
      >
        <Icon name="Plus" size={24} className="text-white" />
      </button>
    </div>
  );
}
