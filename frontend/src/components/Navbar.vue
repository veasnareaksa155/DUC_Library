<template>
  <header class="sticky top-0 z-50 bg-[var(--bg-card)] backdrop-blur-md border-b border-[var(--border-color)] py-3.5 transition-colors duration-300 hidden md:block">
    <div class="max-w-[1280px] mx-auto px-4 lg:px-6 flex items-center justify-between w-full">
      
      <!-- Left Section: Logo + Navigation -->
      <div class="flex items-center gap-6 lg:gap-10">
        <router-link to="/" class="flex items-center gap-2 lg:gap-3 no-underline group shrink-0" @click="goHome">
          <img src="/duc-logo.png" alt="DUC Logo" class="h-9 lg:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <span class="text-[1.1rem] lg:text-[1.2rem] font-bold text-[var(--text-primary)] tracking-tight whitespace-nowrap">DUC Library</span>
        </router-link>

        <nav class="flex items-center gap-1 lg:gap-2">
          <button 
            @click="goHome" 
            class="group flex items-center gap-2 px-3 py-2 rounded-md text-[0.85rem] lg:text-[0.9rem] transition-colors duration-200 bg-transparent border-none font-inherit cursor-pointer whitespace-nowrap" 
            :class="route.path === '/' && booksStore.selectedCategory !== 'wishlist' ? 'text-[var(--text-primary)] font-bold bg-[var(--bg-card-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'"
          >
            <Home :size="16" :stroke-width="2" />
            <span class="hidden lg:inline">{{ localeStore.t('home') || 'Home' }}</span>
          </button>

          <button 
            @click="goCatalog" 
            class="group flex items-center gap-2 px-3 py-2 rounded-md text-[0.85rem] lg:text-[0.9rem] transition-colors duration-200 bg-transparent border-none font-inherit cursor-pointer whitespace-nowrap" 
            :class="route.path === '/catalog' && booksStore.selectedCategory !== 'wishlist' ? 'text-[var(--text-primary)] font-bold bg-[var(--bg-card-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'"
          >
            <Compass :size="16" :stroke-width="2" />
            <span class="hidden lg:inline">{{ localeStore.t('catalog') }}</span>
          </button>

          <router-link v-if="authStore.isAuthenticated && authStore.user?.role !== 'admin'" to="/my-borrowings" class="group flex items-center gap-2 px-3 py-2 rounded-md text-[0.85rem] lg:text-[0.9rem] transition-colors duration-200 bg-transparent border-none no-underline whitespace-nowrap" :class="route.path === '/my-borrowings' ? 'text-[var(--text-primary)] font-bold bg-[var(--bg-card-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'" @click="booksStore.selectedCategory = 'all'">
            <Bookmark :size="16" :stroke-width="2" />
            <span class="hidden lg:inline">{{ localeStore.t('myBorrowings') }}</span>
          </router-link>

          <router-link v-if="authStore.user?.role !== 'admin'" to="/wishlist" class="group flex items-center gap-2 px-3 py-2 rounded-md text-[0.85rem] lg:text-[0.9rem] transition-colors duration-200 bg-transparent border-none no-underline whitespace-nowrap" :class="route.path === '/wishlist' ? 'text-[var(--text-primary)] font-bold bg-[var(--bg-card-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'">
            <Library :size="16" :stroke-width="2" />
            <span class="hidden lg:inline">{{ localeStore.t('wishlist') || 'My Collection' }}</span>
          </router-link>

          <div v-if="authStore.user?.role === 'admin'" class="flex items-center gap-2 ml-2">
            <span class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></span>
            <router-link to="/admin" class="group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.85rem] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors no-underline whitespace-nowrap">
              <LayoutDashboard :size="15" />
              <span class="hidden lg:inline">Admin Portal</span>
            </router-link>
          </div>
        </nav>
      </div>

      <!-- Right Section: Actions -->
      <div class="flex items-center gap-2 lg:gap-3 shrink-0 ml-4">
        <!-- Language Switcher -->
        <button 
          @click="localeStore.toggleLanguage()" 
          class="inline-flex items-center justify-center gap-1.5 px-2.5 h-8 rounded-md bg-transparent text-[var(--text-secondary)] text-[0.8rem] font-semibold transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] cursor-pointer border-none"
          :title="localeStore.currentLang === 'en' ? 'Switch to Khmer (ភាសាខ្មែរ)' : 'Switch to English'"
        >
          <Globe :size="16" />
          <span>{{ localeStore.currentLang === 'en' ? 'EN' : 'ខ្មែរ' }}</span>
        </button>

        <!-- Theme Toggle -->
        <button 
          @click="themeStore.toggleTheme()" 
          class="w-8 h-8 rounded-md bg-transparent text-[var(--text-secondary)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] border-none" 
          :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <Sun v-if="themeStore.isDark" :size="16" />
          <Moon v-else :size="16" />
        </button>

        <!-- Notifications -->
        <button 
          v-if="authStore.isAuthenticated"
          @click="notifStore.toggleDrawer()" 
          class="relative w-8 h-8 rounded-md bg-transparent text-[var(--text-secondary)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] border-none" 
          title="Notifications"
        >
          <Bell :size="16" />
          <span v-if="notifStore.unreadCount > 0" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[var(--bg-card)]"></span>
        </button>

        <!-- PWA Install -->
        <button 
          v-if="canInstallPwa" 
          @click="installPwaApp" 
          class="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[0.75rem] font-bold border border-emerald-200 dark:border-emerald-500/20 cursor-pointer transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-500/20" 
          title="Install DUC Library App"
        >
          <Download :size="14" />
          <span>Install</span>
        </button>

        <!-- User Profile Pill -->
        <template v-if="authStore.isAuthenticated">
          <div class="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
          
          <div @click="router.push(authStore.user?.role === 'admin' ? '/admin/profile' : '/profile')" title="View Profile" class="flex items-center gap-2 p-1 pr-3 lg:pr-4 bg-transparent border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div class="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-[0.75rem] overflow-hidden shrink-0">
              <img v-if="authStore.user?.profile_photo" :src="authStore.user.profile_photo" class="w-full h-full object-cover" />
              <span v-else>{{ authStore.user?.name?.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="hidden sm:block text-[0.8rem] font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">{{ authStore.user?.name }}</span>
          </div>

          <button @click="handleLogout" class="w-8 h-8 rounded-md bg-transparent text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer border-none" title="Log Out">
            <LogOut :size="16" />
          </button>
        </template>

        <template v-else>
          <router-link to="/login" class="px-4 py-1.5 text-[0.85rem] font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors no-underline">Log in</router-link>
          <router-link to="/register" class="px-4 py-1.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[0.85rem] font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors no-underline">Sign up</router-link>
        </template>
      </div>
    </div>

    <!-- Notifications Drawer -->
    <NotificationsDrawer />
  </header>

  <!-- Check-In Modal -->
  <div v-if="checkinStore.isCheckinModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4" @click.self="checkinStore.closeModal()">
    <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-all duration-300"></div>
    
    <div class="relative w-full max-w-[400px] bg-[var(--bg-card)] rounded-lg shadow-xl border border-[var(--border-color)] overflow-hidden text-center p-6">
      <button @click="checkinStore.closeModal()" class="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer p-1 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"><X :size="18" /></button>
      
      <div class="flex justify-center mb-4">
        <div class="w-14 h-14 rounded-full flex items-center justify-center" 
             :class="checkinStatus === 'success' || checkinStore.hasCheckedInToday ? 'bg-emerald-500/10 text-emerald-600' : (checkinStatus === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-indigo-500/10 text-indigo-600')">
          <Loader2 v-if="checkinStore.isCheckingIn" class="animate-spin text-indigo-600" :size="28" />
          <MapPin v-else-if="!checkinStore.hasCheckedInToday && checkinStatus !== 'error' && checkinStatus !== 'success'" :size="28" class="animate-bounce" />
          <CheckCircle v-else-if="checkinStatus === 'success' || checkinStore.hasCheckedInToday" :size="28" />
          <AlertTriangle v-else-if="checkinStatus === 'error'" :size="28" />
        </div>
      </div>

      <h2 class="text-lg font-bold text-[var(--text-primary)] mb-2">
        {{ checkinStore.hasCheckedInToday ? "You're Checked In!" : (checkinStore.isCheckingIn ? 'Verifying Location...' : 'Library Check-In') }}
      </h2>
      
      <p v-if="checkinStatus === 'error'" class="text-[0.9rem] text-red-600 mb-5 leading-relaxed">{{ checkinErrorMsg }}</p>
      <p v-else-if="checkinStore.hasCheckedInToday" class="text-[0.9rem] text-[var(--text-secondary)] mb-5 leading-relaxed">
        You have successfully checked into the library today! Have a great study session.
      </p>
      <p v-else class="text-[0.9rem] text-[var(--text-secondary)] mb-5 leading-relaxed">
        To check in, you must be physically located at the DUC Library. We will request your location to verify.
      </p>

      <button v-if="!checkinStore.hasCheckedInToday && checkinStatus !== 'error'" @click="performCheckin" class="w-full py-2.5 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors border-none cursor-pointer flex items-center justify-center gap-2" :disabled="checkinStore.isCheckingIn">
        <MapPin :size="16" /> {{ checkinStore.isCheckingIn ? 'Locating...' : 'Share Location & Check In' }}
      </button>
      <button v-else-if="checkinStatus === 'error'" @click="performCheckin" class="w-full py-2.5 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors border-none cursor-pointer flex items-center justify-center gap-2" :disabled="checkinStore.isCheckingIn">
        <RefreshCw :size="16" :class="{ 'animate-spin': checkinStore.isCheckingIn }" /> 
        {{ checkinStore.isCheckingIn ? 'Trying...' : 'Try Again' }}
      </button>
      <button v-else @click="checkinStore.closeModal()" class="w-full py-2.5 mt-3 rounded-md font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors border border-[var(--border-color)] cursor-pointer">Close</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useBooksStore } from '../stores/books';
import { useThemeStore } from '../stores/theme';
import { useNotificationsStore } from '../stores/notifications';
import { useConfirmStore } from '../stores/confirm';
import { useCheckinStore } from '../stores/checkin';
import { useRoute, useRouter } from 'vue-router';
import NotificationsDrawer from './NotificationsDrawer.vue';
import { 
  Home, BookOpen, Library, BookmarkCheck, Heart, LayoutDashboard, 
  BookPlus, ClipboardList, Users, LogOut, Sun, Moon, Globe, Download, Bell,
  Compass, Bookmark, MapPin, X, Loader2, CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const booksStore = useBooksStore();
const themeStore = useThemeStore();
const notifStore = useNotificationsStore();
const checkinStore = useCheckinStore();
const route = useRoute();
const router = useRouter();

// Check-In State
const checkinStatus = ref('');
const checkinErrorMsg = ref('');

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
  });
  
  if (authStore.isAuthenticated && authStore.user?.role !== 'admin') {
    checkinStore.checkMyStatusToday();
  }
});

