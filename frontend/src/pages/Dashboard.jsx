import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { allocationApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await allocationApi.getInsights();
      setInsights(response.data);
    } catch (error) {
      console.error("Error fetching insights:", error);
    }
  };

  const chartData = insights ? Object.entries(insights.dept_workload).map(([name, duties]) => ({
    name, duties
  })) : [];

  const stats = [
    { title: 'Total Faculty', value: insights?.total_faculty || '0', icon: <Users />, color: 'bg-blue-500 shadow-blue-500/20' },
    { title: 'Exams Generated', value: insights?.total_exams || '0', icon: <Calendar />, color: 'bg-indigo-500 shadow-indigo-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Overview of your faculty and exam scheduling.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/schedule-allocations')}
            className="bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 border-none"
          >
            <CheckCircle2 size={18} />
            Generate Allocations
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        {stats.map((stat, i) => (
          <div key={i} className="card flex items-center gap-5">
            <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="card space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            About the Project
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            The <strong>Unified Exam Allocation Dashboard</strong> is an advanced administrative tool designed to streamline the complex process of scheduling examinations and assigning invigilators. 
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Automated Allocation:</strong> Intelligently matches available faculty to exam halls based on capacity and session timing.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Real-time Substitute Tracking:</strong> Dynamically identifies standby faculty for every session to ensure 100% coverage.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Professional Reporting:</strong> Generates master time tables in high-quality PDF format for institutional distribution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
