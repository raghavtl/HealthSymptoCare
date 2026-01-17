import React, { useEffect, useRef, useState } from 'react';
import { dietAndFitnessApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const fmtDate = (d) => new Date(d).toLocaleDateString();

const DietFitnessDashboard = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState(7);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef(null);

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const [{ data: statsData }, { data: profileData }] = await Promise.all([
        dietAndFitnessApi.getDashboardStats(range),
        dietAndFitnessApi.getProfile()
      ]);
      setStats(statsData);
      setProfile(profileData || null);
    } catch (e) {
      setError('No dashboard data yet. Start by logging food, water, weight, or workouts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { (async () => await load())(); }, [range]);

  const daysBetween = () => {
    if (!stats) return [];
    const res = [];
    const start = new Date(stats.startDate);
    const end = new Date(stats.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) res.push(d.toISOString().slice(0,10));
    return res;
  };

  const valueFor = (arr, date, key) => (arr?.find(r => r.date === date)?.[key]) ?? 0;

  const downloadCSV = () => {
    if (!stats) return;
    const rows = [];
    rows.push(['Date','Calories (actual)','Target Calories','Water (ml)','Weight (kg)','Workouts']);
    daysBetween().forEach(d => {
      rows.push([
        fmtDate(d),
        valueFor(stats.calories, d, 'calories'),
        profile?.target_calories ?? '-',
        valueFor(stats.water, d, 'total_ml'),
        valueFor(stats.weight, d, 'weight_kg'),
        valueFor(stats.workouts, d, 'completed'),
      ]);
    });
    const csvContent = rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthSymptoCare_DietFitness_Report_${stats.startDate}_to_${stats.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const el = reportRef.current;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20; // 10mm margins
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let position = 10;
    pdf.setFontSize(14);
    pdf.text('HealthSymptomCare - Diet & Fitness Report', 10, position);
    position += 6;

    if (imgHeight < pageHeight - position - 10) {
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    } else {
      // Handle multi-page
      let remainingHeight = imgHeight;
      let sY = 0;
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      const ratio = imgWidth / canvas.width;
      const pageImgHeight = pageHeight - position - 10;
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageImgHeight / ratio;

      let firstPage = true;
      while (remainingHeight > 0) {
        pageCtx.clearRect(0,0,pageCanvas.width,pageCanvas.height);
        pageCtx.drawImage(canvas, 0, -sY, canvas.width, canvas.height);
        const pageData = pageCanvas.toDataURL('image/png');
        if (!firstPage) {
          pdf.addPage();
          position = 10;
        }
        pdf.addImage(pageData, 'PNG', 10, position, imgWidth, pageImgHeight);
        remainingHeight -= pageImgHeight;
        sY += pageCanvas.height;
        firstPage = false;
      }
    }

    pdf.save(`HealthSymptoCare_DietFitness_Report_${stats.startDate}_to_${stats.endDate}.pdf`);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/diet-fitness')} className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Diet & Fitness Report</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadCSV} className="px-3 py-2 border rounded hover:bg-gray-50">Download CSV</button>
          <button onClick={downloadPDF} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Download PDF</button>
          <select value={range} onChange={(e)=>setRange(parseInt(e.target.value,10))} className="border rounded px-3 py-2">
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {loading && <div className="animate-pulse h-24 bg-gray-100 rounded" />}

      {!loading && error && (
        <div className="border border-amber-300 bg-amber-50 text-amber-800 p-3 rounded">{error}</div>
      )}

      {!loading && stats && (
        <div ref={reportRef} className="space-y-6">
          {/* Profile Summary */}
          {profile && (
            <div className="bg-white border rounded p-3">
              <div className="font-semibold mb-2">Profile & Targets</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Age</div><div>{profile.age ?? '-'}</div>
                <div className="text-gray-500">Gender</div><div className="capitalize">{profile.gender ?? '-'}</div>
                <div className="text-gray-500">Height</div><div>{profile.height_cm ? `${profile.height_cm} cm` : '-'}</div>
                <div className="text-gray-500">Weight</div><div>{profile.weight_kg ? `${profile.weight_kg} kg` : '-'}</div>
                <div className="text-gray-500">Activity</div><div className="capitalize">{profile.activity_level ?? '-'}</div>
                <div className="text-gray-500">Diet</div><div className="capitalize">{profile.dietary_preference ?? '-'}</div>
                <div className="text-gray-500">Goal</div><div className="capitalize">{profile.goal ?? '-'}</div>
                <div className="text-gray-500">Target Calories</div><div>{profile.target_calories ?? '-'}</div>
                <div className="text-gray-500">Protein</div><div>{profile.target_protein_g ? `${profile.target_protein_g} g` : '-'}</div>
                <div className="text-gray-500">Carbs</div><div>{profile.target_carbs_g ? `${profile.target_carbs_g} g` : '-'}</div>
                <div className="text-gray-500">Fat</div><div>{profile.target_fat_g ? `${profile.target_fat_g} g` : '-'}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white border rounded p-3">
              <div className="text-xs text-gray-500">Period</div>
              <div className="font-semibold">{fmtDate(stats.startDate)} — {fmtDate(stats.endDate)}</div>
            </div>
            <div className="bg-white border rounded p-3">
              <div className="text-xs text-gray-500">Total Calories</div>
              <div className="font-semibold">{(stats.calories||[]).reduce((s,x)=>s+(x.calories||0),0)}</div>
            </div>
            <div className="bg-white border rounded p-3">
              <div className="text-xs text-gray-500">Total Water (ml)</div>
              <div className="font-semibold">{(stats.water||[]).reduce((s,x)=>s+(x.total_ml||0),0)}</div>
            </div>
            <div className="bg-white border rounded p-3">
              <div className="text-xs text-gray-500">Workouts Completed</div>
              <div className="font-semibold">{(stats.workouts||[]).reduce((s,x)=>s+(x.completed||0),0)}</div>
            </div>
          </div>

          <div className="bg-white border rounded">
            <div className="p-3 font-semibold border-b">Daily Breakdown</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Calories (actual)</th>
                    <th className="text-left px-3 py-2">Target Calories</th>
                    <th className="text-left px-3 py-2">Water (ml)</th>
                    <th className="text-left px-3 py-2">Weight (kg)</th>
                    <th className="text-left px-3 py-2">Workouts</th>
                  </tr>
                </thead>
                <tbody>
                  {daysBetween().map(d => (
                    <tr key={d} className="border-t">
                      <td className="px-3 py-2">{fmtDate(d)}</td>
                      <td className="px-3 py-2">{valueFor(stats.calories, d, 'calories')}</td>
                      <td className="px-3 py-2 text-gray-500">{profile?.target_calories ?? '-'}</td>
                      <td className="px-3 py-2">{valueFor(stats.water, d, 'total_ml')}</td>
                      <td className="px-3 py-2">{valueFor(stats.weight, d, 'weight_kg')}</td>
                      <td className="px-3 py-2">{valueFor(stats.workouts, d, 'completed')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 text-gray-700 p-3 rounded text-xs">
            Note: This report summarizes your logs for the selected period. If values are 0, try adding entries from Diet & Fitness → Food Log, Water intake, or schedule workouts, then return here.
          </div>
        </div>
      )}
    </div>
  );
};

export default DietFitnessDashboard;
