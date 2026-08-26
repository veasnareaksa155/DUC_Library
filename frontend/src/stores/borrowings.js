import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';

export const useBorrowingsStore = defineStore('borrowings', () => {
  const myBorrowings = ref([]);
  const adminBorrowings = ref([]);
  const dashboardStats = ref(null);
  const loading = ref(false);
  const error = ref('');

  const authStore = useAuthStore();

  async function fetchMyBorrowings(forceLoader = false) {
    // 1. Attempt to load from localStorage first for instant display
    if (!forceLoader && myBorrowings.value.length === 0) {
      try {
        const cached = localStorage.getItem('library_my_borrowings_cache');
        if (cached) {
          myBorrowings.value = JSON.parse(cached);
        }
      } catch (e) {
        console.warn('Failed to parse cached borrowings', e);
      }
    }

    if (myBorrowings.value.length === 0 || forceLoader) {
      loading.value = true;
    }
    error.value = '';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/borrowings/my`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch borrowings');
      myBorrowings.value = data;
      // 2. Update cache with fresh data
      localStorage.setItem('library_my_borrowings_cache', JSON.stringify(data));
    } catch (err) {
      if (myBorrowings.value.length === 0) {
        error.value = err.message;
      }
    } finally {
      loading.value = false;
    }
  }

  async function requestBorrow(bookId, days = 14) {
    loading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/borrowings/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ book_id: bookId, days })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request borrow');
      await fetchMyBorrowings();
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function returnBook(borrowingId) {
    loading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/borrowings/${borrowingId}/return`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to return book');
      await fetchMyBorrowings();
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Admin Actions
  async function fetchAdminDashboardStats(forceLoader = false) {
    if (!forceLoader && !dashboardStats.value) {
      try {
        const cached = localStorage.getItem('library_admin_stats_cache');
        if (cached) dashboardStats.value = JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached admin stats', e);
      }
    }

    if (!dashboardStats.value || forceLoader) {
      loading.value = true;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        dashboardStats.value = data;
        localStorage.setItem('library_admin_stats_cache', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchAdminBorrowings(statusFilter = 'all', forceLoader = false) {
    const cacheKey = `library_admin_borrowings_cache_${statusFilter}`;
    
    if (!forceLoader && adminBorrowings.value.length === 0) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) adminBorrowings.value = JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached admin borrowings', e);
      }
    }

    if (adminBorrowings.value.length === 0 || forceLoader) {
      loading.value = true;
    }
    error.value = '';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/borrowings?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch admin borrowings');
      adminBorrowings.value = data;
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      if (adminBorrowings.value.length === 0) {
        error.value = err.message;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateBorrowStatus(id, status, notes = '') {
    loading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/borrowings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ status, admin_notes: notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update borrowing status');
      await fetchAdminBorrowings('all', true);
      await fetchAdminDashboardStats(true);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteBorrowing(id) {
    loading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/borrowings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete borrowing request');
      await fetchAdminBorrowings('all', true);
      await fetchAdminDashboardStats(true);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Fetch on window focus to ensure fresh data
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (authStore.token) {
        if (myBorrowings.value.length > 0) fetchMyBorrowings(false);
        if (adminBorrowings.value.length > 0) fetchAdminBorrowings('all', false);
        if (dashboardStats.value) fetchAdminDashboardStats(false);
      }
    });
  }

  return {
    myBorrowings,
    adminBorrowings,
    dashboardStats,
    loading,
    error,
    fetchMyBorrowings,
    requestBorrow,
    returnBook,
    fetchAdminDashboardStats,
    fetchAdminBorrowings,
    updateBorrowStatus,
    updateBorrowingStatus: updateBorrowStatus,
    deleteBorrowing
  };
});
