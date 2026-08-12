import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './auth';

export const useNotificationsStore = defineStore('notifications', () => {
  const isDrawerOpen = ref(false);
  const notifications = ref([]);
  
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
  }

  // Reload when the user changes (login/logout)
  watch(() => authStore.token, () => {
    loadNotifications();
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
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      notifications.value.forEach(n => n.read = true);
    } catch (err) {
      console.error(err);
    }
  }

  async function markAsRead(id) {
    if (!authStore.token) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      const item = notifications.value.find(n => n.id === id);
      if (item) {
        item.read = true;
      }
    } catch (err) {
      console.error(err);
    }
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter(n => n.id !== id);
  }

  function clearAll() {
    notifications.value = [];
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
    loadNotifications
  };
});
