import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, Settings, Layout, Search, Sparkles } from 'lucide-react';
import Aurora from '../components/Aurora';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Sparkles size={20} />, label: "Chat", path: "/" },
    { icon: <Layout size={20} />, label: "Workspaces", path: "/workspaces" },
    { icon: <Search size={20} />, label: "Browser", path: "/browser" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      <Aurora 
        colorStops={["#000814", "#001d3d", "#003566"]} 
        speed={0.3} 
        amplitude={1.2} 
      />

      <aside className="w-16 md:w-64 border-r border-white/10 flex flex-col items-center py-6 glass z-20">
        <div className="flex items-center gap-3 px-4 mb-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg neon-border">
            <Terminal className="text-white w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight text-white">caLLM</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-4 w-full px-3">
          {navItems.map((item) => (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full group ${
                location.pathname === item.path 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`${location.pathname === item.path ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                {item.icon}
              </span>
              <span className="hidden md:block font-bold text-[10px] uppercase tracking-[0.2em]">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto px-3 w-full">
           <p className="text-center text-[8px] text-gray-700 uppercase tracking-widest font-bold opacity-50">
            Open Runway v1.0
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-20">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
