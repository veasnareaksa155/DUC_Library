import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('duc_theme') !== 'light');

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    setTheme(!isDark.value);
  }

  function setTheme(dark) {
    isDark.value = dark;
    const themeName = dark ? 'dark' : 'light';
    localStorage.setItem('duc_theme', themeName);
    applyTheme(dark);
  }

  // Initialize theme on load
  applyTheme(isDark.value);

  return {
    isDark,
    toggleTheme,
    applyTheme,
    setTheme
  };
});
