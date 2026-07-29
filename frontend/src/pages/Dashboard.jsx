import React, { useEffect, useState } from 'react';
import { scanService } from '../services/api';
import {
  TrendingUp,
  Activity,
  Calendar,
  CalendarDays,
  Leaf,
  Smile,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vitality: 94.8,
    weeklyTotal: 250,
    weeklyCR: 120,
    weeklyGR: 24,
    weeklyHT: 24,
    monthlyTotal: 1250,
    monthlyCR: 150,
    monthlyGR: 150,
    monthlyHT: 150,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const historyData = await scanService.getHistory();
        setHistory(historyData);
        
        // Calculate dynamically if history database has entries
        if (historyData && historyData.length > 0) {
          const healthyCount = historyData.filter(s => s.diseaseName === 'Healthy').length;
          const total = historyData.length;
          const dynamicVitality = total > 0 ? ((healthyCount / total) * 100).toFixed(1) : 94.8;
          
          setStats(prev => ({
            ...prev,
            vitality: parseFloat(dynamicVitality) > 0 ? parseFloat(dynamicVitality) : 94.8,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard scan history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Disease Trend Analysis (7-day pathogen detection frequency data matching screenshot line series)
  const trendData = [
    { name: 'MON', commonRust: 28, grayLeaf: 12 },
    { name: 'TUE', commonRust: 45, grayLeaf: 22 },
    { name: 'WED', commonRust: 35, grayLeaf: 15 },
    { name: 'THU', commonRust: 68, grayLeaf: 28 },
    { name: 'FRI', commonRust: 60, grayLeaf: 31 },
    { name: 'SAT', commonRust: 84, grayLeaf: 26 },
    { name: 'SUN', commonRust: 75, grayLeaf: 34 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      
      {/* Title Header with styled border box */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative inline-block px-8 py-3.5 glass-panel rounded-2xl border-emerald-500/20">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-lg"></div>
          <h1 className="text-xl font-bold text-white tracking-wide uppercase">Field Overview</h1>
        </div>
        
        <div className="text-xs text-slate-400 font-medium">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Top Row: 3 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Card 1: Crop Vitality Score */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crop Vitality Score</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              +4.2% <TrendingUp className="w-3 h-3" />
            </span>
          </div>
          
          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-[#84CC16]">{stats.vitality}%</h2>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                <span>Optimal Growth Range</span>
                <span className="text-emerald-400">Healthy</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-950/40 border border-emerald-950/80 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#84CC16] rounded-full transition-all duration-1000"
                  style={{ width: `${stats.vitality}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Weekly Total Scans */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Total Scans</span>
          </div>
          
          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-blue-400">{stats.weeklyTotal}</h2>
            <div className="flex gap-4 mt-4 text-[11px] font-bold text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                CR <span className="text-blue-400 ml-1">{stats.weeklyCR}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                GR <span className="text-blue-400 ml-1">{stats.weeklyGR}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                HT <span className="text-blue-400 ml-1">{stats.weeklyHT}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Total Scans */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#84CC16]/10 border border-[#84CC16]/20 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-[#84CC16]" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Total Scans</span>
          </div>
          
          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-[#84CC16]">{stats.monthlyTotal}</h2>
            <div className="flex gap-4 mt-4 text-[11px] font-bold text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                CR <span className="text-[#84CC16] ml-1">{stats.monthlyCR}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                GR <span className="text-[#84CC16] ml-1">{stats.monthlyGR}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                HT <span className="text-[#84CC16] ml-1">{stats.monthlyHT}</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Disease Trend Analysis & Safe Zone Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left Side: Disease Trend Analysis Chart */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide">Disease Trend Analysis</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">7-day pathogen detection frequency</p>
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16]"></span>
                <span className="text-slate-300">Common Rust</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-slate-300">Gray Leaf Spot</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111E15', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#FFF' 
                  }} 
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="commonRust" 
                  stroke="#84CC16" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 0, fill: '#84CC16' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="grayLeaf" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 0, fill: '#059669' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Safe Zone / Corn character card */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
          
          <div>
            <h3 className="text-sm font-extrabold text-[#84CC16] tracking-wider uppercase mb-1">Your Farm is Safe zone</h3>
            <div className="flex justify-center mt-3">
              {/* Smiling Face Emoji */}
              <div className="w-16 h-16 rounded-full bg-[#84CC16]/10 border border-[#84CC16]/20 flex items-center justify-center">
                <Smile className="w-10 h-10 text-[#84CC16]" />
              </div>
            </div>
          </div>

          {/* Cartoon Corn character holding hands up (SVG) */}
          <div className="w-36 h-36 mt-4 relative z-10 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Corn body */}
              <rect x="38" y="25" width="24" height="45" rx="12" fill="#FCD34D" />
              {/* Kernel detail patterns */}
              <circle cx="44" cy="32" r="1.5" fill="#F59E0B" />
              <circle cx="50" cy="32" r="1.5" fill="#F59E0B" />
              <circle cx="56" cy="32" r="1.5" fill="#F59E0B" />
              <circle cx="44" cy="40" r="1.5" fill="#F59E0B" />
              <circle cx="50" cy="40" r="1.5" fill="#F59E0B" />
              <circle cx="56" cy="40" r="1.5" fill="#F59E0B" />
              <circle cx="44" cy="48" r="1.5" fill="#F59E0B" />
              <circle cx="50" cy="48" r="1.5" fill="#F59E0B" />
              <circle cx="56" cy="48" r="1.5" fill="#F59E0B" />
              <circle cx="44" cy="56" r="1.5" fill="#F59E0B" />
              <circle cx="50" cy="56" r="1.5" fill="#F59E0B" />
              <circle cx="56" cy="56" r="1.5" fill="#F59E0B" />

              {/* Husks */}
              <path d="M35 70C30 50 35 35 44 28C38 38 34 54 38 70H35Z" fill="#10B981" />
              <path d="M65 70C70 50 65 35 56 28C62 38 66 54 62 70H65Z" fill="#10B981" />
              <path d="M50 72C40 65 32 50 35 35C45 45 48 60 50 72Z" fill="#047857" opacity="0.8" />
              <path d="M50 72C60 65 68 50 65 35C55 45 52 60 50 72Z" fill="#047857" opacity="0.8" />

              {/* Large Eyes */}
              <circle cx="45" cy="40" r="3.5" fill="white" />
              <circle cx="45" cy="40" r="1.5" fill="black" />
              <circle cx="55" cy="40" r="3.5" fill="white" />
              <circle cx="55" cy="40" r="1.5" fill="black" />

              {/* Big Smile */}
              <path d="M43 47C43 51 57 51 57 47H43Z" fill="#BE123C" />
              <path d="M47 47C47 49 53 49 53 47H47Z" fill="white" /> {/* Teeth */}
              
              {/* Hands raised up */}
              <path d="M34 50C25 45 22 38 24 35C26 32 30 40 36 46" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M66 50C75 45 78 38 76 35C74 32 70 40 64 46" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Legs */}
              <line x1="45" y1="70" x2="45" y2="82" stroke="#047857" strokeWidth="3" />
              <line x1="55" y1="70" x2="55" y2="82" stroke="#047857" strokeWidth="3" />
            </svg>
          </div>

        </div>

      </div>

      {/* Bottom Panel: Premium Insight */}
      <div className="glass-panel rounded-3xl p-6 border-emerald-500/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#84CC16] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#84CC16] fill-[#84CC16]/10 animate-pulse" />
              <span>Premium Insight</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">Optimized Harvest Prediction</h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Based on current satellite data and weather patterns, we recommend moving the Harvest Date for Field #4 to Sept 12th for a 15% yield increase.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#a3e635] text-[#0E1611] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98]">
              Update Schedule
            </button>
            <button className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl border border-slate-500 hover:border-slate-300 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]">
              Next Analyze
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
