import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Settings, Layout, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
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
    setInput('');
    setIsTyping(true);

    // Simulação de resposta (Em breve integrada ao LlmService via API)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Recebi sua mensagem: "${userMessage.content}". Estou pronto para acelerar seu projeto caLLM!` 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Zen Style */}
      <aside className="w-16 md:w-64 border-r border-white/10 flex flex-col items-center py-6 glass">
        <div className="flex items-center gap-3 px-4 mb-10">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg neon-border">
            <Terminal className="text-white w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">caLLM</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-4 w-full px-3">
          <NavItem icon={<Sparkles size={20} />} label="Modelos" active />
          <NavItem icon={<Layout size={20} />} label="Workspaces" />
          <NavItem icon={<Search size={20} />} label="Higiene" />
        </nav>

        <div className="mt-auto px-3 w-full">
          <NavItem icon={<Settings size={20} />} label="Ajustes" />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.1)_0%,_transparent_50%)]">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 glass z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg">Gemini Pro</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest font-bold">Local</span>
          </div>
        </header>

        {/* Scrollable Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white shadow-xl neon-border' 
                    : 'glass text-gray-200'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </motion.div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Digite sua próxima jogada mestre..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-14 min-h-[56px] glass placeholder:text-gray-500"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 bottom-3 p-2 premium-gradient text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-[0.2em]">
            Keep caLLM and Runway — Anti-Vibecoding Engine
          </p>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: any) => (
  <button className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
    active ? 'bg-primary/20 text-primary border border-primary/30 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'
  }`}>
    {icon}
    <span className="hidden md:block font-medium text-sm">{label}</span>
  </button>
);

export default App;