function openCheckinModal() {
  if (checkinStore.hasCheckedInToday) {
    checkinStatus.value = 'success';
  } else {
    checkinStatus.value = '';
    checkinErrorMsg.value = '';
  }
  checkinStore.openModal();
}

function performCheckin() {
  if (!navigator.geolocation) {
    checkinStatus.value = 'error';
    checkinErrorMsg.value = 'Geolocation is not supported by your browser.';
    return;
  }

  checkinStatus.value = 'loading';
  checkinStore.isCheckingIn = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      const success = await checkinStore.verifyCheckin(lat, lng);
      
      if (success) {
        checkinStatus.value = 'success';
      } else {
        checkinStatus.value = 'error';
        checkinErrorMsg.value = checkinStore.error;
      }
    },
    (err) => {
      checkinStore.isCheckingIn = false;
      checkinStatus.value = 'error';
      if (err.code === 1) {
        checkinErrorMsg.value = 'Permission denied. Please allow location access in your browser settings.';
      } else if (err.code === 2) {
        checkinErrorMsg.value = 'Position unavailable. Make sure your device location services are turned on.';
      } else if (err.code === 3) {
        checkinErrorMsg.value = 'Location request timed out. Please try again or move to a better spot.';
      } else {
        checkinErrorMsg.value = 'Unable to retrieve your location. Please ensure location services are enabled.';
      }
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
}

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


