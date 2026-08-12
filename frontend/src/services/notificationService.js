import { useNotificationsStore } from '../stores/notifications';
import { useAuthStore } from '../stores/auth';

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

export async function sendPhoneAndDrawerNotification({ title, message, type = 'info', icon = '/duc-logo.png', target_user_id = null }) {
  // 1. Add to local notification drawer store
  try {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id;

    if (target_user_id && String(target_user_id) !== String(currentUserId)) {
      // Admin is sending notification to another user - save directly to their localStorage
      const key = `duc_notifications_${target_user_id}`;
      const existingStr = localStorage.getItem(key);
      const existing = existingStr ? JSON.parse(existingStr) : [];
      
      existing.unshift({
        id: Date.now(),
        timestamp: Date.now(),
        title,
        message,
        type,
        read: false
      });
      
      localStorage.setItem(key, JSON.stringify(existing));
    } else {
      // Add to current user's active store
      const notifStore = useNotificationsStore();
      notifStore.addNotification({
        title,
        message,
        type
      });
    }
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
