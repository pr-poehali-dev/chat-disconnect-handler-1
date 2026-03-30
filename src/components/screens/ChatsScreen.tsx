import type { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  chats: Chat[];
  onOpen: (id: string) => void;
  loading?: boolean;
}

function timeLabel(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "сейчас";
  if (mins < 60) return `${mins} мин`;
  if (hours < 24) return date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("ru", { day: "numeric", month: "short" });
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-orange-400 to-amber-500",
  "from-sky-500 to-blue-600",
  "from-green-500 to-teal-600",
];

export default function ChatsScreen({ chats, onOpen, loading }: Props) {
  const pinned = chats.filter((c) => c.isPinned);
  const others = chats.filter((c) => !c.isPinned);
  const sorted = [...pinned, ...others];
  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black">Сообщения</h1>
            {totalUnread > 0 && (
              <p className="text-xs text-violet-400 font-semibold mt-0.5">{totalUnread} непрочитанных</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 glass-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
              <Icon name="UserPlus" size={16} className="text-muted-foreground/60" />
            </button>
            <button className="w-9 h-9 glass-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
              <Icon name="MoreHorizontal" size={16} className="text-muted-foreground/60" />
            </button>
          </div>
        </div>

        {/* Online strip */}
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
          {chats
            .filter((c) => c.user.online)
            .map((c, i) => (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-base`}>
                    {c.user.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-background" />
                </div>
                <span className="text-[10px] text-muted-foreground/60 max-w-[48px] truncate">{c.user.name.split(" ")[0]}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground/50">Загружаем чаты...</p>
          </div>
        )}
        {!loading && chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-8 text-center">
            <div className="w-16 h-16 rounded-3xl gradient-btn flex items-center justify-center mb-2 opacity-60">
              <Icon name="MessageSquare" size={28} className="text-white" />
            </div>
            <p className="font-semibold text-foreground/70">Нет чатов</p>
            <p className="text-sm text-muted-foreground/50">Найди друга в поиске, чтобы начать переписку</p>
          </div>
        )}
        {pinned.length > 0 && (
          <div className="px-5 mb-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Pin" size={11} className="text-muted-foreground/40" />
              <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Закреплённые</span>
            </div>
          </div>
        )}

        {sorted.map((chat, i) => {
          const last = chat.messages[chat.messages.length - 1];
          const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <button
              key={chat.id}
              onClick={() => onOpen(chat.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 active:bg-white/4 transition-colors animate-fade-in stagger-${Math.min(i + 1, 5)}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {chat.user.avatar}
                </div>
                {chat.user.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-background" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-foreground truncate">{chat.user.name}</span>
                    {chat.isPinned && <Icon name="Pin" size={11} className="text-muted-foreground/40 shrink-0" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground/40 shrink-0 ml-2">{last ? timeLabel(last.time) : ""}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground/60 truncate flex-1 flex items-center gap-1">
                    {last?.fromMe && (
                      <span className="shrink-0">
                        {last.status === "read" ? (
                          <Icon name="CheckCheck" size={12} className="text-violet-400" />
                        ) : (
                          <Icon name="Check" size={12} className="text-muted-foreground/40" />
                        )}
                      </span>
                    )}
                    {last?.text ?? ""}
                  </p>
                  {chat.unread > 0 && (
                    <span className="ml-2 shrink-0 min-w-[20px] h-5 px-1.5 rounded-full gradient-btn text-white text-[10px] font-bold flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}