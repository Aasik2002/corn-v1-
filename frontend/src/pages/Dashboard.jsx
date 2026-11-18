import React, { useEffect, useState, useCallback } from 'react';
import { scanService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  CalendarDays,
  Leaf,
  Smile,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Download,
  Mail,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
  Send,
  Loader2,
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

const normalizeDisease = (name) => {
  if (!name) return 'Unknown';
  const clean = name.toString().trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (clean.includes('rust')) return 'Common_Rust';
  if (clean.includes('gray') || clean.includes('grey') || clean.includes('leafspot')) return 'Gray_Leaf';
  if (clean.includes('health')) return 'Healthy';
  if (clean.includes('notcorn') || clean.includes('noncorn')) return 'Not_Corn';
  return name;
};

const calculateStatsFromHistory = (historyData) => {
  const scans = historyData || [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Vitality calculation (healthy scans ratio among corn leaves)
  const healthyCount = scans.filter((s) => normalizeDisease(s.diseaseName) === 'Healthy').length;
  const cornScans = scans.filter((s) => normalizeDisease(s.diseaseName) !== 'Not_Corn');
  const vitality =
    cornScans.length > 0
      ? parseFloat(((healthyCount / cornScans.length) * 100).toFixed(1))
      : scans.length === 0
      ? 100.0
      : 0.0;

  // Weekly counts (rolling 7 days)
  const weeklyScans = scans.filter(
    (s) => new Date(s.createdAt || s.updatedAt || Date.now()) >= sevenDaysAgo
  );
  const weeklyTotal = weeklyScans.length;
  const weeklyCR = weeklyScans.filter((s) => normalizeDisease(s.diseaseName) === 'Common_Rust').length;
  const weeklyGR = weeklyScans.filter((s) => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length;
  const weeklyHT = weeklyScans.filter((s) => normalizeDisease(s.diseaseName) === 'Healthy').length;

  // Monthly counts (rolling 30 days)
  const monthlyScans = scans.filter(
    (s) => new Date(s.createdAt || s.updatedAt || Date.now()) >= thirtyDaysAgo
  );
  const monthlyTotal = monthlyScans.length;
  const monthlyCR = monthlyScans.filter((s) => normalizeDisease(s.diseaseName) === 'Common_Rust').length;
  const monthlyGR = monthlyScans.filter((s) => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length;
  const monthlyHT = monthlyScans.filter((s) => normalizeDisease(s.diseaseName) === 'Healthy').length;

  // 1. Weekly view: Monday through Sunday of current week
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const monday = new Date(now);
  const currentDay = monday.getDay();
  const distanceToMonday = (currentDay + 6) % 7;
  monday.setDate(monday.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const trendWeekly = daysOfWeek.map((dayName, index) => {
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + index);

    const dayScans = scans.filter((s) => {
      const d = new Date(s.createdAt || s.updatedAt || Date.now());
      return (
        d.getFullYear() === targetDate.getFullYear() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getDate() === targetDate.getDate()
      );
    });

    return {
      name: dayName,
      commonRust: dayScans.filter((s) => normalizeDisease(s.diseaseName) === 'Common_Rust').length,
      grayLeaf: dayScans.filter((s) => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length,
      total: dayScans.length,
      dateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  // 2. Rolling 7 days view: 6 days ago -> Today
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const trendRolling7 = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    targetDate.setHours(0, 0, 0, 0);

    const dayScans = scans.filter((s) => {
      const d = new Date(s.createdAt || s.updatedAt || Date.now());
      return (
        d.getFullYear() === targetDate.getFullYear() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getDate() === targetDate.getDate()
      );
    });

    const dayName = i === 0 ? 'TODAY' : dayNames[targetDate.getDay()];
    trendRolling7.push({
      name: dayName,
      commonRust: dayScans.filter((s) => normalizeDisease(s.diseaseName) === 'Common_Rust').length,
      grayLeaf: dayScans.filter((s) => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length,
      total: dayScans.length,
      dateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  return {
    vitality,
    totalScans: scans.length,
    weekly: { total: weeklyTotal, cr: weeklyCR, gr: weeklyGR, ht: weeklyHT },
    monthly: { total: monthlyTotal, cr: monthlyCR, gr: monthlyGR, ht: monthlyHT },
    trendWeekly,
    trendRolling7,
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendMode, setTrendMode] = useState('weekly'); // 'weekly' (MON-SUN) or 'rolling7' (Last 7 Days)

  // Report Generation & Email State
  const [downloadingPeriod, setDownloadingPeriod] = useState(null); // 'weekly' | 'monthly' | null
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [reportFeedback, setReportFeedback] = useState(null); // { type: 'success' | 'error', message, previewUrl }

  const [stats, setStats] = useState({
    vitality: 100,
    weeklyTotal: 0,
    weeklyCR: 0,
    weeklyGR: 0,
    weeklyHT: 0,
    monthlyTotal: 0,
    monthlyCR: 0,
    monthlyGR: 0,
    monthlyHT: 0,
  });

  const [weeklyTrend, setWeeklyTrend] = useState([
    { name: 'MON', commonRust: 0, grayLeaf: 0 },
    { name: 'TUE', commonRust: 0, grayLeaf: 0 },
    { name: 'WED', commonRust: 0, grayLeaf: 0 },
    { name: 'THU', commonRust: 0, grayLeaf: 0 },
    { name: 'FRI', commonRust: 0, grayLeaf: 0 },
    { name: 'SAT', commonRust: 0, grayLeaf: 0 },
    { name: 'SUN', commonRust: 0, grayLeaf: 0 },
  ]);

  const [rollingTrend, setRollingTrend] = useState([]);

  // Pre-fill recipient email when user context loads
  useEffect(() => {
    if (user?.email && !recipientEmail) {
      setRecipientEmail(user.email);
    }
  }, [user, recipientEmail]);

  const fetchStats = useCallback(async () => {
    setRefreshing(true);
    try {
      let statsResult = null;
      try {
        statsResult = await scanService.getStats();
      } catch (err) {
        console.warn('Backend /scan/stats endpoint unavailable, falling back to history calculation:', err.message);
      }

      if (statsResult && statsResult.weekly) {
        setStats({
          vitality: statsResult.vitality,
          weeklyTotal: statsResult.weekly.total,
          weeklyCR: statsResult.weekly.cr,
          weeklyGR: statsResult.weekly.gr,
          weeklyHT: statsResult.weekly.ht,
          monthlyTotal: statsResult.monthly.total,
          monthlyCR: statsResult.monthly.cr,
          monthlyGR: statsResult.monthly.gr,
          monthlyHT: statsResult.monthly.ht,
        });
        if (statsResult.trendWeekly && statsResult.trendWeekly.length > 0) {
          setWeeklyTrend(statsResult.trendWeekly);
        }
        if (statsResult.trendRolling7 && statsResult.trendRolling7.length > 0) {
          setRollingTrend(statsResult.trendRolling7);
        }
      } else {
        const historyData = await scanService.getHistory();
        const computed = calculateStatsFromHistory(historyData);
        setStats({
          vitality: computed.vitality,
          weeklyTotal: computed.weekly.total,
          weeklyCR: computed.weekly.cr,
          weeklyGR: computed.weekly.gr,
          weeklyHT: computed.weekly.ht,
          monthlyTotal: computed.monthly.total,
          monthlyCR: computed.monthly.cr,
          monthlyGR: computed.monthly.gr,
          monthlyHT: computed.monthly.ht,
        });
        setWeeklyTrend(computed.trendWeekly);
        setRollingTrend(computed.trendRolling7);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle direct PDF Download
  const handleDownloadReport = async (period) => {
    try {
      setDownloadingPeriod(period);
      setReportFeedback(null);
      await scanService.downloadReport(period);
    } catch (err) {
      console.error('Failed to download report:', err);
      alert('Could not download PDF report. Please verify backend server status.');
    } finally {
      setDownloadingPeriod(null);
    }
  };

  // Open the Email Report modal
  const openEmailModal = (period = 'weekly') => {
    setSelectedPeriod(period);
    setRecipientEmail(user?.email || '');
    setReportFeedback(null);
    setEmailModalOpen(true);
  };

  // Submit Report Email Dispatch
  const handleSendEmailReport = async (e) => {
    if (e) e.preventDefault();
    if (!recipientEmail) return;

    setSendingEmail(true);
    setReportFeedback(null);

    try {
      const response = await scanService.emailReport(selectedPeriod, recipientEmail);
      setReportFeedback({
        type: 'success',
        message: response.message || `Diagnostic report successfully emailed to ${recipientEmail}!`,
        previewUrl: response.previewUrl || null,
      });
    } catch (err) {
      console.error('Failed to send report email:', err);
      setReportFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to dispatch report email. Please check server SMTP settings.',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Selected trend data
  const activeTrendData = trendMode === 'weekly' ? weeklyTrend : rollingTrend;

  // Determine dynamic scale for Y-axis
  const maxPathogenCount = Math.max(
    ...activeTrendData.map((d) => Math.max(d.commonRust || 0, d.grayLeaf || 0)),
    0
  );
  const yAxisMax =
    maxPathogenCount === 0
      ? 5
      : maxPathogenCount <= 5
      ? 5
      : maxPathogenCount <= 10
      ? 10
      : maxPathogenCount <= 25
      ? 25
      : Math.ceil(maxPathogenCount * 1.25);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      {/* Title Header with styled border box & quick actions */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="relative inline-block px-8 py-3.5 glass-panel rounded-2xl border-emerald-500/20">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-lg"></div>
          <h1 className="text-xl font-bold text-white tracking-wide uppercase">Field Overview</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs text-slate-400 font-medium">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          {/* Quick PDF & Email Report Dispatch Button */}
          <button
            onClick={() => openEmailModal('weekly')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate PDF Report</span>
          </button>

          <button
            onClick={fetchStats}
            disabled={refreshing}
            title="Refresh statistics"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
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
            {stats.vitality >= 70 ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                Optimal <TrendingUp className="w-3 h-3" />
              </span>
            ) : stats.vitality >= 40 ? (
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-0.5">
                Warning <TrendingDown className="w-3 h-3" />
              </span>
            ) : (
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-0.5">
                Critical <TrendingDown className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-[#84CC16]">{stats.vitality}%</h2>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                <span>Optimal Growth Range</span>
                <span
                  className={
                    stats.vitality >= 70
                      ? 'text-emerald-400'
                      : stats.vitality >= 40
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {stats.vitality >= 70 ? 'Healthy' : stats.vitality >= 40 ? 'Moderate Alert' : 'Pathogen Alert'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-950/40 border border-emerald-950/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#84CC16] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(Math.max(stats.vitality, 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Weekly Total Scans + Report Action Buttons */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Total Scans</span>
              </div>

              {/* Action buttons: Download PDF & Email */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDownloadReport('weekly')}
                  disabled={downloadingPeriod === 'weekly'}
                  title="Download Weekly PDF Report"
                  className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold disabled:opacity-50"
                >
                  <Download className={`w-3 h-3 ${downloadingPeriod === 'weekly' ? 'animate-bounce' : ''}`} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => openEmailModal('weekly')}
                  title="Email Weekly Diagnostic Report"
                  className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-4xl font-extrabold text-blue-400">{stats.weeklyTotal}</h2>
              <div className="flex gap-3 mt-4 text-[11px] font-bold text-slate-400 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5" title="Common Rust scans in past 7 days">
                  CR <span className="text-blue-400 ml-1">{stats.weeklyCR}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5" title="Gray Leaf Spot scans in past 7 days">
                  GR <span className="text-blue-400 ml-1">{stats.weeklyGR}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5" title="Healthy leaf scans in past 7 days">
                  HT <span className="text-blue-400 ml-1">{stats.weeklyHT}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Total Scans + Report Action Buttons */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#84CC16]/10 border border-[#84CC16]/20 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-[#84CC16]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Total Scans</span>
              </div>

              {/* Action buttons: Download PDF & Email */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDownloadReport('monthly')}
                  disabled={downloadingPeriod === 'monthly'}
                  title="Download Monthly PDF Report"
                  className="px-2 py-1 rounded-lg bg-[#84CC16]/10 hover:bg-[#84CC16]/20 border border-[#84CC16]/20 text-[#84CC16] hover:text-lime-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold disabled:opacity-50"
                >
                  <Download className={`w-3 h-3 ${downloadingPeriod === 'monthly' ? 'animate-bounce' : ''}`} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => openEmailModal('monthly')}
                  title="Email Monthly Diagnostic Report"
                  className="px-2 py-1 rounded-lg bg-[#84CC16]/10 hover:bg-[#84CC16]/20 border border-[#84CC16]/20 text-[#84CC16] hover:text-lime-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-4xl font-extrabold text-[#84CC16]">{stats.monthlyTotal}</h2>
              <div className="flex gap-3 mt-4 text-[11px] font-bold text-slate-400 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5" title="Common Rust scans in past 30 days">
                  CR <span className="text-[#84CC16] ml-1">{stats.monthlyCR}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5" title="Gray Leaf Spot scans in past 30 days">
                  GR <span className="text-[#84CC16] ml-1">{stats.monthlyGR}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5" title="Healthy leaf scans in past 30 days">
                  HT <span className="text-[#84CC16] ml-1">{stats.monthlyHT}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Disease Trend Analysis & Safe Zone Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Side: Disease Trend Analysis Chart */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide">Disease Trend Analysis</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {trendMode === 'weekly'
                  ? 'Current week pathogen detection frequency (Mon - Sun)'
                  : 'Rolling 7-day pathogen detection frequency'}
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Trend view toggle */}
              <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setTrendMode('weekly')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    trendMode === 'weekly'
                      ? 'bg-[#84CC16] text-[#0E1611] shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTrendMode('rolling7')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    trendMode === 'rolling7'
                      ? 'bg-[#84CC16] text-[#0E1611] shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Last 7 Days
                </button>
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
          </div>

          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                  allowDecimals={false}
                  domain={[0, yAxisMax]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111E15',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FFF',
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}
                  formatter={(value, name) => [
                    `${value} scan${value === 1 ? '' : 's'}`,
                    name === 'commonRust' ? 'Common Rust' : name === 'grayLeaf' ? 'Gray Leaf Spot' : name,
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0] && payload[0].payload) {
                      const item = payload[0].payload;
                      return `${item.name} (${item.dateStr || ''})`;
                    }
                    return label;
                  }}
                />
                <Line
                  name="commonRust"
                  type="monotone"
                  dataKey="commonRust"
                  stroke="#84CC16"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0, fill: '#84CC16' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="grayLeaf"
                  type="monotone"
                  dataKey="grayLeaf"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0, fill: '#059669' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {maxPathogenCount === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-xl bg-black/40 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-sm">
                  ✨ No disease detected in this period — Crop vitality optimal
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Safe Zone / Corn character card */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
          <div>
            <h3
              className={`text-sm font-extrabold tracking-wider uppercase mb-1 ${
                stats.vitality >= 70
                  ? 'text-[#84CC16]'
                  : stats.vitality >= 40
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {stats.vitality >= 70
                ? 'Your Farm is Safe zone'
                : stats.vitality >= 40
                ? 'Moderate Risk Alert'
                : 'Disease Risk Alert'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {stats.vitality >= 70
                ? 'Pathogens within safe ecological limits'
                : stats.vitality >= 40
                ? 'Symptoms observed in local fields'
                : 'Fungal outbreaks require fast fungicide action'}
            </p>
            <div className="flex justify-center mt-3">
              {/* Dynamic Face / Shield Icon */}
              <div
                className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors ${
                  stats.vitality >= 70
                    ? 'bg-[#84CC16]/10 border-[#84CC16]/20'
                    : stats.vitality >= 40
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-rose-500/10 border-rose-500/20'
                }`}
              >
                {stats.vitality >= 70 ? (
                  <Smile className="w-10 h-10 text-[#84CC16]" />
                ) : stats.vitality >= 40 ? (
                  <ShieldCheck className="w-10 h-10 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-rose-400" />
                )}
              </div>
            </div>
          </div>

          {/* Cartoon Corn character holding hands up (SVG) */}
          <div className="w-36 h-36 mt-4 relative z-10 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="38" y="25" width="24" height="45" rx="12" fill="#FCD34D" />
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

              <path d="M35 70C30 50 35 35 44 28C38 38 34 54 38 70H35Z" fill="#10B981" />
              <path d="M65 70C70 50 65 35 56 28C62 38 66 54 62 70H65Z" fill="#10B981" />
              <path d="M50 72C40 65 32 50 35 35C45 45 48 60 50 72Z" fill="#047857" opacity="0.8" />
              <path d="M50 72C60 65 68 50 65 35C55 45 52 60 50 72Z" fill="#047857" opacity="0.8" />

              <circle cx="45" cy="40" r="3.5" fill="white" />
              <circle cx="45" cy="40" r="1.5" fill="black" />
              <circle cx="55" cy="40" r="3.5" fill="white" />
              <circle cx="55" cy="40" r="1.5" fill="black" />

              <path d="M43 47C43 51 57 51 57 47H43Z" fill="#BE123C" />
              <path d="M47 47C47 49 53 49 53 47H47Z" fill="white" />

              <path d="M34 50C25 45 22 38 24 35C26 32 30 40 36 46" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M66 50C75 45 78 38 76 35C74 32 70 40 64 46" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

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
            <button
              onClick={() => openEmailModal('monthly')}
              className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#a3e635] text-[#0E1611] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Export Monthly Report</span>
            </button>
            <button
              onClick={() => handleDownloadReport('weekly')}
              className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl border border-slate-500 hover:border-slate-300 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EMAIL & PDF REPORT MODAL DIALOG */}
      {/* ========================================================= */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Diagnostic Report Dispatcher</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Export PDF or email diagnostic report</p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Period Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Report Scope
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPeriod === 'weekly'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase">Weekly Report</span>
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1">Past 7 Days ({stats.weeklyTotal} scans)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPeriod === 'monthly'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase">Monthly Report</span>
                    <CalendarDays className="w-4 h-4 text-[#84CC16]" />
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1">Past 30 Days ({stats.monthlyTotal} scans)</span>
                </button>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendEmailReport}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Recipient Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-emerald-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  The generated report will be securely dispatched as a high-resolution PDF attachment.
                </p>
              </div>

              {/* Feedback Alert */}
              {reportFeedback && (
                <div
                  className={`p-4 rounded-2xl mb-6 text-xs border ${
                    reportFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {reportFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold leading-relaxed">{reportFeedback.message}</p>
                      {reportFeedback.previewUrl && (
                        <a
                          href={reportFeedback.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-emerald-400 hover:text-emerald-300 underline font-bold"
                        >
                          <span>Open Development Email Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadReport(selectedPeriod)}
                  disabled={downloadingPeriod !== null}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {downloadingPeriod ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <Download className="w-4 h-4 text-slate-300" />
                  )}
                  <span>Download PDF Directly</span>
                </button>

                <button
                  type="submit"
                  disabled={sendingEmail || !recipientEmail}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#84CC16] hover:bg-[#a3e635] text-[#0E1611] font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Email Report to Me</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
