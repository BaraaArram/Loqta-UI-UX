import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { config } from '@/config/env';

interface ChatMessage {
  sender: string;
  recipient: string;
  message: string;
  datetime: string;
}

interface ChatProps {
  productId: string;
  sellerUsername?: string; // Optionally pass seller username if available
}

const WS_BASE = typeof window !== 'undefined' && window.location.protocol === 'https:'
  ? 'wss://'
  : 'ws://';

// Helper to extract host:port from config.api.baseUrl
function getBackendHostAndPort() {
  if (typeof window === 'undefined') return '';
  try {
    const url = new URL(config.api.baseUrl);
    return url.host;
  } catch {
    return config.api.baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

export default function Chat({ productId, sellerUsername }: ChatProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    fetch(`${config.api.baseUrl.replace(/\/$/, '')}/api/v1/chat/${productId}/`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        // Parse messages from API response
        const msgs = data.messages || (data.data && data.data.messages) || [];
        setMessages(msgs);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load chat history.');
        setLoading(false);
      });
  }, [productId, isAuthenticated]);

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;
    const backendHost = getBackendHostAndPort();
    const wsUrl = `${WS_BASE}${backendHost}/ws/chat/room/${productId}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.message) {
          setMessages(prev => [...prev, data]);
        }
      } catch (e) {}
    };
    ws.onerror = (e) => {
      setError('WebSocket error.');
    };
    ws.onclose = (e) => {
    };
    return () => ws.close();
  }, [productId, isAuthenticated]);

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
    const payload: any = { message: input.trim() };
    // If user is seller, add recipient (buyer) username
    if (user && sellerUsername && user.username === sellerUsername) {
      // Find the recipient from the last message (the other participant)
      const lastMsg = messages.slice().reverse().find(m => m.sender !== user.username);
      if (lastMsg) {
        payload.recipient = lastMsg.sender;
      } else {
        // If no previous messages, require manual recipient input or skip
        setError('No recipient found for this chat.');
        return;
      }
    }
    wsRef.current.send(JSON.stringify(payload));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="flex flex-col h-[400px] max-h-[60vh] w-full bg-cardC rounded-2xl shadow border border-muted/10">
      <div className="px-4 py-3 border-b border-muted/10 bg-accentC/10 rounded-t-2xl">
        <span className="font-bold text-lg text-heading">Product Chat</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-muted">Loading chat...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted">No messages yet.</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx + msg.datetime}
              className={`flex flex-col ${msg.sender === user?.username ? 'items-end' : 'items-start'}`}
            >
              <div className={`px-4 py-2 rounded-xl max-w-[70%] break-words shadow text-sm ${msg.sender === user?.username
                ? 'bg-accentC text-white'
                : 'bg-muted/20 text-heading'}`}
              >
                <span className="block font-semibold mb-1 text-xs text-muted">
                  {msg.sender === user?.username ? 'You' : msg.sender}
                </span>
                {msg.message}
                <span className="block text-[10px] text-muted mt-1 text-right">
                  {new Date(msg.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-muted/10 bg-cardC rounded-b-2xl flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg border border-muted/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accentC bg-cardC text-heading"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isAuthenticated}
        />
        <button
          className="px-4 py-2 rounded-lg bg-accentC text-white font-bold hover:bg-accentC/90 transition disabled:opacity-60"
          onClick={sendMessage}
          disabled={!input.trim() || !isAuthenticated}
        >
          Send
        </button>
      </div>
    </div>
  );
} 