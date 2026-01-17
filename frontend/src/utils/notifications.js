export async function ensureNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function scheduleDailyNotification(label, timeHHMM, onFire) {
  // Schedules a setTimeout for the next occurrence of the given time today/tomorrow
  // Works even if Notifications are blocked by still invoking onFire (so caller can send email/toast)
  const notificationsSupported = 'Notification' in window;

  const computeDelay = () => {
    const now = new Date();
    const [hh, mm] = timeHHMM.split(':').map(v => parseInt(v, 10));
    const next = new Date();
    next.setHours(hh, mm, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.getTime() - now.getTime();
  };

  let timeoutId = null;
  const schedule = () => {
    timeoutId = setTimeout(() => {
      try {
        if (notificationsSupported && Notification.permission === 'granted') {
          new Notification(label || 'Health reminder');
        }
      } catch (_) {}
      try { if (typeof onFire === 'function') onFire(); } catch (_) {}
      schedule(); // schedule for next day
    }, computeDelay());
  };
  schedule();

  return () => { if (timeoutId) clearTimeout(timeoutId); };
}
