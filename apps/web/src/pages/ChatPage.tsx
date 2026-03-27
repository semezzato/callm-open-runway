import { Send, Columns, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPane = ({ 
    agentId, 
    agents, 
    messages, 
    isTyping, 
    onSelectAgent 
}: any) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const currentAgent = agents.find((a: any) => a.id === agentId) || { name: 'Gemini Pro', role: 'Local Engine' };

    return (
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 last:border-r-0 h-full">
            <header className="h-12 border-b border-white/10 flex items-center justify-between px-4 glass shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    <h3 className="font-medium text-sm text-white truncate">{currentAgent.name}</h3>
                </div>
                <select 
                    value={agentId} 
                    onChange={(e) => onSelectAgent(e.target.value)}
                    className="bg-transparent text-[10px] text-gray-400 outline-none border border-white/10 rounded px-1"
                >
                    {agents.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-black/20">
                <AnimatePresence>
                    {messages.map((msg: any, idx: number) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[90%] p-3 rounded-xl text-sm ${
                                msg.role === 'user' 
                                    ? 'bg-primary/80 text-white shadow-lg' 
                                    : 'glass text-gray-200 border border-white/5'
                            }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isTyping && (
                    <div className="flex gap-1 p-1">
                        <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                )}
            </div>
        </div>
    );
};

import { useState, useEffect, useRef } from 'react';

const ChatPage = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [isSplitView, setIsSplitView] = useState(false);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  
  // Pane 1 State
  const [messages1, setMessages1] = useState<any[]>([]);
  const [agent1, setAgent1] = useState('gemini');
  const [isTyping1, setIsTyping1] = useState(false);

  // Pane 2 State
  const [messages2, setMessages2] = useState<any[]>([]);
  const [agent2, setAgent2] = useState('gemini');
  const [isTyping2, setIsTyping2] = useState(false);

  const [input, setInput] = useState('');

  useEffect(() => {
    // Carrega Agentes e Modelos Locais
    Promise.all([
        fetch('http://localhost:3001/api/agents').then(res => res.json()),
        fetch('http://localhost:3001/api/models/local').then(res => res.json())
    ]).then(([agentData, localModels]) => {
        setAgents([...agentData, ...localModels]);
    }).catch(err => console.error('Erro ao carregar dados:', err));

    // Carrega histórico se houver
    fetch(`http://localhost:3001/api/sessions/${sessionId}/messages`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) setMessages1(data);
            else setMessages1([{ role: 'model', content: 'Inicie sua trilha de desenvolvimento aqui.' }]);
        });
  }, [sessionId]);

  const handleSelectModel = async (modelId: string, pane: number) => {
    if (pane === 1) setAgent1(modelId);
    else setAgent2(modelId);

    // Salva o modelo para a sessão no backend
    await fetch(`http://localhost:3001/api/sessions/${sessionId}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId })
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');

    // Se estiver em Split View, envia para ambos (Orquestração Básica)
    // Se não, envia apenas para o Pane 1
    const sendToAgent = async (prompt: string, agentId: string, setMessages: any, setIsTyping: any) => {
        setMessages((prev: any) => [...prev, { role: 'user', content: prompt }]);
        setIsTyping(true);
        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, agentId, sessionId })
            });
            const data = await response.json();
            setMessages((prev: any) => [...prev, { role: 'model', content: data.content }]);
        } catch (e) {
            setMessages((prev: any) => [...prev, { role: 'model', content: 'Erro de conexão.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (isSplitView) {
        sendToAgent(currentInput, agent1, setMessages1, setIsTyping1);
        sendToAgent(currentInput, agent2, setMessages2, setIsTyping2);
    } else {
        sendToAgent(currentInput, agent1, setMessages1, setIsTyping1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 glass z-20 shrink-0">
        <div className="flex items-center gap-4">
            <h2 className="text-white font-bold tracking-tight">Aurora Dashboard</h2>
            <button 
                onClick={() => setIsSplitView(!isSplitView)}
                className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                title={isSplitView ? "Voltar para View Única" : "Habilitar Split View"}
            >
                {isSplitView ? <Square size={16} /> : <Columns size={16} />}
            </button>
        </div>
        <div className="text-[10px] text-gray-500 font-mono">STATUS: STABLE_V1</div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <ChatPane 
            agentId={agent1} 
            agents={agents} 
            messages={messages1} 
            setMessages={setMessages1} 
            isTyping={isTyping1} 
            onSelectAgent={(id: string) => handleSelectModel(id, 1)}
        />
        {isSplitView && (
            <ChatPane 
                agentId={agent2} 
                agents={agents} 
                messages={messages2} 
                setMessages={setMessages2} 
                isTyping={isTyping2} 
                onSelectAgent={(id: string) => handleSelectModel(id, 2)}
            />
        )}
      </main>

      <footer className="p-6 bg-gradient-to-t from-background via-background/90 to-transparent shrink-0">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isSplitView ? "Comando para os Agentes..." : "Fale com o caLLM..."}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-16 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none h-14 glass text-white text-sm"
          />
          <button 
            onClick={handleSend}
            className="absolute right-3 bottom-3 p-2 premium-gradient text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
