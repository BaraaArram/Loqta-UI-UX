"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { config } from '@/config/env';

interface ChatMessage {
  sender: string;
  recipient: string;
  message: string;
  datetime: string;
}

interface ChatProps {
  productId: string;
  sellerUsername?: string;
  onClose: () => void; // Add this prop
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

export default function Chat({ productId, sellerUsername, onClose }: ChatProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Remove open state
  const [minimized, setMinimized] = useState(false);

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
    <div
      className={
        `loqta-chat fixed z-50 bottom-4 right-4 w-full max-w-sm md:max-w-md lg:max-w-lg ` +
        `shadow-2xl rounded-2xl border flex flex-col ` +
        `transition-all duration-300 ${minimized ? 'h-14 overflow-hidden' : 'h-[420px] max-h-[80vh]'}`
      }
      style={{
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
        background: 'var(--color-card)',
        borderColor: 'var(--color-muted)'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b rounded-t-2xl"
        style={{
          background: 'var(--color-accent)',
          borderColor: 'var(--color-muted)'
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-accent)' }}
          >
            💬
          </span>
          <span className="font-bold text-base" style={{ color: 'var(--color-card)' }}>Product Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xl px-1"
            style={{ color: 'var(--color-card)', opacity: 0.8 }}
            title={minimized ? 'Expand' : 'Minimize'}
            onClick={() => setMinimized(m => !m)}
          >
            {minimized ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
            )}
          </button>
          <button
            className="text-xl px-1"
            style={{ color: 'var(--color-card)', opacity: 0.8 }}
            title="Close"
            onClick={onClose}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      {/* Messages */}
      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--color-bg-secondary)' }}>
            {loading ? (
              <div className="text-center" style={{ color: 'var(--color-muted)' }}>Loading chat...</div>
            ) : error ? (
              <div className="text-center" style={{ color: 'var(--color-loqta)' }}>{error}</div>
            ) : messages.length === 0 ? (
              <div className="text-center" style={{ color: 'var(--color-muted)' }}>No messages yet.</div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx + msg.datetime}
                  className={`flex flex-col ${msg.sender === user?.username ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[80%] break-words shadow text-sm flex flex-col gap-1 ` +
                      (msg.sender === user?.username
                        ? 'rounded-br-md'
                        : 'border rounded-bl-md')
                    }
                    style={
                      msg.sender === user?.username
                        ? {
                            background: 'var(--color-accent)',
                            color: 'var(--color-card)'
                          }
                        : {
                            background: 'var(--color-card)',
                            color: 'var(--color-text)',
                            borderColor: 'var(--color-muted)',
                            borderWidth: 1,
                            borderStyle: 'solid'
                          }
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs" style={{ color: 'var(--color-muted)' }}>
                        {msg.sender === user?.username ? 'You' : msg.sender}
                      </span>
                      <span className="text-[10px] ml-2" style={{ color: 'var(--color-muted)' }}>
                        {new Date(msg.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span>{msg.message}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input Bar */}
          <div className="p-3 border-t rounded-b-2xl flex gap-2" style={{ background: 'var(--color-card)', borderColor: 'var(--color-muted)' }}>
            <input
              type="text"
              className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--color-card)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-muted)'
              }}
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isAuthenticated}
            />
            <button
              className="px-4 py-2 rounded-lg font-bold transition disabled:opacity-60"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-card)'
              }}
              onClick={sendMessage}
              disabled={!input.trim() || !isAuthenticated}
            >
              Send
            </button>
          </div>
        </>
      )}
      <style jsx>{`
        @media (max-width: 600px) {
          .loqta-chat {
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            max-width: 100vw !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
} 