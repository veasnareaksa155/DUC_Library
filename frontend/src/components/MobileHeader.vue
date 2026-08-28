<template>
  <header class="hidden max-md:flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-[60]">
    <div class="flex items-center gap-2 cursor-pointer" @click="goHome">
      <img src="/duc-logo.png" alt="DUC Logo" class="h-[28px] w-auto" />
      <span class="text-[1rem] font-bold text-[var(--text-primary)] tracking-tight">DUC Library</span>
    </div>

    <div class="flex items-center gap-1.5">


      <!-- Notification Button -->
      <button v-if="authStore.isAuthenticated" @click="notifStore.toggleDrawer()" class="relative inline-flex items-center justify-center w-8 h-8 rounded-md bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors border-none" title="Notifications">
        <Bell :size="18" />
        <span v-if="notifStore.unreadCount > 0" class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
      </button>

      <!-- Settings Button -->
      <button v-if="authStore.isAuthenticated" @click="isSettingsOpen = true" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors border-none" title="Account Settings">
        <Settings :size="18" />
      </button>

    </div>

    <SettingsModal :isOpen="isSettingsOpen" @close="isSettingsOpen = false" />
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
import { Globe, Sun, Moon, Bell, LogOut, Settings } from 'lucide-vue-next';
import SettingsModal from './SettingsModal.vue';
import { ref } from 'vue';

defineEmits(['toast']);

const router = useRouter();
const localeStore = useLocaleStore();
const themeStore = useThemeStore();
const booksStore = useBooksStore();
const notifStore = useNotificationsStore();
const authStore = useAuthStore();
const isSettingsOpen = ref(false);

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

