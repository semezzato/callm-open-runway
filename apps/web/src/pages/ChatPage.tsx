import { useState, useEffect, useRef } from 'react';
import { Send, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SplitText from '../components/SplitText';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Olá! Como posso ajudar na sua passarela de desenvolvimento hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: data.content 
      }]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Ops! O servidor API parece estar offline. Tente rodar "callm server" no seu terminal!' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 glass z-10">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Gemini Pro
          </h2>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-bold">Local Engine</span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 1 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 premium-gradient rounded-3xl flex items-center justify-center shadow-2xl mb-6 neon-border"
            >
              <Terminal className="text-white w-10 h-10" />
            </motion.div>
            <SplitText 
              text="Welcome to the Runway" 
              className="text-4xl md:text-5xl font-black tracking-tighter text-white" 
            />
            <p className="text-gray-400 max-w-sm text-sm uppercase tracking-widest font-light">
              Secure, Logic-First AI Orchestration
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.length > 1 && messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary/90 text-white shadow-xl neon-border backdrop-blur-md' 
                  : 'glass text-gray-200 border border-white/5'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 p-2">
            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
          </motion.div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Deploy your master logic here..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-5 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-16 min-h-[64px] glass placeholder:text-gray-600 text-lg shadow-2xl text-white"
          />
          <button 
            onClick={handleSend}
            className="absolute right-4 bottom-4 p-2.5 premium-gradient text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
