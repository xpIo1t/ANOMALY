"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Send,
  Shield,
  Cpu,
  Key,
  Lock,
  Loader,
  Twitter,
  Github,
  BookOpen,
  Copy,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  encryptionKey?: string;
  nodeId?: string;
}

const generatePseudoKey = () => {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

const generateNodeId = () => {
  return `node_${Math.random().toString(36).substr(2, 9)}`;
};

/* Updated ASCII logo for ANARCHY (separator removed) */
const AsciiLogo = () => (
  <motion.pre
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    className="ascii-logo text-[var(--graffiti-red)] text-[0.5rem] sm:text-[0.6rem] leading-tight mb-4 font-mono text-center"
  >
    {`
 ▄▄▄       ███▄    █  ▄▄▄       ██▀███   ▄████▄   ██░ ██▓██   ██▓
▒████▄     ██ ▀█   █ ▒████▄    ▓██ ▒ ██▒▒██▀ ▀█  ▓██░ ██▒▒██  ██▒
▒██  ▀█▄  ▓██  ▀█ ██▒▒██  ▀█▄  ▓██ ░▄█ ▒▒▓█    ▄ ▒██▀▀██░ ▒██ ██░
░██▄▄▄▄██ ▓██▒  ▐▌██▒░██▄▄▄▄██ ▒██▀▀█▄  ▒▓▓▄ ▄██▒░▓█ ░██  ░ ▐██▓░
 ▓█   ▓██▒▒██░   ▓██░ ▓█   ▓██▒░██▓ ▒██▒▒ ▓███▀ ░░▓█▒░██▓ ░ ██▒▓░
 ▒▒   ▓▒█░░ ▒░   ▒ ▒  ▒▒   ▓▒█░░ ▒▓ ░▒▓░░ ░▒ ▒  ░ ▒ ░░▒░▒  ██▒▒▒ 
  ▒   ▒▒ ░░ ░░   ░ ▒░  ▒   ▒▒ ░  ░▒ ░ ▒░  ░  ▒    ▒ ░▒░ ░▓██ ░▒░ 
  ░   ▒      ░   ░ ░   ░   ▒     ░░   ░ ░         ░  ░░ ░▒ ▒ ░░  
      ░  ░         ░       ░  ░   ░     ░ ░       ░  ░  ░░ ░     
                                        ░                ░ ░     
    `}
  </motion.pre>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [nodeId, setNodeId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State to hold the welcome message timestamp
  const [welcomeTimestamp, setWelcomeTimestamp] = useState('');

  useEffect(() => {
    setNodeId(generateNodeId());
    // Set the welcome timestamp only on the client after mount
    setWelcomeTimestamp(new Date().toISOString());
  }, []);

  const scrollToBottom = () => {
    if (isAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 50;
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
      autoScrollTimeoutRef.current = setTimeout(() => {
        setIsAutoScroll(isNearBottom);
      }, 100);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("CA COMING SOON");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      encryptionKey: generatePseudoKey(),
      nodeId: generateNodeId(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-4).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        sender: 'ai',
        timestamp: new Date(),
        encryptionKey: generatePseudoKey(),
        nodeId: generateNodeId(),
      };
      setMessages(prev => [...prev, aiMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) break;
        
        const chunk = decoder.decode(value);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunk
          };
          return [...prev.slice(0, -1), updatedMessage];
        });
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

  return (
    <div className="min-h-screen bg-[var(--graffiti-dark)] p-4 sm:p-6 lg:p-8 lights-animation">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <img src='logo-ban.png' className='mx-auto w-64'></img>
          <motion.div 
            className="flex items-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.3 }}
          >
            <Shield size={16} className="text-[var(--graffiti-red)] red-outline" />
            <span className="text-[var(--graffiti-red)] text-sm red-outline">
              ENCRYPTED_JAILBREAK
            </span>
            <Cpu size={16} className="text-[var(--graffiti-red)] red-outline" />
            <span className="text-[var(--graffiti-red)] text-sm red-outline">
              {nodeId || 'CONNECTING...'}
            </span>
          </motion.div>
        </header>

        {/* Socials Bar moved below the banner */}
        <div className="socials-footer mb-6">
          <div className="flex gap-4">
            <a
              href="https://x.com/ainarchy_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white transition-colors transform hover:scale-110 hover:text-[var(--graffiti-red)] duration-200"
            >
              <Twitter size={24} />
            </a>
            <a
              href="https://github.com/your_github"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white transition-colors transform hover:scale-110 hover:text-[var(--graffiti-red)] duration-200"
            >
              <Github size={24} />
            </a>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleCopy}
          >
            <span className="bg-[var(--graffiti-dark)] text-white px-2 py-1 rounded font-mono select-none">
              {copied ? "Copied!" : "CA COMING SOON"}
            </span>
            <Copy size={16} className="text-white" />
          </div>
        </div>

        {/* Chat container structured as a flex column */}
        <div className="chat-container rounded-lg neon-border min-h-[60vh] max-h-[60vh] flex flex-col overflow-hidden" ref={chatContainerRef} onScroll={handleScroll}>
          {/* Scrollable messages area */}
          <div className="chat-messages flex-grow overflow-y-auto p-4 pb-20">
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-black/80 border border-[var(--graffiti-red)] rounded p-3 my-1">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal size={16} className="text-[var(--graffiti-red)] red-outline" />
                  <span className="text-xs text-[var(--graffiti-red)] red-outline">ANARCHY</span>
                  <span className="text-xs text-gray-500">
                    {welcomeTimestamp || "Loading..."}
                  </span>
                </div>
                <p className="text-gray-100 mb-2 whitespace-pre-wrap">
                  Welcome to ANARCHY. Unleash your creativity. No filters. No limits. Ask anything. No logs. No questions.
                </p>
              </div>
            </div>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.sender === 'user'
                        ? 'bg-black/80 border border-[var(--graffiti-red)]'
                        : 'bg-black/80 border border-[var(--graffiti-red)]'
                    } rounded p-3 my-1`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'ai' ? (
                        <Terminal size={16} className="text-[var(--graffiti-red)] red-outline" />
                      ) : (
                        <Key size={16} className="text-[var(--graffiti-red)] red-outline" />
                      )}
                      <span className="text-xs text-[var(--graffiti-red)] red-outline">
                        {message.sender === 'user' ? 'ANONYMOUS' : 'ANARCHY'}
                      </span>
                      <span className="text-xs text-gray-500">      
                        {message.timestamp.toISOString()}
                      </span>
                    </div>
                    <p className="text-gray-100 mb-2 whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center gap-2 mt-1 opacity-50">
                      <Lock size={12} className="text-[var(--graffiti-red)] red-outline" />
                      <span className="text-xs text-[var(--graffiti-red)] font-mono red-outline">
                        {message.encryptionKey?.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-[var(--graffiti-red)]"
              >
                <Loader className="animate-spin" size={16} />
                <span className="text-sm font-mono">DECRYPTING_RESPONSE...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input form placed below messages */}
          <div className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="console-input rounded-lg"
                placeholder="TYPE YOUR MESSAGE HERE"
                disabled={isTyping}
                autoFocus
              />
              <button
                type="submit"
                className="console-button rounded-lg flex items-center gap-2 transition transform hover:scale-105 duration-200"
              >
                <Send size={18} />
                <span className="font-mono">TRANSMIT</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}