import { useState } from "react";
import AuthScreen from "@/components/screens/AuthScreen";
import MessagesScreen from "@/components/screens/MessagesScreen";
import ScheduledScreen from "@/components/screens/ScheduledScreen";
import SearchScreen from "@/components/screens/SearchScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import BottomNav from "@/components/BottomNav";
import ComposeModal from "@/components/ComposeModal";

export type Screen = "messages" | "scheduled" | "search" | "profile" | "settings";

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  scheduledFor?: Date;
  tags?: string[];
  mood?: "neutral" | "happy" | "idea" | "urgent";
  isPinned?: boolean;
}

const DEMO_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Позвонить маме вечером — она упоминала что-то важное про дачу",
    createdAt: new Date(Date.now() - 3600000 * 2),
    mood: "urgent",
    tags: ["важно"],
    isPinned: true,
  },
  {
    id: "2",
    text: "Идея для проекта: сделать дашборд с тепловой картой активности по дням недели. Выглядело бы очень круто!",
    createdAt: new Date(Date.now() - 3600000 * 5),
    mood: "idea",
    tags: ["идеи", "работа"],
  },
  {
    id: "3",
    text: "Прочитать книгу «Мышление быстрое и медленное» — Даниэль Канеман. Уже несколько месяцев откладываю.",
    createdAt: new Date(Date.now() - 3600000 * 24),
    mood: "neutral",
    tags: ["книги"],
  },
  {
    id: "4",
    text: "Купить кофе зерновой — Эфиопия Йергачефф. В кофейне на Садовой был отличный.",
    createdAt: new Date(Date.now() - 3600000 * 48),
    mood: "happy",
    tags: ["покупки"],
  },
];

const DEMO_SCHEDULED: Message[] = [
  {
    id: "s1",
    text: "Заплатить за интернет — автоплатёж не настроен",
    createdAt: new Date(),
    scheduledFor: new Date(Date.now() + 3600000 * 48),
    mood: "urgent",
    tags: ["финансы"],
  },
  {
    id: "s2",
    text: "Написать отзыв на книгу которую дочитал на прошлой неделе",
    createdAt: new Date(),
    scheduledFor: new Date(Date.now() + 3600000 * 24 * 3),
    mood: "neutral",
    tags: ["книги"],
  },
  {
    id: "s3",
    text: "Проверить дедлайн по проекту — осталась неделя",
    createdAt: new Date(),
    scheduledFor: new Date(Date.now() + 3600000 * 24 * 7),
    mood: "idea",
    tags: ["работа"],
  },
];

export default function Index() {
  const [isAuth, setIsAuth] = useState(false);
  const [screen, setScreen] = useState<Screen>("messages");
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [scheduled, setScheduled] = useState<Message[]>(DEMO_SCHEDULED);
  const [isComposing, setIsComposing] = useState(false);

  if (!isAuth) {
    return <AuthScreen onAuth={() => setIsAuth(true)} />;
  }

  const addMessage = (msg: Omit<Message, "id" | "createdAt">) => {
    const newMsg: Message = {
      ...msg,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    if (msg.scheduledFor) {
      setScheduled((prev) => [newMsg, ...prev]);
    } else {
      setMessages((prev) => [newMsg, ...prev]);
    }
    setIsComposing(false);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setScheduled((prev) => prev.filter((m) => m.id !== id));
  };

  const pinMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m))
    );
  };

  const allMessages = [...messages, ...scheduled];

  return (
    <div className="mobile-screen bg-mesh font-golos">
      {screen === "messages" && (
        <MessagesScreen
          messages={messages}
          onDelete={deleteMessage}
          onPin={pinMessage}
          onCompose={() => setIsComposing(true)}
        />
      )}
      {screen === "scheduled" && (
        <ScheduledScreen
          messages={scheduled}
          onDelete={deleteMessage}
          onCompose={() => setIsComposing(true)}
        />
      )}
      {screen === "search" && (
        <SearchScreen messages={allMessages} />
      )}
      {screen === "profile" && (
        <ProfileScreen messages={messages} scheduled={scheduled} />
      )}
      {screen === "settings" && (
        <SettingsScreen />
      )}

      <BottomNav current={screen} onChange={setScreen} />

      {isComposing && (
        <ComposeModal
          onClose={() => setIsComposing(false)}
          onSend={addMessage}
        />
      )}
    </div>
  );
}
