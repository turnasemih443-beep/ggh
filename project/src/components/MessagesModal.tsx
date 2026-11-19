import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, MessageCircle, Send, UserPlus, X } from 'lucide-react';
import { Avatar } from './Avatar';
import { conversationIdFor, fetchMessages, sendMessage, subscribeToMessages, type DmMessage } from '@/lib/dm';

interface MessagesModalProps {
  myProfile: { username: string; avatarUrl: string | null };
  onClose: () => void;
}

interface ChatEntry {
  id: string;
  username: string;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastAt: string | null;
}

const STORAGE_KEY = 'anigram:dm-chats';

function loadChatEntries(): ChatEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatEntry[]) : [];
  } catch {
    return [];
  }
}

function saveChatEntries(entries: ChatEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Kota dolduğunda sessizce geç
  }
}

export function MessagesModal({ myProfile, onClose }: MessagesModalProps) {
  const [activeChat, setActiveChat] = useState<ChatEntry | null>(null);
  const [chats, setChats] = useState<ChatEntry[]>(() => loadChatEntries());
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveChatEntries(chats);
  }, [chats]);

  const startChat = () => {
    const username = newUsername.trim().replace(/^@/, '');
    if (!username) return;
    if (username.toLowerCase() === myProfile.username.toLowerCase()) {
      setError('Kendine mesaj gönderemezsin.');
      return;
    }
    setError(null);
    setChats((prev) =>
      prev.some((c) => c.username.toLowerCase() === username.toLowerCase())
        ? prev
        : [{ id: `chat-${username.toLowerCase()}`, username, avatarUrl: null, lastMessage: null, lastAt: null }, ...prev]
    );
    setNewUsername('');
    setActiveChat({ id: `chat-${username.toLowerCase()}`, username, avatarUrl: null, lastMessage: null, lastAt: null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:h-[80vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {activeChat ? (
          <ChatView
            myProfile={myProfile}
            chat={activeChat}
            onBack={() => setActiveChat(null)}
            onLastMessage={(text) =>
              setChats((prev) =>
                prev.map((c) =>
                  c.username.toLowerCase() === activeChat.username.toLowerCase()
                    ? { ...c, lastMessage: text, lastAt: new Date().toISOString() }
                    : c
                )
              )
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <h2 className="text-lg font-bold text-slate-100">Mesajlar</h2>
              <button onClick={onClose} aria-label="Kapat" className="text-slate-400 transition-colors hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-800 p-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Yeni Sohbet Başlat</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && startChat()}
                    placeholder="Kullanıcı adı gir..."
                    className="w-full rounded-full border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-500"
                  />
                </div>
                <button
                  onClick={startChat}
                  className="rounded-full bg-fuchsia-600 px-4 text-sm font-bold text-white transition-colors hover:bg-fuchsia-500"
                >
                  Başlat
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
              <p className="mt-2 text-xs text-slate-500">
                Karşı tarafın profilindeki kullanıcı adını girerek sohbet başlat. Mesajlar gerçek zamanlı iletilir.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <MessageCircle className="mb-3 h-10 w-10 text-slate-600" />
                  <p className="text-sm text-slate-400">
                    Henüz sohbetin yok. Yukarıdan bir kullanıcı adı girerek favori anime ve mangalar hakkında sohbete başla.
                  </p>
                </div>
              ) : (
                <ul>
                  {chats.map((chat) => (
                    <li key={chat.id}>
                      <button
                        onClick={() => setActiveChat(chat)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800"
                      >
                        <Avatar username={chat.username} imageUrl={chat.avatarUrl} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-100">{chat.username}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {chat.lastMessage ?? 'Sohbete başla'}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChatView({
  myProfile,
  chat,
  onBack,
  onLastMessage,
}: {
  myProfile: { username: string; avatarUrl: string | null };
  chat: ChatEntry;
  onBack: () => void;
  onLastMessage: (text: string) => void;
}) {
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationId = conversationIdFor(myProfile.username, chat.username);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchMessages(conversationId)
      .then((rows) => {
        if (!cancelled) setMessages(rows);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Mesajlar yüklenemedi. Bağlantını kontrol et.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  const submit = useCallback(async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await sendMessage({
        conversationId,
        senderName: myProfile.username,
        senderAvatar: myProfile.avatarUrl,
        body,
      });
      setText('');
      onLastMessage(body);
    } catch {
      setLoadError('Mesaj gönderilemedi. Tekrar dene.');
    } finally {
      setSending(false);
    }
  }, [text, sending, conversationId, myProfile, onLastMessage]);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <button onClick={onBack} aria-label="Geri" className="text-slate-400 transition-colors hover:text-slate-200">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar username={chat.username} imageUrl={chat.avatarUrl} />
        <p className="truncate text-sm font-bold text-slate-100">{chat.username}</p>
        <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Canlı
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...
          </div>
        )}
        {loadError && <p className="py-4 text-center text-sm text-rose-400">{loadError}</p>}
        {!loading && !loadError && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            Henüz mesaj yok. Sohbeti {chat.username} ile başlat!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderName === myProfile.username;
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && <Avatar username={m.senderName} imageUrl={m.senderAvatar} />}
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? 'rounded-br-sm bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white'
                    : 'rounded-bl-sm bg-slate-800 text-slate-100'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-slate-500'}`}>
                  {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 p-3">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Mesaj yaz..."
            maxLength={1000}
            className="flex-1 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-500"
          />
          <button
            onClick={submit}
            disabled={sending || !text.trim()}
            aria-label="Gönder"
            className="rounded-full bg-fuchsia-600 p-2.5 text-white transition-colors hover:bg-fuchsia-500 disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </>
  );
}
