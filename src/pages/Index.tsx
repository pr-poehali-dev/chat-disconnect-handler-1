import { useState, useEffect, useCallback } from "react";
import AuthScreen from "@/components/screens/AuthScreen";
import ChatsScreen from "@/components/screens/ChatsScreen";
import ChatScreen from "@/components/screens/ChatScreen";
import SearchScreen from "@/components/screens/SearchScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import BottomNav from "@/components/BottomNav";
import { apiGetChats, apiGetMessages, apiSendMessage, type ApiChat, type ApiMessage } from "@/api";

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

function apiChatToChat(c: ApiChat): Chat {
  return {
    id: c.id,
    user: {
      id: c.user.id,
      name: c.user.name,
      avatar: c.user.avatar,
      online: c.user.online,
      lastSeen: c.user.lastSeen || undefined,
    },
    messages: c.lastMessage ? [{
      id: c.id + '_last',
      chatId: c.id,
      fromMe: c.lastMessage.fromMe,
      text: c.lastMessage.text,
      time: new Date(c.lastMessage.time),
      status: 'delivered',
    }] : [],
    unread: c.unread,
    isPinned: c.isPinned,
  };
}

function apiMsgToMsg(m: ApiMessage): ChatMessage {
  return {
    id: m.id,
    chatId: m.chatId,
    fromMe: m.fromMe,
    text: m.text,
    time: new Date(m.time),
    status: m.status,
  };
}

export default function Index() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '');
  const [me, setMe] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [screen, setScreen] = useState<Screen>("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);

  const loadChats = useCallback(async () => {
    if (!token) return;
    setLoadingChats(true);
    try {
      const apiChats = await apiGetChats();
      setChats(apiChats.map(apiChatToChat));
    } catch {
      // ignore
    } finally {
      setLoadingChats(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadChats();
  }, [token, loadChats]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (!openChatId || !token) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await apiGetMessages(openChatId);
        setChats(prev => prev.map(c => {
          if (c.id !== openChatId) return c;
          return { ...c, messages: msgs.map(apiMsgToMsg), unread: 0 };
        }));
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [openChatId, token]);

  // Poll chats list
  useEffect(() => {
    if (!token || openChatId) return;
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [token, openChatId, loadChats]);

  const handleAuth = (newToken: string, user: { id: string; name: string; avatar: string }) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ ...user, online: true }));
    setToken(newToken);
    setMe({ ...user, online: true });
  };

  if (!token || !me) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const openChat = chats.find((c) => c.id === openChatId);

  const openChatAndLoad = async (chatId: string) => {
    setOpenChatId(chatId);
    try {
      const msgs = await apiGetMessages(chatId);
      setChats(prev => prev.map(c => {
        if (c.id !== chatId) return c;
        return { ...c, messages: msgs.map(apiMsgToMsg), unread: 0 };
      }));
    } catch { /* ignore */ }
  };

  const sendMessage = async (chatId: string, text: string) => {
    const tempId = 'tmp_' + Date.now();
    const tempMsg: ChatMessage = {
      id: tempId,
      chatId,
      fromMe: true,
      text,
      time: new Date(),
      status: 'sent',
    };
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, tempMsg] } : c));

    try {
      const sent = await apiSendMessage(chatId, text);
      setChats(prev => prev.map(c => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map(m => m.id === tempId ? apiMsgToMsg(sent) : m),
        };
      }));
    } catch {
      // keep temp message
    }
  };

  if (openChatId && openChat) {
    return (
      <div className="mobile-screen bg-mesh font-golos">
        <ChatScreen
          chat={openChat}
          me={me}
          onBack={() => { setOpenChatId(null); loadChats(); }}
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
          loading={loadingChats && chats.length === 0}
          onOpen={openChatAndLoad}
        />
      )}
      {screen === "search" && (
        <SearchScreen chats={chats} onOpen={openChatAndLoad} />
      )}
      {screen === "profile" && <ProfileScreen me={me} chats={chats} onLogout={() => { setToken(''); setMe(null); setChats([]); }} />}
      {screen === "settings" && <SettingsScreen />}

      <BottomNav current={screen} onChange={setScreen} totalUnread={chats.reduce((s, c) => s + c.unread, 0)} />
    </div>
  );
}