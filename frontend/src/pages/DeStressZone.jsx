import React, { useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize, FiSun, FiMoon, FiBluetooth, FiActivity, FiHeart, FiUsers } from 'react-icons/fi';

// Fonts (Inter, Poppins) injection
const ensureFonts = () => {
  try {
    if (!document.getElementById('dz-google-fonts')) {
      const l1 = document.createElement('link');
      l1.id = 'dz-google-fonts';
      l1.rel = 'stylesheet';
      l1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap';
      document.head.appendChild(l1);
    }
  } catch {}
};

// Calm quotes
const CALM_QUOTES = [
  { text: 'The best way to capture moments is to pay attention.', author: 'Jon Kabat-Zinn' },
  { text: 'Your calm mind is the ultimate weapon against your challenges.', author: 'Bryant McGill' },
  { text: 'Within you, there is a stillness and a sanctuary to which you can retreat at any time.', author: 'Hermann Hesse' },
  { text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
];

// Ambient sounds
const SOUNDS = {
  rain: {
    label: 'Rain',
    url: '/rain.mp3'
  },
  forest: { 
    label: 'Forest', 
    url: '/forest.mp3' 
  },
  ocean: {
    label: 'Ocean', 
    url: '/ocean.mp3' },
  whitenoise: { 
    label: 'White Noise', 
    url: '/white_noise.mp3' },
};

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const loadJSON = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const DeStressZone = () => {
  useEffect(() => { ensureFonts(); }, []);

  // Global controls & accessibility
  const [theme, setTheme] = useState(loadJSON('dz_theme', 'dark'));
  const [background, setBackground] = useState(loadJSON('dz_bg', 'gradients'));
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tabs & top-of-page elements
  const [activeTab, setActiveTab] = useState('breathing'); // breathing | meditation | quotes | focus | sleep
  const [participantsToday] = useState(1200 + Math.floor(Math.random()*300));
  
  // UI tokens: gradients is a dark theme background
  const isLightBg = false;
  const titleColor = isLightBg ? 'text-slate-900' : 'text-white/90';
  const textColor = isLightBg ? 'text-slate-700' : 'text-white/80';
  const subTextColor = isLightBg ? 'text-slate-600' : 'text-white/70';
  const cardBg = isLightBg ? 'bg-white/90 ring-1 ring-slate-200' : 'bg-black/20';
  const surfaceBtn = isLightBg ? 'bg-white text-slate-700 hover:bg-slate-100' : 'bg-white/10 text-white hover:bg-white/20';
  const selectCls = isLightBg ? 'px-3 py-2 rounded-full bg-white text-slate-700' : 'px-3 py-2 rounded-full bg-white/10 text-white/90';
  const tabActive = isLightBg ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500/90 text-white shadow-lg';
  const tabInactive = isLightBg ? 'bg-white text-slate-700 hover:bg-slate-100' : 'bg-white/10 text-white/80 hover:bg-white/20';

  // Quotes rotation
  const [qIndex, setQIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setQIndex((i) => (i + 1) % CALM_QUOTES.length), 7000);
    return () => clearInterval(id);
  }, []);

  // Mood & gamification
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(4);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState(null); // {msg, ts}
  const [history, setHistory] = useState(loadJSON('dz_mood_history', [])); // [{t,before,after,note}]
  const [streak, setStreak] = useState(loadJSON('dz_streak', 0));
  const [lastSessionDay, setLastSessionDay] = useState(loadJSON('dz_last_day', null));
  // Pro convenience: weekly goal & reminder
  const [goalPerWeek, setGoalPerWeek] = useState(loadJSON('dz_goal_week', 5));
  const [reminderEnabled, setReminderEnabled] = useState(loadJSON('dz_reminder_enabled', false));
  const [reminderTime, setReminderTime] = useState(loadJSON('dz_reminder_time', '20:00')); // HH:MM 24h
  const [lastReminderDay, setLastReminderDay] = useState(loadJSON('dz_reminder_day', null));

  useEffect(() => saveJSON('dz_mood_history', history), [history]);
  useEffect(() => saveJSON('dz_streak', streak), [streak]);
  useEffect(() => saveJSON('dz_last_day', lastSessionDay), [lastSessionDay]);
  useEffect(() => saveJSON('dz_goal_week', goalPerWeek), [goalPerWeek]);
  useEffect(() => saveJSON('dz_reminder_enabled', reminderEnabled), [reminderEnabled]);
  useEffect(() => saveJSON('dz_reminder_time', reminderTime), [reminderTime]);
  useEffect(() => saveJSON('dz_reminder_day', lastReminderDay), [lastReminderDay]);

  // Biofeedback
  const [hr, setHr] = useState(null);
  const [hrv, setHrv] = useState(null);
  const [bioDevice, setBioDevice] = useState(null);
  const [bioData, setBioData] = useState([]); // {t, hr, hrv}


  // Adaptive breathing pace from HRV: higher HRV -> faster but gentle, lower HRV -> slower calming
  const paceMs = (() => {
    const v = hrv ?? 55; // default mid
    const norm = clamp((v - 20) / 100, 0, 1);
    return Math.round(7000 - norm * 3000); // 7000ms to 4000ms per phase
  })();

  // Session logging
  const logSession = (b = moodBefore, a = moodAfter, n = note) => {
    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10);
    const entry = { t: Date.now(), before: clamp(b,1,5), after: clamp(a,1,5), note: (n && n.trim()) ? n.trim() : undefined };
    setHistory((h) => [...h.slice(-199), entry]);
    if (!lastSessionDay) {
      setStreak(1); setLastSessionDay(dayKey);
    } else if (lastSessionDay !== dayKey) {
      const prev = new Date(lastSessionDay);
      const diff = Math.round((now - prev) / 86400000);
      setStreak((s) => (diff === 1 ? s + 1 : 1));
      setLastSessionDay(dayKey);
    }
    setNote('');
    setToast({ msg: `Saved: Δ ${(entry.after - entry.before) >= 0 ? '+' : ''}${(entry.after - entry.before).toFixed(1)}`, ts: Date.now() });
  };

  const undoLast = () => {
    setHistory((h) => h.length ? h.slice(0, -1) : h);
    setToast({ msg: 'Last entry removed', ts: Date.now() });
  };


  const exportHistoryCSV = () => {
    try {
      const rows = [['timestamp','date','before','after','delta','note']];
      for (const h of history) {
        const d = new Date(h.t);
        rows.push([h.t, d.toISOString(), h.before ?? '', h.after ?? '', (h.after||0)-(h.before||0), (h.note||'').replace(/,/g,';')]);
      }
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'mood_history.csv'; a.click();
      setTimeout(()=> URL.revokeObjectURL(url), 1500);
    } catch {}
  };

  const clearHistory = () => { if (confirm('Clear mood history?')) setHistory([]); };

  const importHistoryCSV = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.csv,text/csv';
      input.onchange = () => {
        const file = input.files && input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const text = String(reader.result || '');
            const lines = text.split(/\r?\n/).filter(Boolean);
            const out = [];
            const header = lines[0].toLowerCase();
            for (let i=1;i<lines.length;i++) {
              const cols = lines[i].split(',');
              const ts = parseInt(cols[0],10);
              const before = parseFloat(cols[2]);
              const after = parseFloat(cols[3]);
              const note = cols[5] ? cols[5] : undefined;
              if (!isNaN(ts) && !isNaN(before) && !isNaN(after)) {
                out.push({ t: ts, before: clamp(before,1,5), after: clamp(after,1,5), note });
              }
            }
            if (out.length) {
              setHistory(h => [...h, ...out].slice(-300));
              setToast({ msg: `Imported ${out.length} entries`, ts: Date.now() });
            }
          } catch {}
        };
        reader.readAsText(file);
      };
      input.click();
    } catch {}
  };

  const stats = (() => {
    const n = history.length;
    if (!n) return { n: 0, avgB: 0, avgA: 0, avgD: 0, bestD: 0, bestAt: null };
    const sumB = history.reduce((s,h)=>s+(h.before||0),0);
    const sumA = history.reduce((s,h)=>s+(h.after||0),0);
    const sumD = history.reduce((s,h)=>s+((h.after||0)-(h.before||0)),0);
    let bestD = -Infinity, bestAt = null;
    history.forEach(h=>{ const d=(h.after||0)-(h.before||0); if (d>bestD){bestD=d; bestAt=h.t;} });
    return { n, avgB: sumB/n, avgA: sumA/n, avgD: sumD/n, bestD, bestAt };
  })();

  const sessionsLast7 = (arr) => {
    const dayMs = 86400000; const now = Date.now();
    return arr.filter(h => now - h.t < 7*dayMs).length;
  };

  // Reminder tick (client-side toast at the time once per day)
  useEffect(() => {
    if (!reminderEnabled) return;
    const id = setInterval(() => {
      try {
        const [hh, mm] = (reminderTime||'20:00').split(':').map(x=>parseInt(x,10));
        const d = new Date();
        const dayKey = d.toISOString().slice(0,10);
        if (lastReminderDay === dayKey) return;
        if (d.getHours() === hh && d.getMinutes() === mm) {
          setToast({ msg: 'Time to check in with your mood', ts: Date.now() });
          setLastReminderDay(dayKey);
        }
      } catch {}
    }, 60000);
    return () => clearInterval(id);
  }, [reminderEnabled, reminderTime, lastReminderDay]);

  // Fullscreen Calm Mode
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {}
  };

  // Apply theme & accessibility prefs
  useEffect(() => saveJSON('dz_bg', background), [background]);

  const bgClass = background === 'gradients' ? 'bg-gradient-to-br from-slate-900 via-sky-900 to-emerald-900' : 'bg-cover bg-center';
  const bgStyle = background === 'nature' ? { backgroundImage: "url('https://source.unsplash.com/1600x900/?forest,calm')" } : background === 'space' ? { backgroundImage: "url('https://source.unsplash.com/1600x900/?space,stars')" } : {};


  return (
    <div
  className={`min-h-screen ${bgClass} ${
    theme === 'dark'
      ? 'bg-slate-900 text-white'
      : 'bg-slate-50 text-slate-900'
  }`}
  style={bgStyle}
>
      <div className="container mx-auto px-4 py-6" style={{ fontFamily: 'Inter, Poppins, ui-sans-serif, system-ui' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl md:text-4xl font-bold ${titleColor}`}>De-Stress Zone</h1>
            <div className={`hidden md:flex items-center ${subTextColor} text-sm ${isLightBg ? 'bg-white' : 'bg-white/10'} rounded-full px-3 py-1`}>
              <FiUsers className="mr-2"/> {participantsToday.toLocaleString()} people meditated with you today
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-full transition-colors ${surfaceBtn}`} title="Toggle theme">
              {theme === 'dark' ? <FiSun/> : <FiMoon/>}
            </button>
            <button onClick={toggleFullscreen} className={`p-2 rounded-full transition-colors ${surfaceBtn}`} title="Calm Mode">
              {isFullscreen ? <FiMinimize/> : <FiMaximize/>}
            </button>
            <select className={selectCls} value={background} onChange={(e)=>setBackground(e.target.value)}>
              <option value="gradients">Deep Blue</option>
              <option value="nature">Nature</option>
              <option value="space">Space</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 md:gap-4 mb-6">
          {[
            { id: 'breathing', label: 'Breathing Exercise' },
            { id: 'meditation', label: 'Meditation' },
            { id: 'quotes', label: 'Calm Quotes' },
            { id: 'focus', label: 'Focus Timer' },
            { id: 'sleep', label: 'Sleep Prep' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-full text-sm md:text-base transition-all ${activeTab === t.id ? tabActive : tabInactive}`}>{t.label}</button>
          ))}
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'breathing' && (
            <>
              <BreathingPanel paceMs={paceMs} ui={{ isLightBg, titleColor, subTextColor, cardBg }} />
              <BiofeedbackPanel hr={hr} hrv={hrv} device={bioDevice} setDevice={setBioDevice} data={bioData} setData={setBioData} setHr={setHr} setHrv={setHrv} ui={{ isLightBg, titleColor, subTextColor, cardBg }} />
            </>
          )}
          {activeTab === 'meditation' && <MeditationPanel ui={{ isLightBg, titleColor, subTextColor, cardBg }} />}
          {activeTab === 'quotes' && (
            <div className={`rounded-3xl p-8 ${cardBg} backdrop-blur-xl shadow-2xl text-center`}>
              <p className={`text-xl md:text-2xl italic ${titleColor} transition-opacity`}>"{CALM_QUOTES[qIndex].text}"</p>
              <p className={`relative mt-3 ${subTextColor}`}>- {CALM_QUOTES[qIndex].author}</p>
              <div className="relative flex gap-3 justify-center mt-6">
                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={() => setQIndex((i)=> (i-1+CALM_QUOTES.length)%CALM_QUOTES.length)}><FiChevronLeft/></button>
                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={() => setQIndex((i)=> (i+1)%CALM_QUOTES.length)}><FiChevronRight/></button>
              </div>
            </div>
          )}
          {activeTab === 'focus' && <FocusPanel />}
          {activeTab === 'sleep' && <SleepPanel ui={{ cardBg, titleColor, subTextColor }} />}
        </div>

        {/* Insights */}
        <div className="mt-8">
          <div className={`rounded-3xl p-6 ${cardBg} backdrop-blur-xl shadow-2xl`}>
            <div className="flex items-start justify-between mb-4">
              <h3 className={`${titleColor} font-semibold text-xl`}>Mood Tracker</h3>
              <div className="flex gap-2">
                <button onClick={exportHistoryCSV} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm">Download</button>
                <button onClick={importHistoryCSV} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm">Import</button>
                <button onClick={clearHistory} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm">Reset</button>
              </div>
            </div>

            {/* Professional inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center mb-4">
              <div>
                <div className={`${subTextColor} text-sm mb-2`}>Before</div>
                <MoodScale value={moodBefore} onChange={setMoodBefore} />
              </div>
              <div>
                <div className={`${subTextColor} text-sm mb-2 flex items-center gap-2`}>After
                  <div className="ml-2 flex gap-1">
                    <button aria-label="Worse" className="px-2 py-0.5 text-xs rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={()=>setMoodAfter(clamp(moodBefore-1,1,5))}>Worse</button>
                    <button aria-label="Same" className="px-2 py-0.5 text-xs rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={()=>setMoodAfter(moodBefore)}>Same</button>
                    <button aria-label="Better" className="px-2 py-0.5 text-xs rounded-full bg-emerald-600/90 hover:bg-emerald-700 text-white" onClick={()=>setMoodAfter(clamp(moodBefore+1,1,5))}>Better</button>
                  </div>
                </div>
                <MoodScale value={moodAfter} onChange={setMoodAfter} />
              </div>
              <div className="flex lg:justify-end items-center gap-3">
                <DeltaBadge delta={moodAfter - moodBefore} />
                <button onClick={()=>logSession()} className="px-5 py-2 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700">Log mood</button>
                <button onClick={undoLast} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white">Undo</button>
              </div>
            </div>

            {/* Note */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`${subTextColor} text-sm w-28`}>Note</div>
              <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Add a short note (optional)" className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-white/90 placeholder-white/50" />
            </div>

            {/* Stats + sparkline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center">
              <StatPill label="Sessions" value={stats.n} />
              <StatPill label="Streak" value={streak} />
              <StatPill label="Avg improvement" value={`${stats.avgD.toFixed(1)}`} trend={stats.avgD} />
              <div className="p-4 rounded-2xl bg-white/5">
                <div className="text-xs text-white/60 mb-1">Recent change</div>
                <TrendSpark data={history.map(h => (h.after||0)-(h.before||0)).slice(-24)} />
              </div>
            </div>

            <MiniHistory history={history} />

            {/* Weekly goal & reminder */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/70">Weekly goal</div>
                  <div className="text-xs text-white/60">{sessionsLast7(history)} / {goalPerWeek}</div>
                </div>
                <Progress value={sessionsLast7(history)} max={goalPerWeek} />
                <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
                  <span>Target</span>
                  <input type="number" min="1" max="14" value={goalPerWeek} onChange={(e)=>setGoalPerWeek(clamp(parseInt(e.target.value||'0'),1,14))} className="w-16 px-2 py-1 rounded bg-white/10 text-white/90" />/week
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5">
                <div className="text-sm text-white/70 mb-2">Daily reminder</div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-white/80 text-sm">
                    <input type="checkbox" checked={reminderEnabled} onChange={(e)=>setReminderEnabled(e.target.checked)} /> Enable
                  </label>
                  <input type="time" value={reminderTime} onChange={(e)=>setReminderTime(e.target.value)} className="px-2 py-1 rounded bg-white/10 text-white/90" />
                  <div className="text-xs text-white/60">We’ll remind you here at this time.</div>
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>


      <style>{`
        .breathing { animation: breath 8s infinite ease-in-out; }
        @keyframes breath { 0%,100%{ transform: scale(1)} 50%{ transform: scale(1.2)} }
        .ring { width: 220px; height: 220px; border-radius: 9999px; background: conic-gradient(#60a5fa var(--deg), rgba(255,255,255,0.1) 0); }
        .toast { position: fixed; bottom: 20px; right: 20px; padding: 10px 14px; border-radius: 9999px; background: rgba(16,185,129,0.15); color: #a7f3d0; backdrop-filter: blur(8px); }
      `}</style>
      {toast && (<div className="toast">{toast.msg}</div>)}
    </div>
  );
};

// --- Panels & Helpers ---
const BreathingPanel = ({ paceMs = 4000, ui = {} }) => {
  const { isLightBg = false, titleColor = 'text-white/90', subTextColor = 'text-white/70', cardBg = 'bg-black/20' } = ui;

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('Inhale');
  const [seconds, setSeconds] = useState(0);
  const phaseRef = useRef('Inhale');
  const tickRef = useRef(null);
  const timeRef = useRef(null);

  useEffect(() => () => { clearInterval(tickRef.current); clearInterval(timeRef.current); }, []);

  useEffect(() => {
    if (!running) return;
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      phaseRef.current = phaseRef.current==='Inhale' ? 'Hold' : phaseRef.current==='Hold' ? 'Exhale' : 'Inhale';
      setPhase(phaseRef.current);
    }, paceMs);
    return () => clearInterval(tickRef.current);
  }, [paceMs, running]);

  const start = () => {
    setRunning(true);
    phaseRef.current = 'Inhale';
    setPhase('Inhale');
    setSeconds(0);
    clearInterval(timeRef.current);
    timeRef.current = setInterval(() => setSeconds((s)=>s+1), 1000);
    clearInterval(tickRef.current);
    tickRef.current = setInterval(()=>{
      phaseRef.current = phaseRef.current==='Inhale' ? 'Hold' : phaseRef.current==='Hold' ? 'Exhale' : 'Inhale';
      setPhase(phaseRef.current);
    }, paceMs);
  };

  const stop = () => {
    setRunning(false);
    clearInterval(tickRef.current);
    clearInterval(timeRef.current);
  };

  return (
    <div className={`relative rounded-3xl p-8 ${cardBg} backdrop-blur-xl shadow-2xl text-center overflow-hidden`}>
      <BreathingShapes running={running} />
      <div className={`relative mx-auto mb-6 w-48 h-48 md:w-64 md:h-64 rounded-full ${isLightBg ? 'bg-white' : 'bg-white/10'} flex items-center justify-center ${titleColor} text-2xl md:text-3xl font-semibold ${running ? 'breathing' : ''}`}>
        {phase}
      </div>
      <div className={`relative ${titleColor} text-5xl font-mono mb-6`}>{fmt(seconds)}</div>
      <div className="relative flex justify-center gap-4">
        <button onClick={running?stop:start} className="px-6 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center gap-2">{running? <FiPause/> : <FiPlay/>}{running? 'Pause' : 'Start'}</button>
        <button onClick={()=>{stop(); setSeconds(0); setPhase('Inhale');}} className={`px-6 py-3 rounded-full ${isLightBg ? 'bg-white text-slate-700 hover:bg-slate-100' : 'bg-white/10 text-white hover:bg-white/20'} flex items-center gap-2`}><FiRefreshCw/>Reset</button>
      </div>
      <div className={`relative mt-4 ${subTextColor} text-sm`}>Adaptive pace: ~{Math.round(paceMs/1000)}s per phase (auto from HRV)</div>
    </div>
  );
};

const BiofeedbackPanel = ({ hr, hrv, device, setDevice, data, setData, setHr, setHrv, ui = {} }) => {
  const { isLightBg = false, subTextColor = 'text-white/70', cardBg = 'bg-black/20' } = ui;
  const supported = typeof navigator !== 'undefined' && !!navigator.bluetooth;

  const connectBluetooth = async () => {
    if (!supported) return;
    try {
      const device = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const ch = await service.getCharacteristic('heart_rate_measurement');
      setDevice(device.name || 'Heart Rate');
      ch.startNotifications();
      ch.addEventListener('characteristicvaluechanged', (e) => {
        const v = e.target.value; // DataView
        const flags = v.getUint8(0);
        const hr = (flags & 0x01) ? v.getUint16(1, true) : v.getUint8(1);
        setHr(hr);
        let idx = (flags & 0x01) ? 3 : 2;
        let nextHrv = hrv;
        if (flags & 0x10) { // RR-intervals present
          const rr = v.getUint16(idx, true);
          const rrMs = rr ? (rr/1024)*1000 : 0;
          nextHrv = Math.round(clamp(Math.abs(100 - (rrMs % 100)), 20, 120));
          setHrv(nextHrv);
        }
        setData((arr) => [...arr.slice(-59), { t: Date.now(), hr, hrv: nextHrv ?? null }]);
      });
    } catch (e) {
      console.warn('Bluetooth connect failed', e);
    }
  };

  // Neon ECG sweep: canvas-based oscilloscope animation that matches the reference design
  const hrDisplay = hr || 72;

  const NeonECG = ({ bpm, light = false }) => {
    const containerRef = useRef(null);
    const bgRef = useRef(null); // background: grid layer (transparent)
    const fgRef = useRef(null); // foreground: neon trace with fading trail

    useEffect(() => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const buf = document.createElement('canvas');
      let bufCtx = null;
      const pxPerCm = 96 / 2.54; // CSS reference pixels per cm
      const edgeGap = Math.round(2 * pxPerCm); // 2cm hide margin on both sides

      const drawBackground = (w, h) => {
        const ctxb = bgRef.current.getContext('2d');
        ctxb.setTransform(1, 0, 0, 1, 0, 0);
        ctxb.clearRect(0, 0, w, h);
        // Transparent background; CSS gradient layer below fills full width
        // ECG grid
        const pad = 16; const cols = 10; const rows = 6;
        ctxb.strokeStyle = light ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)';
        ctxb.lineWidth = 1;
        for (let i = 0; i <= cols; i++) {
          const x = pad + (i / cols) * (w - 2 * pad);
          ctxb.beginPath(); ctxb.moveTo(x, pad); ctxb.lineTo(x, h - pad); ctxb.stroke();
        }
        for (let j = 0; j <= rows; j++) {
          const y = pad + (j / rows) * (h - 2 * pad);
          ctxb.beginPath(); ctxb.moveTo(pad, y); ctxb.lineTo(w - pad, y); ctxb.stroke();
        }
      };

      const resize = () => {
        const wCss = Math.max(300, containerRef.current?.clientWidth || 600);
        const hCss = 160;
        [bgRef.current, fgRef.current].forEach((c) => {
          c.width = Math.round(wCss * dpr);
          c.height = Math.round(hCss * dpr);
          c.style.width = wCss + 'px';
          c.style.height = hCss + 'px';
          const ctx = c.getContext('2d');
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        });
        // buffer canvas mirrors fg for smooth scrolling
        buf.width = Math.round(wCss * dpr);
        buf.height = Math.round(hCss * dpr);
        bufCtx = buf.getContext('2d');
        bufCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawBackground(wCss, hCss);
      };

      resize();
      window.addEventListener('resize', resize);
      let ro;
      if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
        ro = new ResizeObserver(() => resize());
        ro.observe(containerRef.current);
      }

      const ctx = fgRef.current.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let raf; let last = 0; let x = 0; let prevX = 0; let prevY = null; let t = 0;
      const pad = 16; const baseline = 0.54; const amp = 0.76;
      const period = 60 / clamp(bpm || 72, 30, 180); // seconds per beat
      const speedFactor = 8.5; // slower sweep preference
      const speedPxPerSec = () => {
        const w = fgRef.current.width / dpr;
        return w / speedFactor; // full width sweep speed
      };

      const gauss = (x, s) => Math.exp(-0.5 * (x * x) / (s * s));
      const ecg = (p) => {
        // Tuned to user preference: larger, razor-thin R spike; stronger Q/S; smooth T
        const P = 0.08 * gauss(p - 0.16, 0.034);
        const Q = -0.36 * gauss(p - 0.215, 0.007);
        const R = 2.50 * gauss(p - 0.245, 0.0024); // very tall, thin R spike
        const S = -0.75 * gauss(p - 0.265, 0.007);
        const T = 0.42 * gauss(p - 0.55, 0.065);
        return P + Q + R + S + T;
      };

      const drawSeg = (x1, y1, x2, y2) => {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        // outer glow pass
        ctx.strokeStyle = 'rgba(255, 48, 88, 0.35)';
        ctx.shadowColor = 'rgba(255, 0, 64, 0.9)';
        ctx.shadowBlur = 24; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        // mid glow pass
        ctx.strokeStyle = '#ff2a5a'; ctx.shadowColor = '#ff2a5a';
        ctx.shadowBlur = 12; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        // core pass
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();
      };

      const drawHead = (x, y) => {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const r = 5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        g.addColorStop(0, 'rgba(255,220,230,0.95)');
        g.addColorStop(0.45, '#ff2a5a');
        g.addColorStop(1, 'rgba(255,0,64,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      const yAt = (time, w, h) => {
        const phase = (time % period) / period;
        const val = ecg(phase);
        const yNorm = clamp(baseline - amp * val, 0, 1);
        return h - pad - yNorm * (h - 2 * pad);
      };

      const loop = (ts) => {
        const w = fgRef.current.width / dpr; const h = fgRef.current.height / dpr;
        if (!last) last = ts; const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
        t += dt;

        const v = speedPxPerSec();
        const dx = v * dt;
        const tPrev = t - dt;

        const xMin = 0; // start at very left edge
        const xMax = w; // draw up to the right edge
        if (x < xMin) x = xMin;
        if (prevY === null) { prevX = x; prevY = yAt(tPrev, w, h); }

        const newX = x + dx;
        if (newX <= xMax) {
          const steps = Math.max(2, Math.round(dx));
          let x0 = x; let y0 = yAt(tPrev, w, h);
          for (let i = 1; i <= steps; i++) {
            const xi = x + (i / steps) * dx;
            const ti = tPrev + (i / steps) * dt;
            const yi = yAt(ti, w, h);
            drawSeg(x0, y0, xi, yi);
            x0 = xi; y0 = yi;
          }
          x = newX; prevX = x; prevY = y0;
        } else {
          // Draw to the right edge first
          const dxToEdge = xMax - x;
          const steps1 = Math.max(2, Math.round(dxToEdge));
          let x1 = x; let y1 = yAt(tPrev, w, h);
          for (let i = 1; i <= steps1; i++) {
            const xi = x + (i / steps1) * dxToEdge;
            const ti = tPrev + (i / steps1) * (dxToEdge / v);
            const yi = yAt(ti, w, h);
            drawSeg(x1, y1, xi, yi);
            x1 = xi; y1 = yi;
          }
          // Clear screen instantly, then restart next frame from the very left
          ctx.globalCompositeOperation = 'copy';
          ctx.clearRect(0, 0, w, h);
          ctx.globalCompositeOperation = 'source-over';

          x = xMin; prevX = x; prevY = null; // begin next sweep from start
        }

        raf = requestAnimationFrame(loop);
      };

      raf = requestAnimationFrame(loop);
      return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); if (ro) ro.disconnect(); };
    }, [bpm, light]);

    return (
      <div className={`rounded-xl overflow-hidden ${light ? 'ring-1 ring-rose-200' : 'ring-1 ring-red-900/30'}`}>
        <div ref={containerRef} className="relative w-full h-40">
          <div className="absolute inset-0" style={{ background: light ? 'linear-gradient(180deg, #ffe4e6 0%, #fecdd3 100%)' : 'linear-gradient(180deg, #19090b 0%, #2a0c10 50%, #3a0f12 100%)' }} />
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: light ? 'linear-gradient(180deg, rgba(255,88,120,0.0) 0%, rgba(255,88,120,0.25) 55%, rgba(255,88,120,0.0) 100%)' : 'linear-gradient(180deg, rgba(255,48,88,0.0) 0%, rgba(255,48,88,0.25) 55%, rgba(255,48,88,0.0) 100%)' }} />
          <canvas ref={bgRef} className="absolute inset-0 w-full h-full" />
          <canvas ref={fgRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl p-6 bg-black/20 backdrop-blur-xl shadow-2xl">
      <h3 className="text-white/90 font-semibold text-xl mb-4 flex items-center gap-2"><FiActivity/> Smart Biofeedback</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-2xl bg-white/10 text-white">
          <div className="flex items-center justify-between mb-2"><div className="font-semibold">Heart Rate Monitor</div><FiBluetooth/></div>
          <button onClick={connectBluetooth} disabled={!supported} title={!supported ? 'Web Bluetooth not supported in this browser' : 'Connect'} className="px-3 py-2 rounded-full bg-blue-500/90 disabled:opacity-50 disabled:cursor-not-allowed text-white w-full">Connect</button>
          <div className={`mt-2 text-xs ${subTextColor}`}>{device ? `Connected: ${device}` : (!supported ? 'Web Bluetooth not supported (showing preview)' : 'Not connected (showing preview)')}</div>
        </div>
        <InfoPill icon={<FiHeart/>} label="Heart Rate" value={hr ? `${hr} bpm` : `${hrDisplay} bpm`} />
        <InfoPill icon={<FiActivity/>} label="HRV" value={hrv ? `${hrv} ms` : '--'} />
      </div>
      <NeonECG bpm={hrDisplay} light={isLightBg} />
      <div className={`text-xs ${subTextColor}`}>Pulse waveform (HR-driven)</div>
    </div>
  );
};


const InfoPill = ({ icon, label, value }) => (
  <div className="p-4 rounded-full bg-white/10 text-white flex items-center gap-2">
    <div className="text-lg">{icon}</div>
    <div className="text-sm text-white/80">{label}</div>
    <div className="ml-auto font-semibold">{value}</div>
  </div>
);

const StatPill = ({ label, value, hint='', trend }) => (
  <div className="p-4 rounded-2xl bg-white/5 text-white/90">
    <div className="text-xs text-white/60">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
    <div className={`text-[10px] mt-1 ${trend>0? 'text-emerald-400':'text-white/50'}`}>{hint}</div>
  </div>
);

const MoodFaces = ({ value=3, onChange = ()=>{} }) => {
  const faces = [
    { v:1, e:'😣', label:'Very stressed' },
    { v:2, e:'😕', label:'Stressed' },
    { v:3, e:'😐', label:'Okay' },
    { v:4, e:'🙂', label:'Good' },
    { v:5, e:'😄', label:'Great' },
  ];
  return (
    <div className="flex gap-2">
      {faces.map(f => (
        <button key={f.v} aria-label={f.label}
          onClick={()=>onChange(f.v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${value===f.v? 'bg-emerald-600 text-white scale-105':'bg-white/10 text-white hover:bg-white/20'}`}>{f.e}</button>
      ))}
    </div>
  );
};

const MiniHistory = ({ history=[] }) => {
  const items = history.slice(-10).reverse();
  const fmtDate = (t) => new Date(t).toLocaleString();
  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/70 text-sm">Recent sessions</div>
        <div className="text-[10px] text-white/50">last 10</div>
      </div>
      {items.length===0 ? (
        <div className="text-white/60 text-sm">No sessions yet. Log how you feel to see your progress.</div>
      ) : (
        <ul className="divide-y divide-white/5">
          {items.map((h,idx)=>{
            const d = (h.after||0)-(h.before||0);
            const label = d>0?'Better': d<0?'Worse':'Same';
            return (
              <li key={idx} className="py-2 flex items-center gap-3 text-white/90">
                <DeltaBadge delta={d} small />
                <span className="text-sm flex-1">{fmtDate(h.t)} — {label} {h.note? `— ${h.note}`:''}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const MoodScale = ({ value=3, onChange = ()=>{} }) => {
  const opts = [
    { v:1, label:'Very low' },
    { v:2, label:'Low' },
    { v:3, label:'Neutral' },
    { v:4, label:'Good' },
    { v:5, label:'Great' },
  ];
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { onChange(clamp(value+1,1,5)); }
    if (e.key === 'ArrowLeft') { onChange(clamp(value-1,1,5)); }
  };
  return (
    <div role="radiogroup" aria-label="Mood" className="flex gap-2" onKeyDown={onKey}>
      {opts.map(o => (
        <button
          role="radio"
          aria-checked={value===o.v}
          key={o.v}
          onClick={()=>onChange(o.v)}
          className={`px-3 py-2 rounded-xl text-sm transition-all ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-white/70 ${value===o.v? 'bg-white/90 text-slate-800 ring-white':'bg-white/10 text-white/80 hover:bg-white/20 ring-white/20'}`}
          title={o.label}
        >
          {o.v}
        </button>
      ))}
    </div>
  );
};

const DeltaBadge = ({ delta=0, small=false }) => {
  const color = delta>0? 'bg-emerald-500/20 text-emerald-300' : delta<0? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-white/70';
  const sizeCls = small? 'px-2 py-0.5 text-xs rounded-full' : 'px-3 py-1.5 text-sm rounded-full';
  const sign = delta>0? '+' : '';
  return <span className={`${color} ${sizeCls}`}>Δ {sign}{delta.toFixed(1)}</span>;
};

const TrendSpark = ({ data=[] }) => {
  const width=220, height=48, pad=6;
  if (data.length===0) return <div className="text-white/60 text-xs">No data yet</div>;
  const maxA = Math.max(1, ...data.map(d=>Math.abs(d)));
  const xAt=(i)=> pad + (i/(Math.max(1,data.length-1)))*(width-pad*2);
  const yAt=(v)=> height/2 - (v/maxA)*(height/2 - pad);
  const points = data.map((v,i)=>`${xAt(i)},${yAt(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
      <polyline fill="none" stroke="#10b981" strokeWidth="2.2" points={points} />
      <line x1={pad} x2={width-pad} y1={height/2} y2={height/2} stroke="rgba(255,255,255,0.15)" />
    </svg>
  );
};

const Progress = ({ value=0, max=10 }) => {
  const pct = Math.max(0, Math.min(100, (max>0? (value/max)*100 : 0)));
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
};

const MeditationPanel = ({ ui = {} }) => {
  const { cardBg = 'bg-black/20', titleColor = 'text-white/90' } = ui;
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(600);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => () => { try { audioRef.current?.pause(); } catch {}; clearInterval(intervalRef.current); }, []);

  const toggle = (key) => {
    if (audioRef.current && sound === key && playing) {
      audioRef.current.pause(); setPlaying(false); return;
    }
    if (!audioRef.current || sound !== key) {
      try { audioRef.current?.pause(); } catch {}
      audioRef.current = new Audio(SOUNDS[key].url);
      setSound(key); setProgress(0);
    }
    audioRef.current.play().then(()=> setPlaying(true)).catch(()=> setPlaying(false));
  };

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(()=>{
        setProgress((p)=>{
          const np = p + 1; if (np >= duration) { try{audioRef.current?.pause();}catch{} setPlaying(false); clearInterval(intervalRef.current); return duration; } return np;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, duration]);

  return (
    <div className="relative rounded-3xl p-8 bg-black/20 backdrop-blur-xl shadow-2xl overflow-hidden">
      <h3 className={`relative ${titleColor} font-semibold text-xl mb-4`}>Meditation</h3>
      <div className="relative grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.keys(SOUNDS).map(k => (
          <div key={k} onClick={()=>toggle(k)} className={`p-4 rounded-2xl text-center cursor-pointer transition-all ${sound===k && playing ? 'bg-blue-500/90' : 'bg-white/10 hover:bg-white/20'} text-white`}>
            <div className="text-4xl mb-2">{k==='rain'?'🌧️':k==='forest'?'🌲':k==='ocean'?'🌊':'🎧'}</div>
            <div className="font-semibold">{SOUNDS[k].label}</div>
          </div>
        ))}
      </div>
      <div className="relative flex items-center gap-3 mb-4 text-white/80">
        Duration:
        {[5,10,15,30].map(m => (
          <button key={m} onClick={()=>setDuration(m*60)} className={`px-3 py-1 rounded-full text-sm ${duration===m*60?'bg-blue-500/90 text-white':'bg-white/10 text-white/80'}`}>{m}m</button>
        ))}
      </div>
      <div className="relative w-full bg-white/10 rounded-full h-2.5">
        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(progress/duration)*100}%` }}></div>
      </div>
    </div>
  );
};

const FocusPanel = () => {
  const [focus, setFocus] = useState(25*60);
  const [rest, setRest] = useState(5*60);
  const [mode, setMode] = useState('focus');
  const [remaining, setRemaining] = useState(25*60);
  const [running, setRunning] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => () => clearInterval(tickRef.current), []);

  const start = () => {
    setRunning(true);
    clearInterval(tickRef.current);
    tickRef.current = setInterval(()=>{
      setRemaining((r)=>{
        if (r<=1) {
          const nextMode = mode==='focus' ? 'rest' : 'focus';
          const nextDur = nextMode==='focus' ? focus : rest;
          setMode(nextMode);
          return nextDur;
        }
        return r-1;
      })
    }, 1000);
  };
  const pause = () => { setRunning(false); clearInterval(tickRef.current); };
  const reset = () => { pause(); setMode('focus'); setRemaining(focus); };

  useEffect(()=> { if (mode==='focus') setRemaining(focus); else setRemaining(rest); }, [focus, rest, mode]);

  const deg = Math.round(((mode==='focus'? (focus-remaining): (rest-remaining)) / (mode==='focus'? focus : rest)) * 360);

  return (
    <div className="rounded-3xl p-8 bg-black/20 backdrop-blur-xl shadow-2xl text-center">
      <h3 className="text-white/90 font-semibold text-xl mb-6">Focus Timer</h3>
      <div className="mx-auto ring mb-6" style={{ '--deg': `${deg}deg` }}>
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <div className="text-4xl font-mono text-white/90">{fmt(remaining)}</div>
        </div>
      </div>
      <div className="flex justify-center gap-3 mb-4">
        <button onClick={running?pause:start} className="px-4 py-2 rounded-full bg-blue-500/90 text-white shadow-lg">{running? 'Pause' : 'Start'}</button>
        <button onClick={reset} className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20">Reset</button>
      </div>
      <div className="flex justify-center gap-2 text-white/80">
        {[{f:25,r:5},{f:50,r:10},{f:90,r:15}].map(p => (
          <button key={p.f} onClick={()=>{setFocus(p.f*60); setRest(p.r*60); setMode('focus'); setRemaining(p.f*60);}} className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20">{p.f}/{p.r}</button>
        ))}
      </div>
    </div>
  );
};

const SleepPanel = ({ ui = {} }) => {
  const { cardBg = 'bg-black/20', titleColor = 'text-white/90', subTextColor = 'text-white/70' } = ui;
  const [noise, setNoise] = useState('ocean');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => () => { try{audioRef.current?.pause();}catch{} }, []);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.loop = true;
      audioRef.current = a;
    }
  };

  const playNoise = async (key) => {
    try {
      ensureAudio();
      const a = audioRef.current;
      a.src = SOUNDS[key].url;
      await a.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const toggle = () => {
    ensureAudio();
    const a = audioRef.current;
    if (playing) {
      try { a.pause(); } catch {}
      setPlaying(false);
    } else {
      playNoise(noise);
    }
  };

  return (
    <div className={`rounded-3xl p-8 ${cardBg} backdrop-blur-xl shadow-2xl`}>
      <h3 className={`${titleColor} font-semibold text-xl mb-4`}>Sleep Preparation</h3>
      <ul className={`list-disc list-inside ${subTextColor} space-y-1 mb-4`}>
        <li>Dim the lights and lower screen brightness</li>
        <li>Practice 4-4-4 breathing for 5 minutes</li>
        <li>Write down 3 things you’re grateful for</li>
        <li>Set a consistent sleep schedule</li>
      </ul>
      <div className={`flex items-center gap-3 mb-3 ${subTextColor}`}>Ambient:
        {Object.keys(SOUNDS).map(k => (
          <button
            key={k}
            onClick={() => { setNoise(k); playNoise(k); }}
            className={`px-3 py-1 rounded-full text-sm ${noise===k ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
          >
            {SOUNDS[k].label}
          </button>
        ))}
      </div>
      <button onClick={toggle} className="px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700">{playing? 'Pause' : 'Play'} Ambient</button>
    </div>
  );
};








const BreathingShapes = ({ running }) => (
  <div className="absolute inset-0 pointer-events-none select-none">
    <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl ${running?'animate-pulse':''}`} />
    <div className={`absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl ${running?'animate-pulse':''}`} />
  </div>
);


export default DeStressZone;
