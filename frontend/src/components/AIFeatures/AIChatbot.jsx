import React, { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

const AIChatbot = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.firstName}! I am the Empora Chatbot. I can help you with HR policies, leave balance, attendance, and more. How can I assist you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ message: input.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.message.content,
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, I encountered an error: ${data.message || 'Unknown error'}. Please try again later.`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting to the server. Please try again later.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation cleared! How can I help you, ${user?.firstName}?`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-chatbot-container animate-fade-in">
      <header className="ai-chatbot-header">
        <div className="ai-chatbot-title">
          <div className="ai-chatbot-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h2>Empora Chatbot</h2>
            <p>Always here to help</p>
          </div>
        </div>
        <button onClick={handleClear} className="ai-chatbot-clear-btn">
          Clear Chat
        </button>
      </header>

      <div className="ai-chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`ai-chatbot-message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
            <div className={`ai-chatbot-message ${msg.role === 'user' ? 'user' : 'ai'}`}>
              {msg.content}
            </div>
            <span className="ai-chatbot-time">{formatTime(msg.timestamp)}</span>
          </div>
        ))}
        {isLoading && (
          <div className="ai-chatbot-loading">
            <div className="ai-chatbot-dot"></div>
            <div className="ai-chatbot-dot"></div>
            <div className="ai-chatbot-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chatbot-input-area">
        <form onSubmit={handleSend} className="ai-chatbot-input-form">
          <textarea
            ref={inputRef}
            className="ai-chatbot-textarea"
            placeholder="Type your message here... (Shift + Enter for new line)"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = (e.target.scrollHeight < 150 ? e.target.scrollHeight : 150) + 'px';
            }}
            onKeyDown={handleKeyDown}
            rows="1"
          />
          <button
            type="submit"
            className="ai-chatbot-send-btn"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
