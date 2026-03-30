import { useState } from "react";
import type { Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  msg: Message;
  onDelete: (id: string) => void;
  onPin?: (id: string) => void;
  showDate?: boolean;
}

const MOOD_CONFIG = {
  urgent: { emoji: "🔥", color: "from-red-500/20 to-orange-500/10", border: "border-red-500/20" },
  idea: { emoji: "💡", color: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/20" },
  happy: { emoji: "✨", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20" },
  neutral: { emoji: "📝", color: "from-white/5 to-transparent", border: "border-white/8" },
};

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  return `${days} дн назад`;
}

function formatScheduled(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 24) return `через ${hours} ч`;
  return `через ${days} дн`;
}

export default function MessageCard({ msg, onDelete, onPin, showDate }: Props) {
  const [swiped, setSwiped] = useState(false);
  const mood = MOOD_CONFIG[msg.mood || "neutral"];

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete bg */}
      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-end pr-5 rounded-2xl">
        <Icon name="Trash2" size={20} className="text-red-400" />
      </div>

      {/* Card */}
      <div
        className={`relative bg-gradient-to-br ${mood.color} border ${mood.border} rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] cursor-pointer`}
        style={{ transform: swiped ? "translateX(-80px)" : "translateX(0)" }}
        onClick={() => setSwiped(!swiped)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base leading-none">{mood.emoji}</span>
              {msg.isPinned && (
                <span className="text-violet-400">
                  <Icon name="Pin" size={11} />
                </span>
              )}
              {msg.scheduledFor && (
                <span className="text-xs text-orange-400 font-semibold flex items-center gap-1">
                  <Icon name="Clock" size={11} />
                  {formatScheduled(msg.scheduledFor)}
                </span>
              )}
              <span className="ml-auto text-xs text-muted-foreground/50">
                {showDate
                  ? msg.createdAt.toLocaleDateString("ru")
                  : timeAgo(msg.createdAt)}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3">{msg.text}</p>

            {msg.tags && msg.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {msg.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-muted-foreground/70">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {swiped && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
            {onPin && (
              <button
                onClick={(e) => { e.stopPropagation(); onPin(msg.id); setSwiped(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-500/20 text-violet-300 text-xs font-semibold active:scale-95 transition-transform"
              >
                <Icon name="Pin" size={14} />
                {msg.isPinned ? "Открепить" : "Закрепить"}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(msg.id); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold active:scale-95 transition-transform"
            >
              <Icon name="Trash2" size={14} />
              Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
