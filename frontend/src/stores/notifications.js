import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './auth';

export const useNotificationsStore = defineStore('notifications', () => {
  const isDrawerOpen = ref(false);
  const notifications = ref([]);
  
  const authStore = useAuthStore();

  function getStorageKey() {
    const userId = authStore.user?.id || 'guest';
    return `duc_notifications_${userId}`;
  }

  function loadNotifications() {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      notifications.value = JSON.parse(stored);
      // Migrate old ones without timestamp
      notifications.value = notifications.value.map(n => {
        if (!n.timestamp) n.timestamp = Date.now();
        return n;
      });
    } else {
      notifications.value = [
        {
          id: 1,
          title: 'Welcome to DUC Library! 📚',
          message: 'Explore hundreds of e-books, read online, and reserve physical copies with ease.',
          timestamp: Date.now() - 60000,
          read: false,
          type: 'info'
        },
        {
          id: 2,
          title: 'New Featured Books Added ⭐',
          message: 'Check out the popular shelf on the Home page for newly featured university books.',
          timestamp: Date.now() - 7200000,
          read: false,
          type: 'featured'
        },
        {
          id: 3,
          title: 'Easy Book Borrowing System 🔖',
          message: 'Submit a borrowing request anytime. Library staff will prepare your physical book for pickup.',
          timestamp: Date.now() - 86400000,
          read: false,
          type: 'system'
        }
      ];
      saveNotifications();
    }
  }

  // Load immediately for current user
  loadNotifications();

  // Reload when the user changes (login/logout)
  watch(() => authStore.user?.id, () => {
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

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true);
    saveNotifications();
  }

  function markAsRead(id) {
    const item = notifications.value.find(n => n.id === id);
    if (item) {
      item.read = true;
      saveNotifications();
    }
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter(n => n.id !== id);
    saveNotifications();
  }

  function clearAll() {
    notifications.value = [];
    saveNotifications();
  }

  function addNotification(notif) {
    notifications.value.unshift({
      id: Date.now(),
      timestamp: Date.now(),
      read: false,
      type: 'info',
      ...notif
    });
    saveNotifications();
  }

  function saveNotifications() {
    localStorage.setItem(getStorageKey(), JSON.stringify(notifications.value));
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
    addNotification
  };
});
