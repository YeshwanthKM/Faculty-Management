import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Sun, Moon } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validUsers = {
      'login@123': '123',
      'admin@123': 'admin123',
      'hr@123': 'hr123'
    };

    if (validUsers[email] === password) {
      onLogin();
      navigate('/');
    } else {
      alert("Invalid Login ID or Password!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex items-center justify-center p-4 transition-colors duration-300 relative">
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-8 right-8 p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all shadow-lg border border-transparent dark:border-slate-700"
      >
        {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in duration-500 border border-transparent dark:border-slate-700/50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Faculty<span className="text-primary">Portal</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block text-left">Login ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="login@123"
                className="w-full bg-slate-50 dark:bg-slate-900/50 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block text-left">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-900/50 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-8 bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-600 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-fuchsia-500/30 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
