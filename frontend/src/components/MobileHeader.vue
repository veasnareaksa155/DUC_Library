<template>
  <header class="hidden max-md:flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] backdrop-blur-[16px] border-b border-[var(--border-color)] sticky top-0 z-[60]">
    <div class="flex items-center gap-2 cursor-pointer" @click="goHome">
      <img src="/duc-logo.png" alt="DUC Logo" class="h-[30px] w-auto" />
      <span class="text-[1.05rem] font-extrabold text-[var(--text-primary)]">DUC Library</span>
    </div>

    <div class="flex items-center gap-2">
      <!-- Language / Region Switcher Chip -->
      <button 
        @click="localeStore.toggleLanguage()" 
        class="inline-flex items-center justify-center gap-[0.35rem] px-2.5 h-[32px] rounded-full bg-[rgba(125,125,125,0.12)] border border-[var(--border-color)] text-[var(--text-primary)] text-[0.78rem] font-bold cursor-pointer transition-all duration-200 active:scale-95 active:bg-indigo-500/20" 
        :title="localeStore.currentLang === 'en' ? 'Switch to Khmer (ភាសាខ្មែរ)' : 'Switch to English'"
      >
        <Globe :size="16" />
        <span>{{ localeStore.currentLang === 'en' ? 'EN' : 'ខ្មែរ' }}</span>
      </button>

      <!-- Theme Mode (Light / Dark) Toggle Button -->
      <button 
        @click="themeStore.toggleTheme()" 
        class="inline-flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[rgba(125,125,125,0.12)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer transition-all duration-200 active:scale-95 active:bg-indigo-500/20"
        :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <Sun v-if="themeStore.isDark" :size="20" class="text-amber-500" />
        <Moon v-else :size="20" class="text-indigo-400" />
      </button>

      <!-- Notification Badge Button -->
      <button v-if="authStore.isAuthenticated" @click="notifStore.toggleDrawer()" class="relative inline-flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[rgba(125,125,125,0.12)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer" title="Notifications">
        <Bell :size="20" />
        <span v-if="notifStore.unreadCount > 0" class="absolute -top-[2px] -right-[2px] min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[0.58rem] font-extrabold flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)]">
          {{ notifStore.unreadCount }}
        </span>
      </button>

      <!-- Logout Button (Only if authenticated) -->
      <button v-if="authStore.isAuthenticated" @click="handleLogout" class="relative inline-flex items-center justify-center w-[32px] h-[32px] rounded-full bg-red-500/10 border border-red-500/20 text-red-500 cursor-pointer transition-all duration-200 active:scale-95 active:bg-red-500/20 ml-1" title="Log Out">
        <LogOut :size="18" />
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
import { useAuthStore } from '../stores/auth';
import { useConfirmStore } from '../stores/confirm';
import { Globe, Sun, Moon, Bell, LogOut } from 'lucide-vue-next';

defineEmits(['toast']);

const router = useRouter();
const localeStore = useLocaleStore();
const themeStore = useThemeStore();
const booksStore = useBooksStore();
const notifStore = useNotificationsStore();
const authStore = useAuthStore();

function goHome() {
  booksStore.selectedCategory = 'all';
  router.push('/');
}

async function handleLogout() {
  const confirmStore = useConfirmStore();
  const confirmed = await confirmStore.showConfirm({
    title: 'Log Out',
    message: 'Are you sure you want to log out of your account?',
    confirmText: 'Log Out',
    type: 'danger'
  });

  if (confirmed) {
    authStore.logout();
    router.push('/login');
  }
}
</script>

