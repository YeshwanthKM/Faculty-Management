import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarRange, 
  CheckSquare, 
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

// Pages (to be implemented)
import Dashboard from './pages/Dashboard';
import Faculty from './pages/Faculty';
import ExamAllocations from './pages/ExamAllocations';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const location = useLocation();

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Faculty List', path: '/faculty', icon: <Users size={20} /> },
    { name: 'Schedule & Allocations', path: '/schedule-allocations', icon: <CalendarRange size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800/50 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Exam<span className="text-primary">Dashboard</span></span>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:text-primary transition-colors text-slate-400"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-[#0b1120] relative transition-colors duration-300">
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-8 sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800/50 rounded-lg"
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="flex items-center gap-4 border-l pl-6 border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Admin</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Management</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/schedule-allocations" element={<ExamAllocations />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
