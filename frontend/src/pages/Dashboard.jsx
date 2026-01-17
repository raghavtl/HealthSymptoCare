import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { wellnessLogsApi } from '../services/api';
import './Dashboard.css';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js';

// Subtle drop shadow plugin for lines/areas
const dropShadow = {
  id: 'dropShadow',
  beforeDatasetDraw(chart, args, pluginOptions) {
    // Allow disabling via options: { enabled: false } or false
    if (pluginOptions === false || (pluginOptions && pluginOptions.enabled === false)) return;
    try {
      const meta = chart.getDatasetMeta(args.index);
      const line = meta && meta.dataset;
      if (!line || meta.hidden) return;
      const { ctx } = chart;
      const opt = pluginOptions || {};
      ctx.save();
      ctx.beginPath();
      // Trace the same path as the line
      if (typeof line.path === 'function') {
        line.path(ctx);
      }
      // Shadow stroke behind the line
      ctx.strokeStyle = opt.color || 'rgba(0,0,0,0.35)';
      ctx.shadowColor = opt.color || 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = opt.blur ?? 10;
      ctx.shadowOffsetX = opt.offsetX ?? 0;
      ctx.shadowOffsetY = opt.offsetY ?? 4;
      const bw = (line.options && line.options.borderWidth) || 2;
      ctx.lineWidth = bw + 2;
      ctx.lineCap = (line.options && line.options.borderCapStyle) || 'round';
      ctx.lineJoin = (line.options && line.options.borderJoinStyle) || 'round';
      ctx.stroke();
      ctx.restore();
    } catch (e) {
      // Non-fatal: if shadow draw fails, continue with normal draw
      // console.warn('shadow draw failed', e);
    }
  }
};

const pointValueLabels = {
  id: 'pointValueLabels',
  afterDatasetsDraw(chart, args, options) {
    try {
      const cfg = options || {};
      const sets = Array.isArray(cfg.datasets) ? cfg.datasets : [];
      const { ctx } = chart;
      sets.forEach((s) => {
        const meta = chart.getDatasetMeta(s.index);
        if (!meta || meta.hidden) return;
        const points = meta.data || [];
        const values = Array.isArray(s.values) ? s.values : [];
        ctx.save();
        ctx.fillStyle = s.color || '#2563eb';
        ctx.font = s.font || '10px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        points.forEach((pt, i) => {
          const v = values[i];
          if (v == null || !pt || typeof pt.x !== 'number' || typeof pt.y !== 'number') return;
          const text = s.format ? s.format(v, i) : (typeof v === 'number' ? v.toFixed(1) : String(v));
          ctx.fillText(text, pt.x, pt.y - 6);
        });
        ctx.restore();
      });
    } catch (e) {
      // ignore label draw errors
    }
  }
};



// Glow for 'Overall' line and pulsing rings for hovered points
const overallGlow = {
  id: 'overallGlow',
  afterDatasetsDraw(chart) {
    const dsIndex = chart.data?.datasets?.findIndex?.(d => d && d.label === 'Overall');
    if (dsIndex == null || dsIndex < 0) return;
    const meta = chart.getDatasetMeta(dsIndex);
    if (!meta || meta.hidden) return;
    const line = meta.dataset; if (!line || typeof line.path !== 'function') return;
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    line.path(ctx);
    const pulse = (Math.sin(Date.now() / 400) + 1) / 2; // 0..1
    ctx.lineWidth = (line.options?.borderWidth || 5) + 2 + pulse * 2;
    ctx.strokeStyle = '#7c3aed';
    ctx.shadowColor = 'rgba(124, 58, 237, 0.45)';
    ctx.shadowBlur = 12 + pulse * 6;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }
};

const pulseOnHover = {
  id: 'pulseOnHover',
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements?.() || chart.tooltip?.getActiveElements?.() || [];
    if (!active.length) return;
    const { datasetIndex, index } = active[0];
    const meta = chart.getDatasetMeta(datasetIndex);
    const pt = meta?.data?.[index];
    if (!pt || typeof pt.x !== 'number') return;
    const { ctx } = chart;
    const pulse = (Date.now() % 900) / 900; // 0..1
    const r = 8 + (1 - pulse) * 10;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(59,130,246,0.35)';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7 * (1 - pulse);
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
};

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, dropShadow, pointValueLabels, overallGlow, pulseOnHover);

