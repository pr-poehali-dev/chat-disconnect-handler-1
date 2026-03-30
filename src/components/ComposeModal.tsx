import { useState } from "react";
import type { Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  onClose: () => void;
  onSend: (msg: Omit<Message, "id" | "createdAt">) => void;
}

const MOODS: { value: Message["mood"]; emoji: string; label: string }[] = [
  { value: "neutral", emoji: "📝", label: "Заметка" },
  { value: "idea", emoji: "💡", label: "Идея" },
  { value: "urgent", emoji: "🔥", label: "Важно" },
  { value: "happy", emoji: "✨", label: "Позитив" },
];

export default function ComposeModal({ onClose, onSend }: Props) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Message["mood"]>("neutral");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);

  const addTag = () => {
    const t = tag.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTag("");
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend({
      text: text.trim(),
      mood,
      tags: tags.length > 0 ? tags : undefined,
      scheduledFor: isScheduled && scheduleDate ? new Date(scheduleDate) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-[430px] mx-auto glass-card rounded-t-3xl border-t border-white/10 p-5 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ backdropFilter: "blur(40px)", background: "rgba(15,12,25,0.95)" }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        {/* Mood */}
        <div className="flex gap-2 mb-4">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                mood === m.value
                  ? "gradient-btn text-white neon-glow scale-[1.02]"
                  : "glass-card text-muted-foreground"
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className="text-[10px]">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Text */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Что хочешь запомнить?.."
          rows={4}
          autoFocus
          className="w-full glass-card rounded-2xl px-4 py-3 text-sm outline-none resize-none text-foreground placeholder:text-muted-foreground/40 mb-3 border border-transparent focus:border-violet-500/30 transition-colors"
        />

        {/* Tags */}
        <div className="flex gap-2 items-center mb-3">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="#тег"
            className="flex-1 glass-card rounded-xl px-3 py-2 text-xs outline-none text-foreground placeholder:text-muted-foreground/40 border border-transparent focus:border-violet-500/20 transition-colors"
          />
          <button
            onClick={addTag}
            className="px-3 py-2 rounded-xl glass-card text-xs text-muted-foreground active:scale-95 transition-transform"
          >
            + Добавить
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((t) => (
              <span
                key={t}
                onClick={() => setTags(tags.filter((x) => x !== t))}
                className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold cursor-pointer"
              >
                #{t} ×
              </span>
            ))}
          </div>
        )}

        {/* Schedule toggle */}
        <button
          onClick={() => setIsScheduled(!isScheduled)}
          className={`flex items-center gap-2 text-xs font-semibold mb-3 transition-colors ${isScheduled ? "text-orange-400" : "text-muted-foreground/50"}`}
        >
          <Icon name="Clock" size={14} />
          {isScheduled ? "Отложить до" : "Отложить на потом"}
        </button>

        {isScheduled && (
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full glass-card rounded-xl px-3 py-2.5 text-xs outline-none mb-3 text-foreground border border-orange-500/20 transition-colors"
          />
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl glass-card text-sm font-semibold text-muted-foreground active:scale-95 transition-transform"
          >
            Отмена
          </button>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex-2 flex-[2] py-3 rounded-2xl gradient-btn text-white text-sm font-semibold neon-glow active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isScheduled ? "⏰ Отложить" : "✓ Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
