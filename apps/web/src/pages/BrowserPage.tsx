import { useState } from 'react';
import { Globe, RefreshCw, Square, Play, Camera, Code } from 'lucide-react';
import { motion } from 'framer-motion';

const BrowserPage = () => {
  const [url, setUrl] = useState('https://github.com/semezzato/callm-open-runway');
  const [status, setStatus] = useState('Idle');

  const handleNavigate = () => {
    setStatus('Navigating...');
    setTimeout(() => setStatus('Connected'), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 glass z-10 shrink-0">
        <div className="flex items-center gap-4 flex-1 max-w-2xl text-white">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              placeholder="https://..."
            />
          </div>
          <button onClick={handleNavigate} className="p-2 border border-white/10 rounded-xl hover:bg-white/5 text-gray-400">
            <RefreshCw size={18} className={status === 'Navigating...' ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
            status === 'Connected' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-white/10 text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Connected' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            {status}
          </span>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"><Play size={14} /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"><Square size={14} /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"><Camera size={14} /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"><Code size={14} /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex gap-6">
        {/* Virtual Browser Viewport */}
        <div className="flex-[3] relative rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl group bg-white/5">
          {status === 'Idle' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <Globe size={32} />
              </div>
              <p className="text-sm font-medium tracking-widest uppercase">Select a URL to start automation</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
               <div className="w-full h-full border border-white/5 rounded-2xl bg-black/40 flex items-center justify-center text-gray-600 animate-pulse">
                  Rendering Browser Stream...
               </div>
            </div>
          )}
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-gray-400 font-mono">1920x1080 @ 60fps</span>
          </div>
        </div>

        {/* DOM / Logs Sidebar */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 glass rounded-3xl border border-white/10 p-5 flex flex-col space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Action Log</h3>
            <div className="flex-1 overflow-y-auto space-y-3 text-[11px] font-mono">
              <div className="p-2 rounded bg-white/5 border border-white/5 text-blue-400">Initializing Playwright context...</div>
              {status === 'Navigating...' && <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">GET {url}</div>}
              {status === 'Connected' && <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Page Content Received</div>}
            </div>
          </div>
          <div className="h-48 glass rounded-3xl border border-white/10 p-5 flex flex-col space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Remote Console</h3>
            <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5 font-mono text-[10px] text-emerald-500/70 overflow-y-auto">
              {"> "} browser context initialized.
              {status === 'Connected' && <><br />{"> "} Page load completed safely.</>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowserPage;
