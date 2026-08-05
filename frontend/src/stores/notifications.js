import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNotificationsStore = defineStore('notifications', () => {
  const isDrawerOpen = ref(false);
  const notifications = ref(JSON.parse(localStorage.getItem('duc_notifications')) || [
    {
      id: 1,
      title: 'Welcome to DUC Library! 📚',
      message: 'Explore hundreds of e-books, read online, and reserve physical copies with ease.',
      time: 'Just now',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'New Featured Books Added ⭐',
      message: 'Check out the popular shelf on the Home page for newly featured university books.',
      time: '2 hours ago',
      read: false,
      type: 'featured'
    },
    {
      id: 3,
      title: 'Easy Book Borrowing System 🔖',
      message: 'Submit a borrowing request anytime. Library staff will prepare your physical book for pickup.',
      time: '1 day ago',
      read: false,
      type: 'system'
    }
  ]);

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
      time: 'Just now',
      read: false,
      type: 'info',
      ...notif
    });
    saveNotifications();
  }

  function saveNotifications() {
    localStorage.setItem('duc_notifications', JSON.stringify(notifications.value));
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
