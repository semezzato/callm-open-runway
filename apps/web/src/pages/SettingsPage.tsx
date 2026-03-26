import { Settings as SettingsIcon } from 'lucide-react';

const SettingsPage = () => (
  <div className="flex-1 p-10 max-w-4xl mx-auto w-full">
    <div className="flex items-center gap-4 mb-10">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 glass">
        <SettingsIcon className="text-primary w-6 h-6" />
      </div>
      <h1 className="text-3xl font-bold">Configurações</h1>
    </div>

    <div className="space-y-6">
      <section className="glass border border-white/10 p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">API Keys</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Google Gemini</label>
            <input type="password" value="************************" readOnly className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Anthropic Claude</label>
            <input type="password" placeholder="Insira seu token" className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm" />
          </div>
        </div>
      </section>

      <section className="glass border border-white/10 p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Design (Elite Mode)</h3>
        <div className="flex items-center justify-between">
          <span>Intensidade do Neon</span>
          <input type="range" className="w-32" />
        </div>
      </section>
    </div>
  </div>
);

export default SettingsPage;
