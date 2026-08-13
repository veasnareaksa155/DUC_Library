<template>
  <header class="sticky top-0 z-50 bg-[var(--bg-card)] backdrop-blur-md border-b border-[var(--border-color)] py-3.5 transition-colors duration-300 hidden md:block">
    <div class="max-w-[1280px] mx-auto px-4 lg:px-6 flex items-center justify-between w-full">
      
      <!-- Left Section: Logo + Navigation -->
      <div class="flex items-center gap-4 lg:gap-10">
        <router-link to="/" class="flex items-center gap-2 lg:gap-3 no-underline group shrink-0" @click="goHome">
          <img src="/duc-logo.png" alt="DUC Logo" class="h-[44px] lg:h-[52px] w-auto object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-105" />
          <span class="text-[1.2rem] lg:text-[1.35rem] font-extrabold text-[var(--text-primary)] whitespace-nowrap">DUC<span class="bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent">Library</span></span>
        </router-link>

        <nav class="flex items-center gap-0.5 lg:gap-1">
        <button 
          @click="goHome" 
          class="group flex items-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-2 rounded-xl text-[0.85rem] lg:text-[0.92rem] transition-all duration-300 bg-transparent border-none font-inherit cursor-pointer relative overflow-hidden whitespace-nowrap" 
          :class="route.path === '/' && booksStore.selectedCategory !== 'wishlist' ? 'text-indigo-600 font-semibold bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/15' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 font-medium'"
        >
          <Home :size="18" :stroke-width="1.75" :class="route.path === '/' && booksStore.selectedCategory !== 'wishlist' ? 'fill-indigo-500/10' : 'group-hover:-translate-y-0.5 transition-transform duration-300'" />
          <span class="hidden lg:inline">{{ localeStore.t('home') || 'Home' }}</span>
        </button>

        <button 
          @click="goCatalog" 
          class="group flex items-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-2 rounded-xl text-[0.85rem] lg:text-[0.92rem] transition-all duration-300 bg-transparent border-none font-inherit cursor-pointer relative overflow-hidden whitespace-nowrap" 
          :class="route.path === '/catalog' && booksStore.selectedCategory !== 'wishlist' ? 'text-indigo-600 font-semibold bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/15' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 font-medium'"
        >
          <Compass :size="18" :stroke-width="1.75" :class="route.path === '/catalog' && booksStore.selectedCategory !== 'wishlist' ? 'fill-indigo-500/10' : 'group-hover:-translate-y-0.5 transition-transform duration-300'" />
          <span class="hidden lg:inline">{{ localeStore.t('catalog') }}</span>
        </button>

        <router-link v-if="authStore.isAuthenticated && authStore.user?.role !== 'admin'" to="/my-borrowings" class="group flex items-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-2 rounded-xl text-[0.85rem] lg:text-[0.92rem] transition-all duration-300 bg-transparent border-none no-underline relative overflow-hidden whitespace-nowrap" :class="route.path === '/my-borrowings' ? 'text-indigo-600 font-semibold bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/15' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 font-medium'" @click="booksStore.selectedCategory = 'all'">
          <Bookmark :size="18" :stroke-width="1.75" :class="route.path === '/my-borrowings' ? 'fill-indigo-500/10' : 'group-hover:-translate-y-0.5 transition-transform duration-300'" />
          <span class="hidden lg:inline">{{ localeStore.t('myBorrowings') }}</span>
        </router-link>

        <router-link v-if="authStore.user?.role !== 'admin'" to="/wishlist" class="group flex items-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-2 rounded-xl text-[0.85rem] lg:text-[0.92rem] transition-all duration-300 bg-transparent border-none no-underline relative overflow-hidden whitespace-nowrap" :class="route.path === '/wishlist' ? 'text-pink-600 font-semibold bg-pink-500/10 dark:text-pink-400 dark:bg-pink-500/15' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 font-medium'">
          <Heart :size="18" :stroke-width="1.75" :class="route.path === '/wishlist' ? 'fill-pink-500/20 text-pink-600 dark:text-pink-400' : 'group-hover:-translate-y-0.5 transition-transform duration-300 group-hover:text-pink-500'" />
          <span class="hidden lg:inline">{{ localeStore.t('wishlist') || 'Wishlist' }}</span>
        </router-link>

        <div v-if="authStore.user?.role === 'admin'" class="flex items-center gap-2">
          <span class="w-px h-5 bg-[var(--border-color)] mx-1.5"></span>
          <router-link to="/admin" class="group flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-lg text-[0.85rem] lg:text-[0.9rem] font-bold text-white transition-all duration-200 [background:var(--accent-gradient)] shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 no-underline whitespace-nowrap">
            <LayoutDashboard :size="16" />
            <span class="hidden lg:inline">Admin Portal</span>
          </router-link>
        </div>
      </nav>
      </div>

      <!-- Right Section: Actions -->
      <div class="flex items-center gap-1.5 lg:gap-2.5 shrink-0 ml-4">
        <!-- Language Switcher Dropdown / Toggle -->
        <button 
          @click="localeStore.toggleLanguage()" 
          class="inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-full bg-slate-500/10 border border-[var(--border-color)] text-[var(--text-primary)] text-[0.82rem] font-bold transition-all duration-200 hover:bg-indigo-500/15 hover:border-[var(--border-highlight)] cursor-pointer"
          :title="localeStore.currentLang === 'en' ? 'Switch to Khmer (ភាសាខ្មែរ)' : 'Switch to English'"
        >
          <Globe :size="16" />
          <span class="tracking-[0.03em]">{{ localeStore.currentLang === 'en' ? 'EN' : 'ខ្មែរ' }}</span>
        </button>

        <!-- Theme Toggle Button -->
        <button 
          @click="themeStore.toggleTheme()" 
          class="w-9 h-9 rounded-full bg-slate-500/10 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-indigo-500/15 hover:border-[var(--border-highlight)]" 
          :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <Sun v-if="themeStore.isDark" :size="19" class="text-amber-500" />
          <Moon v-else :size="19" class="text-indigo-500" />
        </button>

        <!-- Notifications Bell Button -->
        <button 
          v-if="authStore.isAuthenticated"
          @click="notifStore.toggleDrawer()" 
          class="relative w-9 h-9 rounded-full bg-slate-500/10 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-indigo-500/15 hover:border-[var(--border-highlight)] hover:text-indigo-500" 
          title="Notifications"
        >
          <Bell :size="19" />
          <span v-if="notifStore.unreadCount > 0" class="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[0.62rem] font-extrabold flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)]">
            {{ notifStore.unreadCount }}
          </span>
        </button>

        <!-- PWA Mini App Install Button -->
        <button 
          v-if="canInstallPwa" 
          @click="installPwaApp" 
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-[0.78rem] font-bold border-none cursor-pointer shadow-[0_2px_10px_rgba(16,185,129,0.3)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(16,185,129,0.45)]" 
          title="Install DUC Library Mini App"
        >
          <Download :size="15" />
          <span>App</span>
        </button>

        <template v-if="authStore.isAuthenticated">
          <div @click="router.push(authStore.user?.role === 'admin' ? '/admin/profile' : '/profile')" title="Click to view My Full Profile" class="flex items-center gap-2 lg:gap-2.5 px-2 lg:px-3 py-1.5 bg-slate-500/10 border border-[var(--border-color)] rounded-full cursor-pointer transition-all duration-200 hover:bg-indigo-500/15 hover:border-[var(--border-highlight)]" :class="{ 'bg-indigo-500/15 border-[var(--border-highlight)]': route.path === '/profile' || route.path === '/admin/profile' }">
            <div class="w-[28px] h-[28px] lg:w-[30px] lg:h-[30px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-[0.85rem] overflow-hidden shrink-0">
              <img v-if="authStore.user?.profile_photo" :src="authStore.user.profile_photo" class="w-full h-full object-cover rounded-full" />
              <span v-else>{{ authStore.user?.name?.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="hidden xl:flex flex-col leading-tight">
              <span class="text-[0.85rem] font-semibold truncate max-w-[120px]">{{ authStore.user?.name }}</span>
              <span class="text-[0.7rem] text-[var(--text-muted)] uppercase" :class="{ 'text-violet-500 font-bold': authStore.user?.role === 'admin' }">{{ authStore.user?.role }}</span>
            </div>
          </div>
          <button @click="handleLogout" class="btn btn-secondary btn-sm" title="Log Out">
            <LogOut :size="16" />
          </button>
        </template>

        <template v-else>
          <router-link to="/login" class="btn btn-secondary btn-sm">{{ localeStore.t('login') }}</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">{{ localeStore.t('register') }}</router-link>
        </template>
      </div>
    </div>

    <!-- Notifications Drawer -->
    <NotificationsDrawer />
  </header>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useBooksStore } from '../stores/books';
import { useThemeStore } from '../stores/theme';
import { useNotificationsStore } from '../stores/notifications';
import { useConfirmStore } from '../stores/confirm';
import { useRoute, useRouter } from 'vue-router';
import NotificationsDrawer from './NotificationsDrawer.vue';
import { 
  Home, BookOpen, Library, BookmarkCheck, Heart, LayoutDashboard, 
  BookPlus, ClipboardList, Users, LogOut, Sun, Moon, Globe, Download, Bell,
  Compass, Bookmark
} from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const booksStore = useBooksStore();
const themeStore = useThemeStore();
const notifStore = useNotificationsStore();
const route = useRoute();
const router = useRouter();

function goHome() {
  booksStore.selectedCategory = 'all';
  if (route.path !== '/') {
    router.push('/');
  }
}

function goCatalog() {
  booksStore.selectedCategory = 'all';
  if (route.path !== '/catalog') {
    router.push('/catalog');
  }
}

function openWishlist() {
  booksStore.selectedCategory = 'wishlist';
  if (route.path !== '/catalog' && route.path !== '/') {
    router.push('/catalog');
  }
}

const deferredPrompt = ref(null);
const canInstallPwa = computed(() => !!deferredPrompt.value);

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
  });
});

async function installPwaApp() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt.value = null;
    }
  }
}

function toggleLanguage() {
  const nextLang = localeStore.currentLang === 'en' ? 'km' : 'en';
  localeStore.setLanguage(nextLang);
}

function toggleTheme() {
  isDark.value = !isDark.value;
  const newTheme = isDark.value ? 'dark' : 'light';
  localStorage.setItem('duc_theme', newTheme);
  applyTheme(newTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
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
    notifStore.closeDrawer();
    authStore.logout();
    router.push('/login');
  }
}
</script>


