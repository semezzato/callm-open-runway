import { Settings as SettingsIcon, Download, Search, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const SettingsPage = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [localModels, setLocalModels] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/models/local')
        .then(res => res.json())
        .then(setLocalModels);
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:3001/api/models/hf/search?q=${search}`);
        const data = await res.json();
        setResults(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleInstall = async (repoId: string, filename: string) => {
    setDownloading(filename);
    try {
        await fetch('http://localhost:3001/api/models/hf/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repoId, filename })
        });
        // Atualiza lista local
        const res = await fetch('http://localhost:3001/api/models/local');
        const data = await res.json();
        setLocalModels(data);
    } catch (e) {
        console.error(e);
    } finally {
        setDownloading(null);
    }
  };

  return (
    <div className="flex-1 p-10 max-w-4xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 glass">
          <SettingsIcon className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <div className="space-y-6">
        {/* API Keys */}
        <section className="glass border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">API Keys</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Google Gemini</label>
              <input type="password" value="************************" readOnly className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm" />
            </div>
          </div>
        </section>

        {/* Model Library (HF) */}
        <section className="glass border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Model Library (Hugging Face)</h3>
          
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search Hugging Face (ex: Qwen, Llama)..." 
                    className="w-full bg-white/5 border border-white/10 p-2 pl-10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <button 
                onClick={handleSearch}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/40 border border-primary/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="space-y-3">
            {results.map((model: any) => (
                <div key={model.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/5 rounded-xl">
                    <div className="overflow-hidden mr-4">
                        <p className="text-sm font-medium truncate">{model.id}</p>
                        <p className="text-[10px] text-gray-400">{model.downloads.toLocaleString()} downloads</p>
                    </div>
                    {localModels.some(m => m.id.includes(model.id.split('/')[1])) ? (
                        <CheckCircle className="text-success w-5 h-5" />
                    ) : (
                        <button 
                            onClick={() => handleInstall(model.id, `${model.id.split('/')[1]}.gguf`)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] transition-all"
                            disabled={downloading === `${model.id.split('/')[1]}.gguf`}
                        >
                            {downloading === `${model.id.split('/')[1]}.gguf` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Download className="w-3 h-3" />
                            )}
                            Install GGUF
                        </button>
                    )}
                </div>
            ))}
          </div>
        </section>

        {/* Local Inventory */}
        <section className="glass border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Local Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            {localModels.map(m => (
                <div key={m.id} className="p-3 border border-white/10 rounded-xl bg-white/5 text-xs">
                    <p className="font-mono truncate">{m.name}</p>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{m.type}</p>
                </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
