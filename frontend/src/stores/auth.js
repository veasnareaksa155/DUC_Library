import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const userToken = ref(localStorage.getItem('duc_user_token') || '');
  const userData = ref(JSON.parse(localStorage.getItem('duc_user') || 'null'));

  const adminToken = ref(localStorage.getItem('duc_admin_token') || '');
  const adminData = ref(JSON.parse(localStorage.getItem('duc_admin') || 'null'));

  const context = ref('user'); // 'user' or 'admin'
  const loading = ref(false);
  const error = ref('');
  const sessions = ref([]);

  // --- DYNAMIC CONTEXT GETTERS ---
  // The 'token' and 'user' getters automatically switch based on the current context route
  const token = computed(() => context.value === 'admin' ? adminToken.value : userToken.value);
  const user = computed(() => context.value === 'admin' ? adminData.value : userData.value);

  // Explicit status checks
  const isUserAuthenticated = computed(() => !!userToken.value && !!userData.value);
  const isAdminAuthenticated = computed(() => !!adminToken.value && !!adminData.value);

  // Backward compatible checks (using context)
  const isAuthenticated = computed(() => context.value === 'admin' ? isAdminAuthenticated.value : isUserAuthenticated.value);
  const isAdmin = computed(() => context.value === 'admin' ? isAdminAuthenticated.value : false);

  // --- ACTIONS ---
  function setContext(newContext) {
    if (newContext === 'admin' || newContext === 'user') {
      context.value = newContext;
    }
  }

  function setAuthData(newToken, newUserData, roleContext) {
    if (roleContext === 'admin') {
      adminToken.value = newToken;
      adminData.value = newUserData;
      localStorage.setItem('duc_admin_token', newToken);
      localStorage.setItem('duc_admin', JSON.stringify(newUserData));
    } else {
      userToken.value = newToken;
      userData.value = newUserData;
      localStorage.setItem('duc_user_token', newToken);
      localStorage.setItem('duc_user', JSON.stringify(newUserData));
    }
  }

  function logout(roleContext = context.value) {
    const currentToken = roleContext === 'admin' ? adminToken.value : userToken.value;
    if (currentToken) {
      // Fire-and-forget termination request to the backend
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      }).catch(e => console.error('Logout error:', e));
    }

    if (roleContext === 'admin') {
      adminToken.value = '';
      adminData.value = null;
      localStorage.removeItem('duc_admin_token');
      localStorage.removeItem('duc_admin');
    } else {
      userToken.value = '';
      userData.value = null;
      localStorage.removeItem('duc_user_token');
      localStorage.removeItem('duc_user');
    }
  }

  async function login(email, password, roleContext = context.value) {
    loading.value = true;
    error.value = '';
    try {
      let deviceModel = '';
      if (navigator.userAgentData) {
        try {
          const hints = await navigator.userAgentData.getHighEntropyValues(['model']);
          if (hints && hints.model) deviceModel = hints.model;
        } catch (e) {}
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceModel })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.require2FA) {
        return data;
      }

      setAuthData(data.token, data.user, roleContext);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loginUser(email, password) {
    return login(email, password, 'user');
  }

  async function loginAdmin(email, password) {
    loading.value = true;
    error.value = '';
    try {
      let deviceModel = '';
      if (navigator.userAgentData) {
        try {
          const hints = await navigator.userAgentData.getHighEntropyValues(['model']);
          if (hints && hints.model) deviceModel = hints.model;
        } catch (e) {}
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceModel })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      if (data.require2FA) {
        return data;
      }

      setAuthData(data.token, data.user, 'admin');
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function verify2FALogin(tempToken, code, roleContext) {
    loading.value = true;
    error.value = '';
    try {
      let deviceModel = '';
      if (navigator.userAgentData) {
        try {
          const hints = await navigator.userAgentData.getHighEntropyValues(['model']);
          if (hints && hints.model) deviceModel = hints.model;
        } catch (e) {}
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/2fa/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code, clientHintModel: deviceModel })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid 2FA code');
      }

      setAuthData(data.token, data.user, roleContext);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function check2FAStatus() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/2fa/status`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      });
      const data = await res.json();
      return data.enabled;
    } catch (err) {
      return false;
    }
  }

  async function generate2FA() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/2fa/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token.value}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate 2FA');
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function verify2FASetup(code) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/2fa/verify-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.value}` },
        body: JSON.stringify({ token: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify');
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function disable2FA() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token.value}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable');
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function register(name, email, password) {
    loading.value = true;
    error.value = '';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setAuthData(data.token, data.user, 'user');
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function verifyToken(tokenToVerify, roleContext) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      if (!res.ok) {
        // Only log out if token is explicitly invalid/expired (401 or 403).
        // Do NOT log out on 500 (Google Sheets API error/rate limit) or 404.
        if (res.status === 401 || res.status === 403) {
          logout(roleContext);
        }
        return;
      }
      const data = await res.json();
      
      if (roleContext === 'admin') {
        adminData.value = data.user;
        localStorage.setItem('duc_admin', JSON.stringify(data.user));
      } else {
        userData.value = data.user;
        localStorage.setItem('duc_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error(`Failed to verify ${roleContext} token:`, err);
    }
  }

  async function checkAuth() {
    const promises = [];
    if (userToken.value) {
      promises.push(verifyToken(userToken.value, 'user'));
    }
    if (adminToken.value) {
      promises.push(verifyToken(adminToken.value, 'admin'));
    }
    await Promise.all(promises);
  }

  async function fetchSessions() {
    if (!token.value) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/sessions`, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      if (res.ok) {
        sessions.value = await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  }
  
  async function terminateSession(sessionId) {
    if (!token.value) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` }
      });
      if (res.ok) {
        sessions.value = sessions.value.filter(s => s.id !== sessionId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to terminate session', err);
      return false;
    }
  }

  async function updateProfilePhoto(base64Image) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/profile-photo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ profile_photo: base64Image })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile photo');
      
      if (context.value === 'admin') {
        adminData.value = data.user;
        localStorage.setItem('duc_admin', JSON.stringify(data.user));
      } else {
        userData.value = data.user;
        localStorage.setItem('duc_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  return {
    userToken,
    userData,
    adminToken,
    adminData,
    context,
    token,
    user,
    loading,
    error,
    isUserAuthenticated,
    isAdminAuthenticated,
    isAuthenticated,
    isAdmin,
    setContext,
    setAuthData,
    login,
    loginUser,
    loginAdmin,
    verify2FALogin,
    check2FAStatus,
    generate2FA,
    verify2FASetup,
    disable2FA,
    register,
    logout,
    checkAuth,
    sessions,
    fetchSessions,
    terminateSession,
    updateProfilePhoto
  };
});
