import { Layout as LayoutIcon, RefreshCw, Cpu, Database, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

const WorkspacesPage = () => {
    const [blueprint, setBlueprint] = useState<any>(null);
    const [auditData, setAuditData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [auditing, setAuditing] = useState(false);

    const fetchBlueprint = () => {
        fetch('http://localhost:3888/api/gita/blueprint')
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
            const res = await fetch('http://localhost:3888/api/gita/inspect', { method: 'POST' });
            const data = await res.json();
            setBlueprint(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAudit = async () => {
        setAuditing(true);
        try {
            const res = await fetch('http://localhost:3888/api/gita/audit', { method: 'POST' });
            const data = await res.json();
            console.log("Audit Data:", data);
            setAuditData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setAuditing(false);
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

                {/* Seção de Auditoria Elite */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                            Elite Security Audit
                        </h3>
                        <button 
                            onClick={handleAudit}
                            disabled={auditing}
                            className="text-xs font-bold text-secondary hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter"
                        >
                            {auditing ? 'Auditing...' : 'Run Audit'}
                        </button>
                    </div>

                    {auditData ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 glass border border-white/5 rounded-2xl flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Files Passed</span>
                                    <span className="text-green-400 font-bold">{auditData.summary.passed}</span>
                                </div>
                                <div className="p-4 glass border border-red-500/10 rounded-2xl flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Issues Found</span>
                                    <span className="text-red-400 font-bold">{auditData.summary.failed}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {auditData.results.map((res: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-xl border ${res.status === 'PASS' ? 'border-white/5 bg-white/2' : 'border-red-500/20 bg-red-500/5'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono text-gray-500">{res.file}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${res.status === 'PASS' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                                                {res.status || 'FAIL'}
                                            </span>
                                        </div>
                                        {res.issues?.map((issue: any, i: number) => (
                                            <div key={i} className="text-[11px] text-red-400 flex items-start gap-2">
                                                <span className="mt-1">●</span>
                                                <span>{issue.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 border border-white/5 rounded-3xl text-center">
                            <p className="text-xs text-gray-600">Nenhuma auditoria realizada recentemente.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkspacesPage;
