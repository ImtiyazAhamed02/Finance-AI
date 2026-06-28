import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RefreshCw, MessageSquare, User, Copy, ThumbsUp } from 'lucide-react';
import { aiApi } from '../api/client';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import { formatRelative } from '../lib/utils';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SUGGESTED_PROMPTS = [
  { text: 'How can I save more money?', icon: '💰' },
  { text: 'Analyze my spending habits', icon: '📊' },
  { text: 'How much should I invest monthly?', icon: '📈' },
  { text: 'What are good SIP options for me?', icon: '🏦' },
  { text: 'Help me build an emergency fund', icon: '🛡️' },
  { text: 'Can I afford a new laptop?', icon: '💻' },
];

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px' }}>
      {[0,1,2].map(i => (
        <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366F1' }} />
      ))}
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyContent = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', gap: 12, justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 20 }}
    >
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99,102,241,0.4)',
        }}>
          <Sparkles size={16} color="white" />
        </div>
      )}

      <div style={{ maxWidth: '90%' }}>
        <div className={isUser ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-ai'}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{msg.content}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelative(msg.created_at || new Date())}</span>
          {!isUser && (
            <button onClick={copyContent} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
          <User size={16} />
        </div>
      )}
    </motion.div>
  );
}

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m FinGenius AI, your personal financial advisor powered by Grok. I have access to your financial data and can provide personalized advice.\n\nAsk me anything about your finances — from budget planning to investment strategies tailored for India!',
      created_at: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);
  const { chatSessionId, newChatSession } = useAppStore();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, streamingContent]);

  const sendMessage = async (text = input.trim()) => {
    if (!text || isStreaming) return;
    setInput('');

    const userMsg = { role: 'user', content: text, created_at: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
          sessionId: chatSessionId,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent = parsed.fullContent || fullContent + parsed.content;
                setStreamingContent(fullContent);
              }
            } catch {}
          }
        }
      }

      const aiMsg = { role: 'assistant', content: fullContent, created_at: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setStreamingContent('');

      // Save AI response
      if (fullContent) {
        aiApi.saveAIMessage({ sessionId: chatSessionId, content: fullContent }).catch(() => {});
      }
    } catch (err) {
      toast.error('AI response failed. Check your Grok API key.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ I encountered an error. Please check your API configuration and try again.',
        created_at: new Date(),
      }]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleNewChat = () => {
    newChatSession();
    setMessages([{
      role: 'assistant',
      content: '👋 New conversation started! How can I help you with your finances today?',
      created_at: new Date(),
    }]);
    setStreamingContent('');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 20, marginBottom: 0, color: 'var(--text-primary)' }}>FinGenius AI Chat</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse-glow 2s infinite' }} />
              <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>Powered by Grok AI</p>
            </div>
          </div>
        </div>
        <button onClick={handleNewChat} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> New Chat
        </button>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div className="chat-bubble chat-bubble-ai" style={{ maxWidth: '90%' }}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{streamingContent}</div>
              <span style={{ display: 'inline-block', width: 2, height: 16, background: '#6366F1', marginLeft: 2, animation: 'pulse-glow 1s infinite', verticalAlign: 'middle' }} />
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingContent && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={16} color="white" />
            </div>
            <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center' }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div style={{ paddingTop: 12, flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Suggested questions:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => sendMessage(p.text)}
                style={{
                  padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
                whileHover={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', borderColor: 'var(--border-hover)' }}
              >
                <span>{p.icon}</span> {p.text}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ paddingTop: 12, flexShrink: 0 }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'var(--bg-surface)', border: '1px solid var(--border-hover)',
          borderRadius: 16, padding: '12px 16px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <MessageSquare size={18} color="var(--text-secondary)" style={{ flexShrink: 0, marginBottom: 4 }} />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your finances... (Enter to send)"
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter, sans-serif',
              resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
            }}
          />
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 38, height: 38, borderRadius: 10, border: 'none',
              background: input.trim() && !isStreaming ? 'var(--primary)' : 'var(--bg-card)',
              color: input.trim() && !isStreaming ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
              flexShrink: 0, transition: 'all 0.2s',
              boxShadow: input.trim() && !isStreaming ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Send size={16} />
          </motion.button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          AI responses are generated by Grok AI and may not always be accurate. Always consult a financial advisor for major decisions.
        </p>
      </div>
    </div>
  );
}
