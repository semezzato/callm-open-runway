import { Layout as LayoutIcon, RefreshCw, Cpu, Database, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

const WorkspacesPage = () => {
    const [blueprint, setBlueprint] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchBlueprint = () => {
        fetch('http://localhost:3001/api/gita/blueprint')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setBlueprint(data);
            });
    };

    useEffect(() => {
        fetchBlueprint();
    }, []);

    const handleInspect = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/gita/inspect', { method: 'POST' });
            const data = await res.json();
            setBlueprint(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-10 overflow-y-auto h-full scrollbar-hide">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 glass shadow-neon">
                <LayoutIcon className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Workspace Intelligence</h1>
            <p className="text-gray-400 max-w-md text-center">
                Analise e estude seu repositório local com a inteligência profunda do caLLM.
            </p>

            <div className="mt-10 w-full max-w-4xl space-y-6">
                {/* Status Principal */}
                <div className="p-8 glass border border-white/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 rounded border border-primary/20">Ativo</span>
                        <h2 className="text-2xl font-bold">{blueprint?.project || 'Selecione um Projeto'}</h2>
                        <div className="flex items-center gap-4 text-xs text-gray-500 justify-center md:justify-start">
                            <span className="flex items-center gap-1"><Globe size={12} /> {blueprint?.stack?.frontend || '---'}</span>
                            <span className="flex items-center gap-1"><Cpu size={12} /> {blueprint?.stack?.backend || '---'}</span>
                            <span className="flex items-center gap-1"><Database size={12} /> {blueprint?.database || '---'}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleInspect}
                        className="flex items-center gap-2 px-6 py-3 premium-gradient rounded-xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Inspecionando...' : 'Gita Inspect'}
                    </button>
                </div>

                {/* Grid de Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 glass border border-white/5 rounded-2xl">
                        <label className="text-[9px] text-gray-400 uppercase font-bold mb-2 block">Framework</label>
                        <p className="text-lg font-medium">{blueprint?.stack?.framework || 'Não detectado'}</p>
                    </div>
                    <div className="p-6 glass border border-white/5 rounded-2xl">
                        <label className="text-[9px] text-gray-400 uppercase font-bold mb-2 block">Database Engine</label>
                        <p className="text-lg font-medium">{blueprint?.database || 'Não detectado'}</p>
                    </div>
                    <div className="p-6 glass border border-white/5 rounded-2xl">
                        <label className="text-[9px] text-gray-400 uppercase font-bold mb-2 block">Último Check-up</label>
                        <p className="text-xs text-gray-400 mt-1">
                            {blueprint?.detectedAt ? new Date(blueprint.detectedAt).toLocaleString('pt-BR') : 'Sem registros'}
                        </p>
                    </div>
                </div>

                {/* Seção .callm Directory */}
                <div className="p-6 border border-white/5 bg-white/2 rounded-2xl border-dashed text-center">
                    <p className="text-sm text-gray-500">
                        O diretório <code className="text-primary font-bold">/.callm</code> foi populado com metadados do projeto para guiar a IA.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WorkspacesPage;
