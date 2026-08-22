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

  async function fetchMyBorrowings() {
    loading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/borrowings/my`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch borrowings');
      myBorrowings.value = data;
    } catch (err) {
      error.value = err.message;
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
  async function fetchAdminDashboardStats() {
    loading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        dashboardStats.value = data;
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchAdminBorrowings(statusFilter = 'all') {
    loading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/borrowings?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch admin borrowings');
      adminBorrowings.value = data;
    } catch (err) {
      error.value = err.message;
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
      await fetchAdminBorrowings();
      await fetchAdminDashboardStats();
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
      await fetchAdminBorrowings();
      await fetchAdminDashboardStats();
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
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
