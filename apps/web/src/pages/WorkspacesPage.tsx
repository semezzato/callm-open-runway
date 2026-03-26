import { Layout as LayoutIcon } from 'lucide-react';

const WorkspacesPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 glass">
      <LayoutIcon className="text-primary w-8 h-8" />
    </div>
    <h1 className="text-3xl font-bold mb-2">Workspace Intelligence</h1>
    <p className="text-gray-400 max-w-md">
      Gerencie seus projetos e contextos locais. Esta funcionalidade permitirá à IA ler seu repositório em tempo real.
    </p>
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      <div className="p-6 glass border border-white/10 rounded-2xl flex flex-col items-start gap-2">
        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Ativo</span>
        <h3 className="font-bold">semezzato/callm-open-runway</h3>
        <p className="text-xs text-gray-500">Node.js • Monorepo • Vitest</p>
      </div>
      <div className="p-6 border border-white/5 bg-white/2 rounded-2xl flex flex-col items-center justify-center border-dashed text-gray-600">
        <span className="text-sm">+ Adicionar Workspace</span>
      </div>
    </div>
  </div>
);

export default WorkspacesPage;
