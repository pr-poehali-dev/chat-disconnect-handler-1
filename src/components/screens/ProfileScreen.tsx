import type { User, Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  me: User;
  chats: Chat[];
}

export default function ProfileScreen({ me, chats }: Props) {
  const totalSent = chats.flatMap((c) => c.messages).filter((m) => m.fromMe).length;
  const totalReceived = chats.flatMap((c) => c.messages).filter((m) => !m.fromMe).length;
  const onlineContacts = chats.filter((c) => c.user.online).length;

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-y-auto">
      <div className="px-5 pt-14 pb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl gradient-btn flex items-center justify-center neon-glow mb-4">
              <span className="text-4xl font-black text-white">{me.avatar}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-green-400 flex items-center justify-center border-2 border-background">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black mt-2">{me.name}</h2>
          <p className="text-muted-foreground/60 text-sm">alexey@example.com</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-green-400 font-semibold">Онлайн</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 animate-fade-in stagger-1">
          {[
            { label: "Отправлено", value: totalSent, icon: "Send", color: "text-violet-400" },
            { label: "Получено", value: totalReceived, icon: "Inbox", color: "text-pink-400" },
            { label: "Онлайн", value: onlineContacts, icon: "Users", color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
              <Icon name={s.icon as "Send"} size={18} className={`${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-[10px] text-muted-foreground/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Contacts */}
        <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in stagger-2">
          <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
            Контакты ({chats.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {chats.map((chat, i) => {
              const colors = ["from-violet-500 to-purple-600", "from-pink-500 to-rose-600", "from-orange-400 to-amber-500", "from-sky-500 to-blue-600", "from-green-500 to-teal-600"];
              return (
                <div key={chat.id} className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm`}>
                    {chat.user.avatar}
                    {chat.user.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-background" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 max-w-[44px] truncate">{chat.user.name.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 animate-fade-in stagger-3">
          {[
            { icon: "Edit3", label: "Редактировать профиль", color: "text-violet-400" },
            { icon: "Bell", label: "Уведомления", color: "text-orange-400" },
            { icon: "Lock", label: "Конфиденциальность", color: "text-blue-400" },
            { icon: "LogOut", label: "Выйти", color: "text-red-400" },
          ].map((a) => (
            <button
              key={a.label}
              className="w-full glass-card flex items-center justify-between px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <Icon name={a.icon as "Edit3"} size={18} className={a.color} />
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
