const URLS = {
  auth: 'https://functions.poehali.dev/25d6c148-2909-47e7-bf1c-9342e11cb3b1',
  chats: 'https://functions.poehali.dev/5625b8dd-d4b4-4094-9693-c1827acead4c',
  messages: 'https://functions.poehali.dev/becb7524-2831-4cb1-8b92-d06243c55c09',
};

function getToken(): string {
  return localStorage.getItem('token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': getToken(),
  };
}

async function parseBody(r: Response) {
  const raw = await r.json();
  // Backend wraps body as JSON string — need double parse
  if (typeof raw === 'string') return JSON.parse(raw);
  return raw;
}

export async function apiRegister(name: string, email: string, password: string) {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', name, email, password }),
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data.error || 'Ошибка регистрации');
  return data as { token: string; user: ApiUser };
}

export async function apiLogin(email: string, password: string) {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password }),
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data.error || 'Ошибка входа');
  return data as { token: string; user: ApiUser };
}

export async function apiLogout() {
  await fetch(URLS.auth, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action: 'logout' }),
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function apiMe() {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action: 'me' }),
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error('Не авторизован');
  return data.user as ApiUser;
}

export async function apiGetChats() {
  const r = await fetch(URLS.chats, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data.error || 'Ошибка загрузки чатов');
  return data.chats as ApiChat[];
}

export async function apiCreateChat(userId?: string, email?: string) {
  const r = await fetch(URLS.chats, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action: 'create', userId, email }),
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data.error || 'Ошибка создания чата');
  return data.chatId as string;
}

export async function apiGetMessages(chatId: string) {
  const r = await fetch(`${URLS.messages}?chatId=${chatId}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data.error || 'Ошибка загрузки сообщений');
  return data.messages as ApiMessage[];
}

export async function apiSendMessage(chatId: string, text: string) {
  const r = await fetch(URLS.messages, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action: 'send', chatId, text }),
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data.error || 'Ошибка отправки');
  return data.message as ApiMessage;
}

export interface ApiUser {
  id: string;
  name: string;
  avatar: string;
  email?: string;
}

export interface ApiChat {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
    lastSeen: string | null;
  };
  isPinned: boolean;
  unread: number;
  lastMessage: {
    text: string;
    time: string;
    fromMe: boolean;
  } | null;
}

export interface ApiMessage {
  id: string;
  chatId: string;
  fromMe: boolean;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}
