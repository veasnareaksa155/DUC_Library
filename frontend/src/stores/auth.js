import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('duc_token') || '');
  const user = ref(JSON.parse(localStorage.getItem('duc_user') || 'null'));
  const loading = ref(false);
  const error = ref('');

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuthData(newToken, userData) {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('duc_token', newToken);
    localStorage.setItem('duc_user', JSON.stringify(userData));
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('duc_token');
    localStorage.removeItem('duc_user');
  }

  async function login(email, password) {
    loading.value = true;
    error.value = '';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setAuthData(data.token, data.user);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(name, email, password) {
    loading.value = true;
    error.value = '';
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setAuthData(data.token, data.user);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkAuth() {
    if (!token.value) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      if (!res.ok) {
        logout();
        return;
      }
      const data = await res.json();
      user.value = data.user;
      localStorage.setItem('duc_user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Failed to verify token:', err);
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth
  };
});
