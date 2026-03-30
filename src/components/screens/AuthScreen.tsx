import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onAuth: () => void;
}

export default function AuthScreen({ onAuth }: Props) {
  const [step, setStep] = useState<"welcome" | "login">("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuth();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-[-100px] left-[-80px] w-[320px] h-[320px] rounded-full bg-violet-600/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-60px] w-[260px] h-[260px] rounded-full bg-pink-600/20 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-[-120px] w-[200px] h-[200px] rounded-full bg-orange-500/10 blur-[60px] pointer-events-none" />

      {step === "welcome" ? (
        <div className="flex flex-col items-center text-center animate-fade-in">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl gradient-btn flex items-center justify-center mb-6 neon-glow animate-float shadow-2xl">
            <span className="text-3xl">✦</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight mb-2">
            <span className="gradient-text">Эхо</span>
          </h1>
          <p className="text-muted-foreground text-base mb-1 font-medium">Твой личный голос</p>
          <p className="text-muted-foreground/60 text-sm mb-12 max-w-[260px]">
            Заметки, напоминания и мысли — всё в одном месте
          </p>

          {/* Features */}
          <div className="w-full space-y-3 mb-12">
            {[
              { icon: "MessageSquare", text: "Мгновенные заметки", color: "text-violet-400" },
              { icon: "Clock", text: "Отложенные сообщения", color: "text-pink-400" },
              { icon: "Search", text: "Умный поиск", color: "text-orange-400" },
            ].map((f, i) => (
              <div
                key={f.icon}
                className={`glass-card flex items-center gap-3 px-4 py-3 rounded-2xl animate-fade-in stagger-${i + 1}`}
              >
                <div className={`${f.color}`}>
                  <Icon name={f.icon as "MessageSquare"} size={18} />
                </div>
                <span className="text-sm font-medium text-foreground/80">{f.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("login")}
            className="w-full gradient-btn text-white font-semibold py-4 rounded-2xl text-base neon-glow transition-all active:scale-95"
          >
            Начать
          </button>
          <p className="text-muted-foreground/50 text-xs mt-4">
            Бесплатно · Никакой рекламы
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col animate-slide-up">
          <button
            onClick={() => setStep("welcome")}
            className="flex items-center gap-2 text-muted-foreground mb-8 active:opacity-60 transition-opacity w-fit"
          >
            <Icon name="ChevronLeft" size={20} />
            <span className="text-sm">Назад</span>
          </button>

          <div className="w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center mb-6 neon-glow">
            <span className="text-xl">✦</span>
          </div>

          <h2 className="text-3xl font-black mb-1">Войти</h2>
          <p className="text-muted-foreground text-sm mb-8">Введи данные для входа</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full glass-card rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-violet-500/50 border border-transparent transition-all text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-card rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-violet-500/50 border border-transparent transition-all text-foreground placeholder:text-muted-foreground/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full gradient-btn text-white font-semibold py-4 rounded-2xl text-base neon-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Входим...</span>
                </>
              ) : (
                "Войти в Эхо"
              )}
            </button>
          </form>

          <p className="text-center text-muted-foreground/40 text-xs mt-6">
            Нет аккаунта? <span className="text-violet-400 cursor-pointer">Зарегистрироваться</span>
          </p>
        </div>
      )}
    </div>
  );
}
