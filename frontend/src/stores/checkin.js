import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';

export const useCheckinStore = defineStore('checkin', () => {
  const isCheckingIn = ref(false);
  const checkinResult = ref(null);
  const error = ref('');
  const hasCheckedInToday = ref(false);
  const myCheckins = ref([]);

  const authStore = useAuthStore();

  async function checkMyStatusToday() {
    if (!authStore.token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/checkins/my-today`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        myCheckins.value = data;
        hasCheckedInToday.value = data.length > 0;
      }
    } catch (err) {
      console.error('Failed to check today status:', err);
    }
  }

  async function verifyCheckin(lat, lng) {
    isCheckingIn.value = true;
    error.value = '';
    checkinResult.value = null;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/checkins/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ lat, lng })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to check in');
      }

      checkinResult.value = data;
      hasCheckedInToday.value = true;
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      isCheckingIn.value = false;
    }
  }

  const isCheckinModalOpen = ref(false);

  function openModal() {
    isCheckinModalOpen.value = true;
  }

  function closeModal() {
    isCheckinModalOpen.value = false;
  }

  return {
    isCheckingIn,
    checkinResult,
    error,
    hasCheckedInToday,
    myCheckins,
    isCheckinModalOpen,
    checkMyStatusToday,
    verifyCheckin,
    openModal,
    closeModal
  };
});
