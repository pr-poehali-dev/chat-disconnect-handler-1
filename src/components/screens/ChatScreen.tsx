import { useState, useRef, useEffect } from "react";
import type { Chat, User } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  chat: Chat;
  me: User;
  onBack: () => void;
  onSend: (text: string) => void;
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-orange-400 to-amber-500",
  "from-sky-500 to-blue-600",
  "from-green-500 to-teal-600",
];

function timeLabel(date: Date): string {
  return date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(messages: Chat["messages"]) {
  const groups: { label: string; messages: Chat["messages"] }[] = [];
  let lastDate = "";
  messages.forEach((m) => {
    const d = m.time.toLocaleDateString("ru", { day: "numeric", month: "long" });
    if (d !== lastDate) {
      groups.push({ label: d, messages: [m] });
      lastDate = d;
    } else {
      groups[groups.length - 1].messages.push(m);
    }
  });
  return groups;
}

export default function ChatScreen({ chat, onBack, onSend }: Props) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const colorClass = AVATAR_COLORS[parseInt(chat.id) % AVATAR_COLORS.length];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Simulate typing indicator after send
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 2500);
    return () => clearTimeout(t);
  }, [typing]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    setTyping(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const groups = groupByDate(chat.messages);

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <div className="glass-card border-b border-white/8 px-4 pt-12 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="active:scale-90 transition-transform -ml-1 p-1">
          <Icon name="ChevronLeft" size={24} className="text-foreground" />
        </button>

        <div className="relative">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold`}>
            {chat.user.avatar}
          </div>
          {chat.user.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{chat.user.name}</p>
          <p className="text-xs text-muted-foreground/50">
            {typing ? (
              <span className="text-green-400 animate-pulse">печатает...</span>
            ) : chat.user.online ? (
              <span className="text-green-400">онлайн</span>
            ) : (
              chat.user.lastSeen ?? "не в сети"
            )}
          </p>
        </div>

        <div className="flex gap-1">
          <button className="w-9 h-9 glass-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
            <Icon name="Phone" size={16} className="text-muted-foreground/60" />
          </button>
          <button className="w-9 h-9 glass-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
            <Icon name="MoreVertical" size={16} className="text-muted-foreground/60" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex justify-center my-3">
              <span className="text-[10px] font-semibold text-muted-foreground/40 glass-card px-3 py-1 rounded-full">
                {group.label}
              </span>
            </div>
            {group.messages.map((msg, i) => {
              const prev = group.messages[i - 1];
              const isFirst = !prev || prev.fromMe !== msg.fromMe;
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.fromMe ? "justify-end" : "justify-start"} ${isFirst ? "mt-3" : "mt-0.5"} animate-fade-in-fast`}
                >
                  <div
                    className={`max-w-[78%] px-3.5 py-2 text-sm leading-relaxed break-words ${
                      msg.fromMe
                        ? "gradient-btn text-white rounded-2xl rounded-tr-sm neon-glow"
                        : "glass-card text-foreground/90 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-0.5 ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                      <span className={`text-[10px] ${msg.fromMe ? "text-white/60" : "text-muted-foreground/40"}`}>
                        {timeLabel(msg.time)}
                      </span>
                      {msg.fromMe && (
                        <span className="text-white/60">
                          {msg.status === "read" ? (
                            <Icon name="CheckCheck" size={12} className="text-white/70" />
                          ) : (
                            <Icon name="Check" size={12} className="text-white/50" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start mt-3 animate-fade-in-fast">
            <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="px-3 pb-4 pt-2 shrink-0">
        <div className="glass-card flex items-end gap-2 rounded-2xl px-3 py-2 border border-white/10">
          <button className="p-1.5 text-muted-foreground/40 active:scale-90 transition-transform mb-0.5">
            <Icon name="Smile" size={20} />
          </button>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40 resize-none py-1.5 max-h-24"
          />
          <button className="p-1.5 text-muted-foreground/40 active:scale-90 transition-transform mb-0.5">
            <Icon name="Paperclip" size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 mb-0.5 shrink-0 ${
              text.trim() ? "gradient-btn neon-glow" : "bg-white/6"
            }`}
          >
            <Icon name="Send" size={16} className={text.trim() ? "text-white" : "text-muted-foreground/30"} />
          </button>
        </div>
      </div>
    </div>
  );
}
