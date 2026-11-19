import { supabase, dmAvailable } from './supabase';

export interface DmMessage {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar: string | null;
  body: string;
  createdAt: string;
}

export function conversationIdFor(a: string, b: string): string {
  return [a, b].sort((x, y) => x.localeCompare(y)).join('::').slice(0, 80);
}

export async function fetchMessages(conversationId: string): Promise<DmMessage[]> {
  if (!dmAvailable) throw new Error('Mesaj servisi kullanılamıyor');
  const { data, error } = await supabase
    .from('dm_messages')
    .select('id, conversation_id, sender_name, sender_avatar, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function sendMessage(params: {
  conversationId: string;
  senderName: string;
  senderAvatar: string | null;
  body: string;
}): Promise<void> {
  if (!dmAvailable) throw new Error('Mesaj servisi kullanılamıyor');
  const body = params.body.trim().slice(0, 1000);
  if (!body) throw new Error('Mesaj boş olamaz');
  const { error } = await supabase.from('dm_messages').insert({
    conversation_id: params.conversationId,
    sender_name: params.senderName.slice(0, 30),
    sender_avatar: params.senderAvatar,
    body,
  });
  if (error) throw error;
}

export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: DmMessage) => void,
  onError?: (error: Error) => void
): () => void {
  if (!dmAvailable) return () => {};
  const channel = supabase
    .channel(`dm:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as {
          id: string;
          conversation_id: string;
          sender_name: string;
          sender_avatar: string | null;
          body: string;
          created_at: string;
        };
        onMessage({
          id: row.id,
          conversationId: row.conversation_id,
          senderName: row.sender_name,
          senderAvatar: row.sender_avatar,
          body: row.body,
          createdAt: row.created_at,
        });
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError?.(new Error('Bağlantı kesildi'));
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
