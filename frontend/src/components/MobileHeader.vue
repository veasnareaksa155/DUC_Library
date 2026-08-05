<template>
  <header class="mobile-mini-app-header">
    <div class="mobile-brand" @click="goHome">
      <img src="/duc-logo.png" alt="DUC Logo" class="mobile-logo-img" />
      <span class="mobile-app-title">DUC Library</span>
    </div>

    <div class="mobile-actions">
      <!-- Language / Region Switcher Chip -->
      <button 
        @click="localeStore.toggleLanguage()" 
        class="mobile-action-chip" 
        :title="localeStore.currentLang === 'en' ? 'Switch to Khmer (ភាសាខ្មែរ)' : 'Switch to English'"
      >
        <Globe :size="14" />
        <span>{{ localeStore.currentLang === 'en' ? 'EN' : 'ខ្មែរ' }}</span>
      </button>

      <!-- Theme Mode (Light / Dark) Toggle Button -->
      <button 
        @click="themeStore.toggleTheme()" 
        class="mobile-action-chip theme-chip"
        :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <Sun v-if="themeStore.isDark" :size="15" class="sun-icon" />
        <Moon v-else :size="15" class="moon-icon" />
      </button>

      <!-- Notification Badge Button -->
      <button @click="notifStore.toggleDrawer()" class="mobile-icon-badge" title="Notifications">
        <Bell :size="17" />
        <span v-if="notifStore.unreadCount > 0" class="badge-dot-count">
          {{ notifStore.unreadCount }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../stores/locale';
import { useThemeStore } from '../stores/theme';
import { useBooksStore } from '../stores/books';
import { useNotificationsStore } from '../stores/notifications';
import { Globe, Sun, Moon, Bell } from 'lucide-vue-next';

defineEmits(['toast']);

const router = useRouter();
const localeStore = useLocaleStore();
const themeStore = useThemeStore();
const booksStore = useBooksStore();
const notifStore = useNotificationsStore();

function goHome() {
  booksStore.selectedCategory = 'all';
  router.push('/');
}
</script>

<style scoped>
.mobile-mini-app-header {
  display: none;
}

@media (max-width: 768px) {
  .mobile-mini-app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--bg-card);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .mobile-logo-img {
    height: 30px;
    width: auto;
  }

  .mobile-app-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .mobile-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .mobile-action-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 9999px;
    background: rgba(125, 125, 125, 0.12);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mobile-action-chip:active {
    transform: scale(0.95);
    background: rgba(99, 102, 241, 0.2);
  }

  .sun-icon {
    color: #f59e0b;
  }

  .moon-icon {
    color: #818cf8;
  }

  .mobile-icon-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(125, 125, 125, 0.12);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    cursor: pointer;
  }

  .badge-dot-count {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 9999px;
    background: #ef4444;
    color: #ffffff;
    font-size: 0.58rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  }
}
</style>
