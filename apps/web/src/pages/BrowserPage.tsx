import { Globe } from 'lucide-react';

const BrowserPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 glass">
      <Globe className="text-primary w-8 h-8" />
    </div>
    <h1 className="text-3xl font-bold mb-2">Browser Console</h1>
    <p className="text-gray-400 max-w-md">
      Interface de controle do motor @callm/browser (Playwright). Acompanhe a navegação da IA em tempo real.
    </p>
    <div className="mt-8 w-full max-w-3xl h-64 glass border border-white/10 rounded-2xl flex items-center justify-center text-gray-600 font-mono text-sm">
      [Browser Idle - Aguardando comando da IA]
    </div>
  </div>
);

export default BrowserPage;
