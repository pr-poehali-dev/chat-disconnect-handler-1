import { useState } from "react";
import AuthScreen from "@/components/screens/AuthScreen";
import ChatsScreen from "@/components/screens/ChatsScreen";
import ChatScreen from "@/components/screens/ChatScreen";
import SearchScreen from "@/components/screens/SearchScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import BottomNav from "@/components/BottomNav";

export type Screen = "chats" | "search" | "profile" | "settings";

export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  fromMe: boolean;
  text: string;
  time: Date;
  status: "sent" | "delivered" | "read";
  replyTo?: string;
}

export interface Chat {
  id: string;
  user: User;
  messages: ChatMessage[];
  unread: number;
  isPinned?: boolean;
}

const ME: User = {
  id: "me",
  name: "Алексей",
  avatar: "А",
  online: true,
};

const DEMO_CHATS: Chat[] = [
  {
    id: "1",
    user: { id: "u1", name: "Мария Соколова", avatar: "М", online: true },
    isPinned: true,
    unread: 2,
    messages: [
      { id: "m1", chatId: "1", fromMe: false, text: "Привет! Как дела?", time: new Date(Date.now() - 3600000 * 2), status: "read" },
      { id: "m2", chatId: "1", fromMe: true, text: "Всё отлично, спасибо! Работаю над новым проектом 🚀", time: new Date(Date.now() - 3600000 * 2 + 60000), status: "read" },
      { id: "m3", chatId: "1", fromMe: false, text: "О, интересно! Расскажешь потом?", time: new Date(Date.now() - 3600000 * 1), status: "read" },
      { id: "m4", chatId: "1", fromMe: false, text: "Кстати, ты смотрел последний эпизод?", time: new Date(Date.now() - 1800000), status: "delivered" },
    ],
  },
  {
    id: "2",
    user: { id: "u2", name: "Дмитрий Волков", avatar: "Д", online: false, lastSeen: "был час назад" },
    unread: 0,
    messages: [
      { id: "m5", chatId: "2", fromMe: true, text: "Дим, скинь файлы по проекту когда будет время", time: new Date(Date.now() - 3600000 * 5), status: "read" },
      { id: "m6", chatId: "2", fromMe: false, text: "Да, уже скидываю на почту", time: new Date(Date.now() - 3600000 * 4), status: "read" },
      { id: "m7", chatId: "2", fromMe: true, text: "Получил, спасибо 👍", time: new Date(Date.now() - 3600000 * 4 + 120000), status: "read" },
    ],
  },
  {
    id: "3",
    user: { id: "u3", name: "Анна Белова", avatar: "А", online: true },
    unread: 5,
    messages: [
      { id: "m8", chatId: "3", fromMe: false, text: "Встреча перенесена на пятницу", time: new Date(Date.now() - 3600000 * 24), status: "read" },
      { id: "m9", chatId: "3", fromMe: false, text: "В 15:00 в том же месте", time: new Date(Date.now() - 3600000 * 24 + 30000), status: "read" },
      { id: "m10", chatId: "3", fromMe: false, text: "Ты сможешь?", time: new Date(Date.now() - 3600000 * 3), status: "delivered" },
      { id: "m11", chatId: "3", fromMe: false, text: "Напиши когда прочитаешь", time: new Date(Date.now() - 3600000 * 2), status: "delivered" },
      { id: "m12", chatId: "3", fromMe: false, text: "Жду ответа!", time: new Date(Date.now() - 1200000), status: "delivered" },
    ],
  },
  {
    id: "4",
    user: { id: "u4", name: "Иван Новиков", avatar: "И", online: false, lastSeen: "вчера" },
    unread: 0,
    messages: [
      { id: "m13", chatId: "4", fromMe: false, text: "Привет, давно не виделись!", time: new Date(Date.now() - 3600000 * 48), status: "read" },
      { id: "m14", chatId: "4", fromMe: true, text: "Да, надо как-нибудь встретиться", time: new Date(Date.now() - 3600000 * 47), status: "read" },
    ],
  },
  {
    id: "5",
    user: { id: "u5", name: "Екатерина Лебедева", avatar: "Е", online: true },
    unread: 1,
    messages: [
      { id: "m15", chatId: "5", fromMe: false, text: "Посмотри что я нашла 😍", time: new Date(Date.now() - 600000), status: "delivered" },
    ],
  },
];

export default function Index() {
  const [isAuth, setIsAuth] = useState(false);
  const [screen, setScreen] = useState<Screen>("chats");
  const [chats, setChats] = useState<Chat[]>(DEMO_CHATS);
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  if (!isAuth) {
    return <AuthScreen onAuth={() => setIsAuth(true)} />;
  }

  const openChat = chats.find((c) => c.id === openChatId);

  const sendMessage = (chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          chatId,
          fromMe: true,
          text,
          time: new Date(),
          status: "sent",
        };
        return { ...c, messages: [...c.messages, newMsg], unread: 0 };
      })
    );
    // Simulate reply
    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const replies = [
            "Понял, спасибо!",
            "Окей 👍",
            "Хорошо, договорились",
            "Отлично!",
            "Буду иметь в виду",
          ];
          const reply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            chatId,
            fromMe: false,
            text: replies[Math.floor(Math.random() * replies.length)],
            time: new Date(),
            status: "delivered",
          };
          return { ...c, messages: [...c.messages, reply] };
        })
      );
    }, 1500 + Math.random() * 1000);
  };

  const markRead = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c))
    );
  };

  if (openChatId && openChat) {
    return (
      <div className="mobile-screen bg-mesh font-golos">
        <ChatScreen
          chat={openChat}
          me={ME}
          onBack={() => setOpenChatId(null)}
          onSend={(text) => sendMessage(openChatId, text)}
        />
      </div>
    );
  }

  return (
    <div className="mobile-screen bg-mesh font-golos">
      {screen === "chats" && (
        <ChatsScreen
          chats={chats}
          onOpen={(id) => { markRead(id); setOpenChatId(id); }}
        />
      )}
      {screen === "search" && (
        <SearchScreen chats={chats} onOpen={(id) => { markRead(id); setOpenChatId(id); }} />
      )}
      {screen === "profile" && <ProfileScreen me={ME} chats={chats} />}
      {screen === "settings" && <SettingsScreen />}

      <BottomNav current={screen} onChange={setScreen} totalUnread={chats.reduce((s, c) => s + c.unread, 0)} />
    </div>
  );
}
