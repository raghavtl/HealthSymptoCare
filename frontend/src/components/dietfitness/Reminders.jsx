import React, { useEffect, useState } from 'react';
import { dietAndFitnessApi } from '../../services/api';
import { ensureNotificationPermission, scheduleDailyNotification } from '../../utils/notifications';
import { toast } from 'react-toastify';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [waterTime, setWaterTime] = useState('09:00');
  const [mealTime, setMealTime] = useState('13:00');
  const [waterEnabled, setWaterEnabled] = useState(true);
  const [mealEnabled, setMealEnabled] = useState(true);
  const [stoppers, setStoppers] = useState({});
  const [emailSending, setEmailSending] = useState(false);

  const load = async () => {
    try {
      const { data } = await dietAndFitnessApi.getReminders();
      setReminders(data || []);
      const water = (data || []).find(r => r.type === 'water');
      const meal = (data || []).find(r => r.type === 'meal');
      if (water) { setWaterTime(water.time); setWaterEnabled(!!water.enabled); }
      if (meal) { setMealTime(meal.time); setMealEnabled(!!meal.enabled); }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (type, payload) => {
    try {
      await dietAndFitnessApi.saveReminder({ type, ...payload });
      toast.success('Reminder saved');
      load();
    } catch (e) {
      toast.error('Failed to save reminder');
    }
  };

  const toggleNotification = async (type, enabled, time) => {
    // Try to get permission, but also provide a fallback toast if blocked
    const granted = await ensureNotificationPermission();
    // stop previous
    if (stoppers[type]) stoppers[type]();
    if (enabled) {
      const label = type === 'water' ? 'Time to drink water!' : 'Time for your meal!';
      const stop = scheduleDailyNotification(label, time, async () => {
        try {
          const subject = `Health Buddy: ${label}`;
          const text = `${label} (scheduled at ${time}).`;
          await dietAndFitnessApi.sendEmail({ subject, text });
        } catch (_) {
          // ignore email failures here to avoid noisy UX
        }
      });
      setStoppers(prev => ({ ...prev, [type]: stop }));
      if (!granted) {
        toast.info(`${label} (enable notifications for native alerts)`);
      }
    }
  };

  useEffect(() => { toggleNotification('water', waterEnabled, waterTime); }, [waterEnabled, waterTime]);
  useEffect(() => { toggleNotification('meal', mealEnabled, mealTime); }, [mealEnabled, mealTime]);

  const sendTestEmail = async () => {
    try {
      setEmailSending(true);
      const subject = 'Health Buddy: Reminder test';
      const text = `Your current reminders:\n• Water at ${waterTime} (${waterEnabled ? 'enabled' : 'disabled'})\n• Meal at ${mealTime} (${mealEnabled ? 'enabled' : 'disabled'})`;
      const res = await dietAndFitnessApi.sendEmail({ subject, text });
      const preview = res?.data?.previewUrl;
      if (preview) {
        toast.success('Email sent (preview in console)');
        try { console.log('Email preview URL:', preview); } catch(_) {}
      } else {
        toast.success('Email sent to your registered address');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Water & Meal Reminders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Water Reminder</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={waterEnabled} onChange={(e)=>{ setWaterEnabled(e.target.checked); save('water', { time: waterTime, enabled: e.target.checked, frequency: 'daily' }); }} />
              Enabled
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="time" value={waterTime} onChange={(e)=>{ setWaterTime(e.target.value); save('water', { time: e.target.value, enabled: waterEnabled, frequency: 'daily' }); }} className="border rounded px-3 py-2" />
          </div>
          <div className="text-xs text-gray-500 mt-2">Notifications will ring daily at the selected time.</div>
        </div>
        <div className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Meal Reminder</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={mealEnabled} onChange={(e)=>{ setMealEnabled(e.target.checked); save('meal', { time: mealTime, enabled: e.target.checked, frequency: 'daily' }); }} />
              Enabled
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="time" value={mealTime} onChange={(e)=>{ setMealTime(e.target.value); save('meal', { time: e.target.value, enabled: mealEnabled, frequency: 'daily' }); }} className="border rounded px-3 py-2" />
          </div>
          <div className="text-xs text-gray-500 mt-2">Notifications will ring daily at the selected time.</div>
        </div>
      </div>

      <div>
        <button onClick={sendTestEmail} disabled={emailSending} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
          {emailSending ? 'Sending…' : 'Send test email to my account'}
        </button>
      </div>
    </div>
  );
};

export default Reminders;
