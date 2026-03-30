import type { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  current: Screen;
  onChange: (s: Screen) => void;
  totalUnread?: number;
}

const TABS: { id: Screen; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageCircle", label: "Чаты" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Параметры" },
];

export default function BottomNav({ current, onChange, totalUnread = 0 }: Props) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20">
      <div
        className="mx-3 mb-3 glass-card rounded-2xl flex items-center justify-around px-2 py-2 border border-white/10"
        style={{ backdropFilter: "blur(30px)" }}
      >
        {TABS.map((tab) => {
          const active = current === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 relative ${
                active ? "text-white" : "text-muted-foreground/40"
              }`}
            >
              <div className={`relative transition-all duration-200 ${active ? "scale-110" : ""}`}>
                {active && (
                  <div className="absolute inset-0 rounded-lg gradient-btn blur-md opacity-60 -z-10 scale-150" />
                )}
                <Icon name={tab.icon as "MessageCircle"} size={20} className={active ? "gradient-text" : ""} />
                {tab.id === "chats" && totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full gradient-btn text-white text-[9px] font-bold flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-semibold transition-all ${active ? "gradient-text" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
