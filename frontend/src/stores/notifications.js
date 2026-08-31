import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './auth';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useNotificationsStore = defineStore('notifications', () => {
  const isDrawerOpen = ref(false);
  const notifications = ref([]);
  const pushPermission = ref('Notification' in window ? Notification.permission : 'default');
  
  const authStore = useAuthStore();

  async function loadNotifications() {
    if (!authStore.token) {
      notifications.value = [];
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        notifications.value = data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.created_at).getTime(),
          read: n.is_read === 'true',
          type: n.type
        }));
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }

  // Load immediately if user exists
  if (authStore.token) {
    loadNotifications();
    if ('Notification' in window && Notification.permission === 'granted') {
      subscribeToPushNotifications();
    }
  }

  // Reload when the user changes (login/logout)
  watch(() => authStore.token, (newToken) => {
    loadNotifications();
    if (newToken) {
      if ('Notification' in window && Notification.permission === 'granted') {
        subscribeToPushNotifications();
      }
    } else {
      unsubscribeFromPushNotifications();
    }
  });

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value;
  }

  function openDrawer() {
    isDrawerOpen.value = true;
  }

  function closeDrawer() {
    isDrawerOpen.value = false;
  }

  async function markAllAsRead() {
    if (!authStore.token) return;
    // Optimistic UI update
    notifications.value.forEach(n => n.read = true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function markAsRead(id) {
    if (!authStore.token) return;
    
    // Optimistic UI update
    const item = notifications.value.find(n => n.id === id);
    if (item) {
      item.read = true;
    }

    try {
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function removeNotification(id) {
    if (!authStore.token) return;
    
    // Optimistic UI update
    const previousState = [...notifications.value];
    notifications.value = notifications.value.filter(n => n.id !== id);
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
    } catch (err) {
      console.error(err);
      // Revert on failure
      notifications.value = previousState;
    }
  }

  async function clearAll() {
    if (!authStore.token) return;
    
    // Optimistic UI update
    const previousState = [...notifications.value];
    notifications.value = [];
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
    } catch (err) {
      console.error(err);
      // Revert on failure
      notifications.value = previousState;
    }
  }

  function addNotification(notif) {
    notifications.value.unshift({
      id: Date.now(),
      timestamp: Date.now(),
      read: false,
      type: 'info',
      ...notif
    });
  }

  async function subscribeToPushNotifications() {
    if (!authStore.token || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }
    
    try {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      const registration = await navigator.serviceWorker.register(swUrl);
      
      const permission = await Notification.requestPermission();
      pushPermission.value = permission;
      
      if (permission !== 'granted') {
        console.warn('Push notification permission denied');
        return;
      }
      
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) return;
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }
      
      // Send subscription to backend
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(subscription)
      });
      console.log('Successfully subscribed to push notifications');
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
    }
  }

  async function unsubscribeFromPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications:', err);
    }
  }

  return {
    isDrawerOpen,
    notifications,
    unreadCount,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    markAllAsRead,
    markAsRead,
    removeNotification,
    clearAll,
    addNotification,
    loadNotifications,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    pushPermission
  };
});
