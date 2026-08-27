import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {},
    loading: false,
    error: null,
  }),
  getters: {
    borrowingDurations: (state) => {
      // Default fallback
      const def = [7, 14, 21, 30];
      if (!state.settings || !state.settings.borrowing_durations) return def;
      
      let val = state.settings.borrowing_durations;
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch(e) { return def; }
      }
      return Array.isArray(val) && val.length > 0 ? val : def;
    }
  },
  actions: {
    async fetchSettings() {
      this.loading = true;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        this.settings = await res.json();
        this.error = null;
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async updateSetting(key, value) {
      const authStore = useAuthStore();
      this.loading = true;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({ setting_key: key, setting_value: value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update setting');
        // Update local cache
        this.settings[key] = data.setting_value;
        this.error = null;
        return data;
      } catch (err) {
        this.error = err.message;
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    }
  }
});