// Import icons
import { 
  FaWater, 
  FaBed, 
  FaBolt, 
  FaWalking, 
  FaSmile, 
  FaMoon, 
  FaSun, 
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaPlus,
  FaArrowRight
} from 'react-icons/fa';

// Error boundary component for catching rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-100 rounded-lg">
          <h2 className="text-red-700 font-bold mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap text-sm">
            <summary className="text-red-500 cursor-pointer">View error details</summary>
            <p className="mt-2 text-red-800">{this.state.error && this.state.error.toString()}</p>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Function to get energy emoji based on numeric value
const getEnergyEmoji = (value) => {
  const roundedValue = Math.round(value);
  if (roundedValue <= 2) return '😴';
  if (roundedValue <= 4) return '🔋';
  if (roundedValue <= 7) return '💪';
  return '⚡';
};

// Dashboard component
const Dashboard = () => {
  const navigate = useNavigate();
  // State declarations
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({
    avgWaterIntake: 0,
    avgSleepHours: 0,
    avgMoodLevel: 0,
    avgEnergyLevel: 0,
    totalLogs: 0
  });
  const [timeRange, setTimeRange] = useState('week');
  const [darkMode, setDarkMode] = useState(false);
  const [showRecentLogs, setShowRecentLogs] = useState(true);

  // Helpers
  const localKey = (d) => {
    const dt = (d instanceof Date) ? d : new Date(d);
    // YYYY-MM-DD in local time to avoid UTC shifting
    return dt.toLocaleDateString('en-CA');
  };
  const toNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  const moodToNum = (m) => ({ 'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5 }[m] || 0);
  const normalizeLog = (l) => ({
    ...l,
    date: l.date ? localKey(l.date) : localKey(new Date()),
    water_intake: toNum(l.water_intake ?? l.waterIntake),
    sleep_hours: toNum(l.sleep_hours ?? l.sleepHours),
    energy_level: toNum(l.energy_level ?? l.energyLevel),
    mood: l.mood || 'neutral',
  });

  // Calculate stats function
  const calculateStats = useCallback((logsData) => {
    if (!logsData || logsData.length === 0) {
      return { avgWaterIntake: 0, avgSleepHours: 0, avgMoodLevel: 0, avgEnergyLevel: 0, totalLogs: 0 };
    }
    const validLogs = logsData.filter(Boolean).map(normalizeLog);
    const totalLogs = validLogs.length;
    if (totalLogs === 0) return { avgWaterIntake: 0, avgSleepHours: 0, avgMoodLevel: 0, avgEnergyLevel: 0, totalLogs: 0 };

    const waterSum = validLogs.reduce((s,l)=> s + toNum(l.water_intake), 0);
    const sleepSum = validLogs.reduce((s,l)=> s + toNum(l.sleep_hours), 0);
    const moodSum  = validLogs.reduce((s,l)=> s + moodToNum(l.mood), 0);
    const energySum= validLogs.reduce((s,l)=> s + toNum(l.energy_level), 0);

    return {
      avgWaterIntake: parseFloat((waterSum / totalLogs).toFixed(1)),
      avgSleepHours: parseFloat((sleepSum / totalLogs).toFixed(1)),
      avgMoodLevel: parseFloat((moodSum / totalLogs).toFixed(1)),
      avgEnergyLevel: parseFloat((energySum / totalLogs).toFixed(1)),
      totalLogs
    };
  }, []);

  // Utility: de-duplicate logs by id if present, otherwise by local day+values signature
  const dedupeLogs = (arr) => {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    const out = [];
    for (const logRaw of arr) {
      if (!logRaw) continue;
      const log = normalizeLog(logRaw);
      const id = log.id || log._id;
      const day = log.date || '';
      const key = id ? `id:${id}` : `d:${day}|w:${log.water_intake}|s:${log.sleep_hours}|m:${log.mood}|e:${log.energy_level}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(log);
    }
    return out;
  };

  // Fetch logs from API or localStorage
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // Reset
        setLogs([]); setRecentLogs([]); setStats({ avgWaterIntake:0, avgSleepHours:0, avgMoodLevel:0, avgEnergyLevel:0, totalLogs:0 });
        // Fetch using stored user id
        const getStoredUserId = () => {
          try {
            const sessionUser = sessionStorage.getItem('user');
            const localUser = localStorage.getItem('user');
            const stored = sessionUser || localUser;
            if (!stored) return null;
            const parsed = JSON.parse(stored);
            return parsed?.id || null;
          } catch { return null; }
        };
        const userId = getStoredUserId();
        if (!userId) throw new Error('No current user');
        const response = await wellnessLogsApi.getByUserId(userId).catch(() => ({ data: [] }));
        const apiLogs = Array.isArray(response.data) ? response.data : [];
        let validLogs = dedupeLogs(apiLogs);
        if (validLogs.length === 0) {
          const hasUserLogs = localStorage.getItem('userHasWellnessLogs') === 'true';
          const storedLogs = hasUserLogs ? JSON.parse(localStorage.getItem('wellnessLogs') || '[]') : [];
          validLogs = dedupeLogs(storedLogs);
        }
        setLogs(validLogs);
        setRecentLogs(validLogs.slice(0,5));
        setStats(calculateStats(validLogs));
      } catch (error) {
        console.error('Error in fetchLogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [calculateStats]);


  // Effect for filtering logs based on time range
  useEffect(() => {
    // Always ensure we have valid logs before processing
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      // Reset stats and recent logs when there are no logs
      setStats({
        avgWaterIntake: 0,
        avgSleepHours: 0,
        avgMoodLevel: 0,
        avgEnergyLevel: 0,
        totalLogs: 0
      });
      setRecentLogs([]);
      return;
    }
    
    // Start with a clean filtered logs array
    let filteredLogs = [...logs].filter(log => log !== null && log !== undefined);
    
    // Apply time range filtering
    if (timeRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredLogs = filteredLogs.filter(log => {
        return log && log.date && new Date(log.date) >= oneWeekAgo;
      });
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filteredLogs = filteredLogs.filter(log => {
        return log && log.date && new Date(log.date) >= oneMonthAgo;
      });
    }
    
    // Only update recent logs if we have valid filtered logs
    if (filteredLogs.length > 0) {
      setRecentLogs(filteredLogs.slice(0, 5));
      const newStats = calculateStats(filteredLogs);
      setStats(newStats);
    } else {
      // If no logs match the time range, reset to empty state
      setRecentLogs([]);
      setStats({
        avgWaterIntake: 0,
        avgSleepHours: 0,
        avgMoodLevel: 0,
        avgEnergyLevel: 0,
        totalLogs: 0
      });
    }
  }, [logs, timeRange, calculateStats]);


  // Initialize from current DOM theme and keep in sync via events
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
    const themeHandler = (e) => setDarkMode(!!(e && e.detail && e.detail.dark));
    window.addEventListener('themechange', themeHandler);

    // Update logs immediately when WellnessLogger saves/deletes
    const logsHandler = (e) => {
      try {
        const payloadLogs = e?.detail?.logs;
        let next = Array.isArray(payloadLogs) ? payloadLogs : [];
        if (next.length === 0) {
          const hasUserLogs = localStorage.getItem('userHasWellnessLogs') === 'true';
          const storedLogs = hasUserLogs ? JSON.parse(localStorage.getItem('wellnessLogs') || '[]') : [];
          next = storedLogs;
        }
        const valid = dedupeLogs(next.filter(Boolean));
        setLogs(valid);
        setRecentLogs(valid.slice(0,5));
        setStats(calculateStats(valid));
      } catch (err) { console.error('logsHandler error', err); }
    };
    window.addEventListener('wellnesslogs:updated', logsHandler);
    window.addEventListener('storage', logsHandler);

    return () => {
      window.removeEventListener('themechange', themeHandler);
      window.removeEventListener('wellnesslogs:updated', logsHandler);
      window.removeEventListener('storage', logsHandler);
    };
  }, [calculateStats]);

  // Update chart defaults when theme changes (do not toggle DOM class here)
  useEffect(() => {
    try {
      const isDark = !!darkMode;
      const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      const textColor = isDark ? '#ffffff' : '#374151';
      const titleColor = isDark ? '#ffffff' : '#111827';
      ChartJS.defaults.color = textColor;
      ChartJS.defaults.borderColor = gridColor;
      ChartJS.defaults.plugins = ChartJS.defaults.plugins || {};
      ChartJS.defaults.plugins.legend = ChartJS.defaults.plugins.legend || {};
      ChartJS.defaults.plugins.legend.labels = ChartJS.defaults.plugins.legend.labels || {};
      ChartJS.defaults.plugins.legend.labels.color = textColor;
      ChartJS.defaults.plugins.title = ChartJS.defaults.plugins.title || {};
      ChartJS.defaults.plugins.title.color = titleColor;
    } catch {}
  }, [darkMode]);

  // Toggle dark mode function
  
  // Function to get mood emoji based on numeric value
  const getMoodEmojiFromValue = (value) => {
    const roundedValue = Math.round(value);
    const moodEmojis = {
      0: '😢',
      1: '😢',
      2: '😔',
      3: '😐',
      4: '😊',
      5: '😁'
    };
    return moodEmojis[roundedValue] || '😐';
  };

// Helpers and combined chart for Wellness Logs stats
  const wlLabels = useMemo(() => {
    const rangeDays = timeRange === 'week' ? 7 : 30;
    const labels = [];
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (rangeDays - 1));
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      labels.push(localKey(d));
    }
    return labels;
  }, [timeRange]);

  // Build daily averages map for actionable insights
  const dailyMap = useMemo(() => {
    const map = {};
    logs.map(normalizeLog).forEach((log) => {
      if (!log || !log.date) return;
      const key = log.date;
      if (!map[key]) map[key] = { c: 0, water: 0, sleep: 0, mood: 0, energy: 0 };
      map[key].c += 1;
      map[key].water += toNum(log.water_intake);
      map[key].sleep += toNum(log.sleep_hours);
      map[key].mood += moodToNum(log.mood);
      map[key].energy += toNum(log.energy_level);
    });
    Object.keys(map).forEach((k) => {
      const c = map[k].c || 1;
      map[k].water = map[k].water / c;
      map[k].sleep = map[k].sleep / c;
      map[k].mood = map[k].mood / c;
      map[k].energy = map[k].energy / c;
    });
    return map;
  }, [logs]);

  const wlCombinedChart = useMemo(() => {
    if (!logs || logs.length === 0 || wlLabels.length === 0) return null;

    // Build daily averages map using normalized logs and local dates
    const map = {};
    logs.map(normalizeLog).forEach((log) => {
      if (!log || !log.date) return;
      const key = log.date;
      if (!map[key]) map[key] = { c: 0, water: 0, sleep: 0, mood: 0, energy: 0 };
      map[key].c += 1;
      map[key].water += toNum(log.water_intake);
      map[key].sleep += toNum(log.sleep_hours);
      map[key].mood += moodToNum(log.mood);
      map[key].energy += toNum(log.energy_level);
    });
    Object.keys(map).forEach((k) => {
      const c = map[k].c || 1;
      map[k].water = map[k].water / c;
      map[k].sleep = map[k].sleep / c;
      map[k].mood = map[k].mood / c;
      map[k].energy = map[k].energy / c;
    });

    const waterArrRaw = wlLabels.map((d) => map[d]?.water ?? null);
    const sleepArrRaw = wlLabels.map((d) => map[d]?.sleep ?? null);
    const moodArrRaw  = wlLabels.map((d) => map[d]?.mood ?? null);
    const energyArrRaw= wlLabels.map((d) => map[d]?.energy ?? null);

    const norm = (arr) => {
      const vals = arr.filter((v) => v != null);
      const max = Math.max(...vals, 0);
      if (!max) return arr.map((v) => (v == null ? null : 0));
      return arr.map((v) => (v == null ? null : Math.round((v / max) * 100)));
    };


    const labelFromKey = (k) => {
      const [y,m,d] = k.split('-').map((n)=>parseInt(n,10));
      const dt = new Date(y, (m||1)-1, d||1);
      // Format like 21/09/2025 for clearer per‑day ticks (similar to your second image)
      return dt.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Build normalized series and a composite line
    const waterNorm = norm(waterArrRaw);
    const sleepNorm = norm(sleepArrRaw);
    const moodNorm  = norm(moodArrRaw);
    const energyNorm= norm(energyArrRaw);

    // Ensure every day has a plotted point by converting missing values to 0
    const fillZeros = (arr) => arr.map((v) => (v == null ? 0 : v));
    const waterSeries  = fillZeros(waterNorm);
    const sleepSeries  = fillZeros(sleepNorm);
    const moodSeries   = fillZeros(moodNorm);
    const energySeries = fillZeros(energyNorm);
    const overallNorm = wlLabels.map((_, i) => {
      const vals = [waterNorm[i], sleepNorm[i], moodNorm[i], energyNorm[i]].filter(v => v != null);
      if (vals.length === 0) return null;
      return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
    });


    const horzGrad = (chart, colors) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return colors[0];
      const g = ctx.createLinearGradient(chartArea.left, chartArea.top, chartArea.right, chartArea.top);
      const step = 1 / (colors.length - 1);
      colors.forEach((c, i) => g.addColorStop(i * step, c));
      return g;
    };

    const data = {
      labels: wlLabels.map((d) => labelFromKey(d)),
      datasets: [
        {
          label: 'Water (glasses)',
          data: waterSeries,
          borderColor: (ctx) => horzGrad(ctx.chart, ['#67e8f9', '#06b6d4']),
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.45,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderWidth: 4,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          spanGaps: false,
          order: 998,
        },
        {
          label: 'Sleep (hours)',
          data: sleepSeries,
          borderColor: (ctx) => horzGrad(ctx.chart, ['#60a5fa', '#3b82f6']),
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          borderWidth: 3.5,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          spanGaps: false,
        },
        {
          label: 'Mood (1-5)',
          data: moodSeries,
          borderColor: (ctx) => horzGrad(ctx.chart, ['#fbbf24', '#f59e0b']),
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          borderWidth: 3.5,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          spanGaps: false,
        },
        {
          label: 'Energy (1-10)',
          data: energySeries,
          borderColor: (ctx) => horzGrad(ctx.chart, ['#34d399', '#10b981']),
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          borderWidth: 3.5,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          spanGaps: false,
        },
        // Composite line overlay
        {
          label: 'Overall',
          data: overallNorm,
          borderColor: (ctx) => horzGrad(ctx.chart, ['#a78bfa', '#7c3aed']),
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.55,
          pointRadius: 2,
          pointHoverRadius: 6,
          borderWidth: 5,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          spanGaps: false,
          order: 999,
        },
      ],
    };

    const isDark = darkMode;
    const tickColor = isDark ? '#ffffff' : '#374151';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    const titleColor = isDark ? '#ffffff' : '#111827';

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1600, easing: 'easeInOutCubic' },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor, drawBorder: false }, border: { display: false } },
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Normalized %', color: tickColor }, ticks: { color: tickColor }, grid: { color: gridColor, drawBorder: false }, border: { display: false } },
      },
      plugins: {
        legend: { position: 'top', labels: { color: tickColor, usePointStyle: true, pointStyle: 'circle' } },
        title: { color: titleColor },
        tooltip: {
          intersect: false,
          mode: 'index',
          backgroundColor: 'rgba(173, 216, 230, 0.95)',
          titleColor: '#111111',
          bodyColor: '#111111',
          borderColor: 'rgba(37,99,235,0.35)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          boxPadding: 5,
          callbacks: {
            label: (ctx) => {
              const idx = ctx.dataIndex; const ds = ctx.dataset.label;
              const get = (lab) => {
                if (lab.startsWith('Water')) return waterArrRaw[idx];
                if (lab.startsWith('Sleep')) return sleepArrRaw[idx];
                if (lab.startsWith('Mood')) return moodArrRaw[idx];
                if (lab.startsWith('Energy')) return energyArrRaw[idx];
                if (lab.startsWith('Overall')) {
                  const vals = [waterArrRaw[idx], sleepArrRaw[idx], moodArrRaw[idx], energyArrRaw[idx]].filter(v=>v!=null);
                  if (!vals.length) return null;
                  // Show averaged raw score as percentage
                  const maxes = [Math.max(...waterArrRaw.filter(v=>v!=null),0), Math.max(...sleepArrRaw.filter(v=>v!=null),0), Math.max(...moodArrRaw.filter(v=>v!=null),0), Math.max(...energyArrRaw.filter(v=>v!=null),0)];
                  const parts = [waterArrRaw[idx], sleepArrRaw[idx], moodArrRaw[idx], energyArrRaw[idx]].map((v,i)=> v==null?null: (maxes[i]? (v/maxes[i])*100:0)).filter(v=>v!=null);
                  if (!parts.length) return null;
                  return parts.reduce((a,b)=>a+b,0)/parts.length;
                }
                return null;
              };
              const v = get(ds);
              if (v == null) return `${ds}: no data`;
              if (ds.startsWith('Water')) return `${ds}: ${v.toFixed(1)} glasses`;
              if (ds.startsWith('Sleep')) return `${ds}: ${v.toFixed(1)} hrs`;
              if (ds.startsWith('Mood')) return `${ds}: ${v.toFixed(1)}/5`;
              if (ds.startsWith('Energy')) return `${ds}: ${v.toFixed(1)}/10`;
              if (ds.startsWith('Overall')) return `${ds}: ${v.toFixed(0)}%`;
              return `${ds}: ${v}`;
            }
          }
        },
        // shadow plugin options
        dropShadow: false,
        // value labels for water series
        pointValueLabels: {
          datasets: [
            { index: 0, values: waterArrRaw, color: '#1d4ed8', font: '10px system-ui' }
          ]
        }
      },
      interaction: { intersect: false, mode: 'index' }
    };

    return { data, options };
  }, [logs, wlLabels]);

  // Safe render function to handle potential rendering errors
  const safeRender = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="dashboard-container wellness-bg p-2 sm:p-4 mx-auto max-w-7xl text-black dark:text-white transition-colors">
        <div className="dashboard-content w-full">
          {/* Dashboard content would go here */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Wellness Dashboard</h2>
              </div>
              <div className="time-range-selector">
                <button 
                  className={`pill mr-2 ${timeRange === 'week' ? 'pill-active' : ''}`}
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </button>
                <button 
                  className={`pill ${timeRange === 'month' ? 'pill-active' : ''}`}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards - Only shown when there are logs */}
          {logs && logs.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Water Intake Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn">
                  <div className="flex items-center mb-2">
                    <FaWater className="text-blue-500 mr-2 text-lg sm:text-xl animate-pulse" />
                    <h3 className="font-semibold text-sm sm:text-base dark:text-gray-200">Water Intake</h3>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold dark:text-white">{stats.avgWaterIntake} <span className="text-xs sm:text-sm font-normal dark:text-gray-300">glasses/day</span></p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 mt-2 overflow-hidden">
                    <div 
                      style={{ width: `${(stats.avgWaterIntake / 10) * 100}%` }}
                      className="bg-blue-500 h-2 sm:h-2.5 rounded-full transition-all duration-1000 animate-expandWidth"
                    ></div>
                  </div>
                </div>

                {/* Sleep Hours Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn" style={{animationDelay: '0.1s'}}>
                  <div className="flex items-center mb-2">
                    <FaBed className="text-indigo-500 mr-2 text-lg sm:text-xl animate-pulse" style={{animationDelay: '0.5s'}} />
                    <h3 className="font-semibold text-sm sm:text-base dark:text-gray-200">Sleep</h3>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold dark:text-white">{stats.avgSleepHours} <span className="text-xs sm:text-sm font-normal dark:text-gray-300">hours/night</span></p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 mt-2 overflow-hidden">
                    <div 
                      style={{ width: `${(stats.avgSleepHours / 12) * 100}%` }}
                      className="bg-indigo-500 h-2 sm:h-2.5 rounded-full transition-all duration-1000 animate-expandWidth"
                    ></div>
                  </div>
                </div>

                {/* Mood Level Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center mb-2">
                    <FaSmile className="text-yellow-500 mr-2 text-lg sm:text-xl animate-pulse" style={{animationDelay: '1s'}} />
                    <h3 className="font-semibold text-sm sm:text-base dark:text-gray-200">Mood</h3>
                  </div>
                  <div className="flex items-center">
                    <p className="text-2xl sm:text-3xl font-bold dark:text-white">{stats.avgMoodLevel.toFixed(1)}/5</p>
                    <span className="ml-2 text-2xl" title="Current mood">{getMoodEmojiFromValue(stats.avgMoodLevel)}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-xs mr-1">😢</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
                      <div 
                        style={{ width: `${(stats.avgMoodLevel / 5) * 100}%` }}
                        className="bg-yellow-500 h-2 sm:h-2.5 rounded-full transition-all duration-1000 animate-expandWidth"
                      ></div>
                    </div>
                    <span className="text-xs ml-1">😁</span>
                  </div>
                </div>

                {/* Energy Level Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn" style={{animationDelay: '0.3s'}}>
                  <div className="flex items-center mb-2">
                    <FaBolt className="text-orange-500 mr-2 text-lg sm:text-xl animate-pulse" style={{animationDelay: '1.5s'}} />
                    <h3 className="font-semibold text-sm sm:text-base dark:text-gray-200">Energy</h3>
                  </div>
                  <div className="flex items-center">
                    <p className="text-2xl sm:text-3xl font-bold dark:text-white">{stats.avgEnergyLevel.toFixed(1)}/10</p>
                    <span className="ml-2 text-2xl" title="Current energy level">{getEnergyEmoji(stats.avgEnergyLevel)}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-xs mr-1">🔋</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
                      <div 
                        style={{ width: `${(stats.avgEnergyLevel / 10) * 100}%` }}
                        className="bg-orange-500 h-2 sm:h-2.5 rounded-full transition-all duration-1000 animate-expandWidth"
                      ></div>
                    </div>
                    <span className="text-xs ml-1">⚡</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wellness Logs Combined Graph */}
          {wlCombinedChart && (
            <div className="chart-glass p-3 mb-6 animate-shadowPulse">
              <div className="font-semibold mb-2">Wellness Momentum</div>
              <div className="h-64">
                <Line data={wlCombinedChart.data} options={wlCombinedChart.options} height={256} />
              </div>
              <div className="text-xs text-gray-500 mt-2">All series are normalized to a 0–100 scale for easy comparison.</div>
            </div>
          )}

          {/* Recent Logs Section */}
          {logs && Array.isArray(logs) && logs.length > 0 && recentLogs && Array.isArray(recentLogs) && recentLogs.length > 0 && showRecentLogs && (
            <div className="mt-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white flex items-center">
                  <FaCalendarAlt className="text-blue-500 mr-2 animate-pulse" style={{animationDelay: '2s'}} />
                  Recent Wellness Logs
                </h2>
                <button 
                  onClick={() => setShowRecentLogs(!showRecentLogs)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300 hover:scale-105"
                >
                  {showRecentLogs ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-fadeIn">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Water</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sleep</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mood</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Energy</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentLogs.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{log.water_intake || log.waterIntake} glasses</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{log.sleep_hours || log.sleepHours} hrs</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{log.mood}/5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{log.energy_level || log.energyLevel}/10</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty State - Only shown when there are no logs */}
          {(!logs || logs.length === 0) && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center animate-fadeIn transition-all duration-500">
              <div className="relative inline-block">
                <FaBell className="text-blue-400 dark:text-blue-500 text-5xl mb-4 animate-bounce" style={{animationDuration: '2s'}} />
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-blue-100 dark:bg-blue-900 opacity-30 animate-ping" style={{animationDuration: '3s'}}></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-3 text-lg font-medium">No wellness logs found yet</p>
              <p className="text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">Start tracking your daily wellness metrics to see your progress and insights here.</p>
              <button 
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-300 hover:shadow-lg hover:scale-105 inline-flex items-center"
                onClick={() => navigate('/wellness-logger')}
              >
                <FaPlus className="mr-2" /> Log Your Wellness
              </button>
            </div>
          )}

          {/* Personalized Action Center - Only when there are logs */}
          {logs && logs.length > 0 && (
            <div className="mt-8 animate-fadeIn" style={{animationDelay: '0.5s'}}>
              <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center">
                <FaChartLine className="text-green-500 mr-2 animate-pulse" style={{animationDelay: '2.5s'}} />
                Personalized Action Center
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {(() => {
                  const todayKey = localKey(new Date());
                  const t = dailyMap[todayKey] || { water: 0, sleep: 0, mood: 0, energy: 0 };
                  const waterTarget = 8; // glasses
                  const waterPct = Math.min(100, Math.round((t.water / waterTarget) * 100));
                  const sleepTarget = 8; // hours
                  const sleepPct = Math.min(100, Math.round((t.sleep / sleepTarget) * 100));
                  const moodTxt = t.mood >= 4 ? 'Great' : t.mood >= 3 ? 'Okay' : 'Low';
                  const energyTxt = t.energy >= 7 ? 'High' : t.energy >= 4 ? 'Moderate' : 'Low';
                  const energyTarget = 10; // points
                  const energyPct = Math.min(100, Math.round((t.energy / energyTarget) * 100));

                  return (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                      {/* Hydration Card */}
<div className="glass-card glass-blue p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300"><FaWater /> Hydration</div>
                          <span className="text-sm text-blue-600 dark:text-blue-300">{t.water.toFixed(1)}/{waterTarget} glasses</span>
                        </div>
<div className="neo-progress progress-blue mt-1">
<div className="neo-progress-fill" style={{ width: `${waterPct}%` }}></div>
                        </div>
                        <div className="mt-3 text-sm text-blue-700 dark:text-blue-200">{waterPct >= 100 ? 'Goal met 🎉' : `Add ${(waterTarget - t.water).toFixed(1)} more glasses to hit your goal.`}</div>
                        <button
                          type="button"
                          aria-label="Log water"
                          onClick={() => navigate('/wellness-logger')}
className="neo-btn btn-blue mt-auto w-full inline-flex items-center justify-center"
                        >
                          <FaWater className="h-4 w-4" />
                          <span>Log Water</span>
                          <FaArrowRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>

                      {/* Sleep Card */}
<div className="glass-card glass-indigo p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-semibold text-indigo-800 dark:text-indigo-300"><FaBed /> Sleep</div>
                          <span className="text-sm text-indigo-600 dark:text-indigo-300">{t.sleep.toFixed(1)}/{sleepTarget} hrs</span>
                        </div>
<div className="neo-progress progress-indigo mt-1">
<div className="neo-progress-fill" style={{ width: `${sleepPct}%` }}></div>
                        </div>
                        <div className="mt-3 text-sm text-indigo-700 dark:text-indigo-200">{sleepPct >= 100 ? 'Well rested 😴' : 'Aim for 7–9 hrs tonight for optimal recovery.'}</div>
                        <button
                          type="button"
                          aria-label="Plan your evening"
                          onClick={() => navigate('/diet-fitness')}
className="neo-btn btn-indigo mt-auto w-full inline-flex items-center justify-center"
                        >
                          <FaBed className="h-4 w-4" />
                          <span>Plan Evening</span>
                          <FaArrowRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>

                      {/* Mood Card */}
<div className="glass-card glass-amber p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">Mood</div>
                          <span className="text-sm text-amber-600 dark:text-amber-300">{t.mood.toFixed(1)}/5</span>
                        </div>
                        <div className="text-amber-700 dark:text-amber-200 text-sm">Status: <span className="font-medium">{moodTxt}</span></div>
                        <button
                          type="button"
                          aria-label="Open de-stress"
                          onClick={() => navigate('/de-stress')}
className="neo-btn btn-amber mt-auto w-full inline-flex items-center justify-center"
                        >
                          <FaSmile className="h-4 w-4" />
                          <span>Open De‑stress</span>
                          <FaArrowRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>

                      {/* Energy Card */}
<div className="glass-card glass-emerald p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">Energy</div>
                          <span className="text-sm text-emerald-600 dark:text-emerald-300">{t.energy.toFixed(1)}/10</span>
                        </div>
                        <div className="neo-progress progress-emerald mt-1"><div className="neo-progress-fill" style={{ width: `${energyPct}%` }}></div></div>
                        <div className="mt-3 text-sm text-emerald-700 dark:text-emerald-200">Energy: <span className="font-medium">{energyTxt}</span></div>
                        <button
                          type="button"
                          aria-label="Boost with workout"
                          onClick={() => navigate('/diet-fitness')}
className="neo-btn btn-emerald mt-auto w-full inline-flex items-center justify-center"
                        >
                          <FaBolt className="h-4 w-4" />
                          <span>Boost with Workout</span>
                          <FaArrowRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      {safeRender()}
    </ErrorBoundary>
  );
};

export default Dashboard;