import { useState, useEffect } from 'react';
import { Play, FileJson, Clock, CheckCircle, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Playbook {
  id: string;
  name: string;
  description?: string;
  steps: any[];
}

const PlaybooksPage = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<{ step: string, status: 'pending' | 'running' | 'done' | 'error' }[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/playbooks')
      .then(res => res.json())
      .then(data => setPlaybooks(data))
      .catch(err => console.error('Erro ao carregar playbooks:', err));
  }, []);

  const handleRun = async (playbookId: string) => {
    setRunning(true);
    setSelectedPlaybook(playbooks.find(p => p.id === playbookId) || null);
    
    // Simulação de execução (O executor real está no Core)
    const mockSteps = [
      { step: 'Iniciando Playbook...', status: 'running' as const },
      { step: 'Executando Hygiene Skill...', status: 'pending' as const },
      { step: 'Consultando Security Agent...', status: 'pending' as const }
    ];
    setLogs(mockSteps);

    // TODO: Chamar endpoint real de execução quando implementado
    setTimeout(() => {
      setLogs(prev => prev.map((l, i) => i === 0 ? { ...l, status: 'done' } : i === 1 ? { ...l, status: 'running' } : l));
      setTimeout(() => {
         setLogs(prev => prev.map((l, i) => i === 1 ? { ...l, status: 'done' } : i === 2 ? { ...l, status: 'running' } : l));
         setTimeout(() => {
            setLogs(prev => prev.map((l, i) => i === 2 ? { ...l, status: 'done' } : l));
            setRunning(false);
         }, 1500);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="p-8 h-full overflow-y-auto space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Automation Playbooks</h1>
          <p className="text-gray-400">Execute receitas complexas orquestradas por Agentes e Skills.</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <Zap className="text-primary w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Disponíveis</h2>
          {playbooks.map(playbook => (
            <motion.div 
              key={playbook.id}
              whileHover={{ scale: 1.01 }}
              className="glass p-5 rounded-3xl border border-white/10 hover:border-primary/50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <FileJson className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{playbook.name}</h3>
                  <p className="text-xs text-gray-500">{playbook.id}</p>
                </div>
              </div>
              <button 
                onClick={() => handleRun(playbook.id)}
                disabled={running}
                className="p-3 bg-primary rounded-2xl text-black hover:opacity-90 disabled:opacity-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <Play size={18} fill="currentColor" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Execução em Tempo Real</h2>
          <div className="glass rounded-3xl border border-white/10 min-h-[400px] p-6 flex flex-col">
            {!selectedPlaybook ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4">
                <Clock size={48} className="opacity-20" />
                <p className="text-sm italic">Nenhum playbook em execução</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <h3 className="font-bold text-white">{selectedPlaybook.name}</h3>
                  {running && <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {logs.map((log, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${
                          log.status === 'running' ? 'border-primary/30 bg-primary/5' : 
                          log.status === 'done' ? 'border-emerald-500/20 bg-emerald-500/5' : 
                          'border-white/5 bg-white/5'
                        }`}
                      >
                        {log.status === 'running' ? <RefreshCw className="animate-spin text-primary" size={16} /> : 
                         log.status === 'done' ? <CheckCircle className="text-emerald-400" size={16} /> : 
                         log.status === 'error' ? <AlertCircle className="text-rose-400" size={16} /> : 
                         <div className="w-4 h-4 rounded-full border border-white/20" />}
                        
                        <span className={`text-sm ${log.status === 'done' ? 'text-gray-400' : 'text-white'}`}>
                          {log.step}
                        </span>
                        
                        {log.status === 'running' && <ChevronRight className="ml-auto text-primary animate-bounce-horizontal" size={16} />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {!running && logs.length > 0 && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-bold"
                  >
                    Playbook Concluído com Sucesso!
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RefreshCw = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default PlaybooksPage;
