import { useNotificationsStore } from '../stores/notifications';

export async function requestPhoneNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser/device does not support phone system notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function sendPhoneAndDrawerNotification({ title, message, type = 'info', icon = '/duc-logo.png' }) {
  // 1. Add to local notification drawer store
  try {
    const notifStore = useNotificationsStore();
    notifStore.addNotification({
      title,
      message,
      type
    });
  } catch (e) {
    console.warn('Store add notification warning:', e);
  }

  // 2. Trigger native OS / Phone System Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body: message,
          icon: icon,
          badge: icon,
          vibrate: [200, 100, 200],
          tag: 'duc-library-notif-' + Date.now()
        });
      } else {
        new Notification(title, {
          body: message,
          icon: icon,
          vibrate: [200, 100, 200]
        });
      }
    } catch (err) {
      console.warn('Native phone notification failed:', err);
    }
  }
}
