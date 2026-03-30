import { useState, useMemo } from "react";
import type { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  chats: Chat[];
  onOpen: (id: string) => void;
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-orange-400 to-amber-500",
  "from-sky-500 to-blue-600",
  "from-green-500 to-teal-600",
];

export default function SearchScreen({ chats, onOpen }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matched: { chat: Chat; matchType: "name" | "message"; matchText: string }[] = [];
    chats.forEach((chat) => {
      if (chat.user.name.toLowerCase().includes(q)) {
        matched.push({ chat, matchType: "name", matchText: chat.user.name });
      } else {
        const msg = chat.messages.findLast((m) => m.text.toLowerCase().includes(q));
        if (msg) matched.push({ chat, matchType: "message", matchText: msg.text });
      }
    });
    return matched;
  }, [query, chats]);

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-violet-500/30 text-violet-300 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-hidden">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-black mb-4">Поиск</h1>
        <div className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/8">
          <Icon name="Search" size={18} className="text-muted-foreground/50 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Люди или сообщения..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground/40 active:opacity-60">
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {!query && (
          <div className="animate-fade-in">
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">Контакты</p>
            <div className="space-y-2">
              {chats.map((chat, i) => (
                <button
                  key={chat.id}
                  onClick={() => onOpen(chat.id)}
                  className="w-full flex items-center gap-3 glass-card rounded-2xl p-3 active:scale-[0.98] transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                    {chat.user.avatar}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm">{chat.user.name}</p>
                    <p className="text-xs text-muted-foreground/50">{chat.user.online ? "онлайн" : chat.user.lastSeen ?? "не в сети"}</p>
                  </div>
                  {chat.user.online && <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground/60 text-sm text-center">
              Ничего не найдено по запросу<br />
              <span className="text-violet-400 font-semibold">«{query}»</span>
            </p>
          </div>
        )}

        {query && results.length > 0 && (
          <div className="animate-fade-in">
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">
              Найдено: {results.length}
            </p>
            <div className="space-y-2">
              {results.map(({ chat, matchType, matchText }, i) => (
                <button
                  key={chat.id}
                  onClick={() => onOpen(chat.id)}
                  className="w-full flex items-center gap-3 glass-card rounded-2xl p-3 active:scale-[0.98] transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                    {chat.user.avatar}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm">{chat.user.name}</p>
                    <p className="text-xs text-muted-foreground/50 truncate">
                      {matchType === "message" ? highlight(matchText, query) : "Совпадение по имени"}
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground/30 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
