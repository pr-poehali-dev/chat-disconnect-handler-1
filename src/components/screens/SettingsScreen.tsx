import { useState } from "react";
import Icon from "@/components/ui/icon";

const THEMES = [
  { id: "violet", label: "Фиолетовый", from: "#7c3aed", to: "#db2777" },
  { id: "ocean", label: "Океан", from: "#0ea5e9", to: "#06b6d4" },
  { id: "forest", label: "Лес", from: "#16a34a", to: "#65a30d" },
  { id: "sunset", label: "Закат", from: "#f97316", to: "#ef4444" },
];

interface ToggleProps {
  label: string;
  description?: string;
  defaultOn?: boolean;
  icon: string;
  iconColor: string;
}

function Toggle({ label, description, defaultOn = false, icon, iconColor }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="w-full flex items-center justify-between px-4 py-3.5 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center`}>
          <Icon name={icon as "Bell"} size={15} className={iconColor} />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground/50">{description}</p>}
        </div>
      </div>
      <div
        className={`w-11 h-6 rounded-full transition-all duration-200 relative ${on ? "gradient-btn" : "bg-white/10"}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </div>
    </button>
  );
}

export default function SettingsScreen() {
  const [theme, setTheme] = useState("violet");

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] overflow-y-auto">
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-2xl font-black mb-6">Настройки</h1>

        {/* Appearance */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3 px-1">
            Внешний вид
          </p>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-semibold mb-3">Цветовая тема</p>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl transition-all ${theme === t.id ? "scale-110 ring-2 ring-white/40 shadow-lg" : "opacity-60"}`}
                    style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                  />
                  <span className="text-[10px] text-muted-foreground/60">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3 px-1">
            Уведомления
          </p>
          <div className="glass-card rounded-2xl divide-y divide-white/5">
            <Toggle label="Push-уведомления" description="Напоминания о запланированных" defaultOn icon="Bell" iconColor="text-violet-400" />
            <Toggle label="Звук" description="Звук при получении напоминания" icon="Volume2" iconColor="text-pink-400" />
            <Toggle label="Вибрация" defaultOn icon="Smartphone" iconColor="text-orange-400" />
          </div>
        </div>

        {/* Privacy */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3 px-1">
            Конфиденциальность
          </p>
          <div className="glass-card rounded-2xl divide-y divide-white/5">
            <Toggle label="Блокировка биометрией" icon="Fingerprint" iconColor="text-green-400" />
            <Toggle label="Скрывать содержимое" description="В списке задач и уведомлениях" icon="EyeOff" iconColor="text-blue-400" />
          </div>
        </div>

        {/* Info */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3 px-1">
            Приложение
          </p>
          <div className="glass-card rounded-2xl divide-y divide-white/5">
            {[
              { icon: "HelpCircle", label: "Помощь и поддержка", color: "text-violet-400" },
              { icon: "Star", label: "Оценить приложение", color: "text-yellow-400" },
              { icon: "Shield", label: "Политика конфиденциальности", color: "text-blue-400" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between px-4 py-3.5 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center">
                    <Icon name={item.icon as "Star"} size={15} className={item.color} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground/30" />
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground/30">Эхо v1.0.0 · Сделано с ❤️</p>
        </div>
      </div>
    </div>
  );
}
