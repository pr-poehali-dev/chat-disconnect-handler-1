import { useState, useMemo } from "react";
import type { Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import MessageCard from "@/components/MessageCard";

interface Props {
  messages: Message[];
}

export default function SearchScreen({ messages }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return messages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, messages]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    messages.forEach((m) => m.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-black mb-4">Поиск</h1>

        {/* Search input */}
        <div className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/8">
          <Icon name="Search" size={18} className="text-muted-foreground/50 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти заметку или тег..."
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
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">Теги</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 glass-card rounded-full text-xs font-semibold text-muted-foreground active:scale-95 transition-transform"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">Недавние</p>
            <div className="space-y-3">
              {messages.slice(0, 3).map((msg) => (
                <MessageCard key={msg.id} msg={msg} onDelete={() => {}} showDate />
              ))}
            </div>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground/60 text-sm text-center">
              Ничего не нашлось по запросу<br />
              <span className="text-violet-400 font-semibold">«{query}»</span>
            </p>
          </div>
        )}

        {query && results.length > 0 && (
          <div className="animate-fade-in-fast">
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">
              Найдено: {results.length}
            </p>
            <div className="space-y-3">
              {results.map((msg, i) => (
                <div key={msg.id} className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}>
                  <MessageCard msg={msg} onDelete={() => {}} showDate />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
