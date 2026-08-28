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
            class="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[0.85rem] lg:text-[0.9rem] transition-all duration-300 border-none font-inherit cursor-pointer whitespace-nowrap" 
            :class="route.path === '/' && booksStore.selectedCategory !== 'wishlist' ? 'text-[var(--nav-active-text)] font-bold bg-[var(--nav-active-bg)]' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'"
          >
            <Home :size="16" :stroke-width="2" />
            <span class="hidden lg:inline">{{ localeStore.t('home') || 'Home' }}</span>
          </button>

          <button 
            @click="goCatalog" 
            class="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[0.85rem] lg:text-[0.9rem] transition-all duration-300 border-none font-inherit cursor-pointer whitespace-nowrap" 
            :class="route.path === '/catalog' && booksStore.selectedCategory !== 'wishlist' ? 'text-[var(--nav-active-text)] font-bold bg-[var(--nav-active-bg)]' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'"
          >
            <Tags :size="18" :stroke-width="route.path === '/catalog' ? 2.5 : 2" class="transition-transform duration-300 group-hover:scale-110" />
            <span class="hidden lg:inline">{{ localeStore.t('catalog') }}</span>
          </button>

          <router-link v-if="authStore.isAuthenticated && authStore.user?.role !== 'admin'" to="/my-borrowings" class="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[0.85rem] lg:text-[0.9rem] transition-all duration-300 border-none no-underline whitespace-nowrap" :class="route.path === '/my-borrowings' ? 'text-[var(--nav-active-text)] font-bold bg-[var(--nav-active-bg)]' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'" @click="booksStore.selectedCategory = 'all'">
            <Bookmark :size="16" :stroke-width="route.path === '/my-borrowings' ? 2.5 : 2" />
            <span class="hidden lg:inline">{{ localeStore.t('myBorrowings') }}</span>
          </router-link>

          <router-link v-if="authStore.user?.role !== 'admin'" to="/wishlist" class="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[0.85rem] lg:text-[0.9rem] transition-all duration-300 border-none no-underline whitespace-nowrap" :class="route.path === '/wishlist' ? 'text-[var(--nav-active-text)] font-bold bg-[var(--nav-active-bg)]' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:bg-[var(--bg-card-hover)]'">
            <Library :size="16" :stroke-width="route.path === '/wishlist' ? 2.5 : 2" />
            <span class="hidden lg:inline">{{ localeStore.t('wishlist') || 'My Collection' }}</span>
          </router-link>

          <div v-if="authStore.user?.role === 'admin'" class="flex items-center gap-2 ml-2">
            <span class="w-px h-4 bg-[var(--border-color)] mx-1"></span>
            <router-link to="/admin" class="group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.85rem] font-semibold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 transition-colors no-underline whitespace-nowrap">
              <LayoutDashboard :size="15" />
              <span class="hidden lg:inline">Admin Portal</span>
            </router-link>
          </div>
        </nav>
      </div>

      <!-- Right Section: Actions -->
      <div class="flex items-center gap-2 lg:gap-3 shrink-0 ml-4">




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
          <div class="h-5 w-px bg-[var(--border-color)] mx-1 hidden sm:block"></div>
          
          <div @click="router.push(authStore.user?.role === 'admin' ? '/admin/profile' : '/profile')" title="View Profile" class="flex items-center gap-2 p-1 pr-3 lg:pr-4 bg-transparent border border-[var(--border-color)] rounded-full cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]">
            <div class="w-7 h-7 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold text-[0.75rem] overflow-hidden shrink-0">
              <img v-if="authStore.user?.profile_photo" :src="authStore.user.profile_photo" class="w-full h-full object-cover" />
              <span v-else>{{ authStore.user?.name?.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="hidden sm:block text-[0.8rem] font-semibold text-[var(--text-primary)] truncate max-w-[100px]">{{ authStore.user?.name }}</span>
          </div>


          <div class="h-5 w-px bg-[var(--border-color)] mx-1 hidden sm:block"></div>

          <!-- Settings -->
          <button 
            @click="isSettingsOpen = true" 
            class="w-8 h-8 rounded-md bg-transparent text-[var(--text-secondary)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] border-none" 
            title="Account Settings"
          >
            <Settings :size="16" />
          </button>
        </template>

        <template v-else>
          <router-link to="/login" class="px-5 py-2 rounded-[10px] bg-[var(--text-primary)] text-[var(--bg-primary)] text-[0.85rem] font-extrabold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] no-underline flex items-center justify-center">Log In</router-link>
        </template>
      </div>
    </div>

    <!-- Notifications Drawer -->
    <NotificationsDrawer />
  </header>

    <!-- Check-In Modal -->
    <div v-if="checkinStore.isCheckinModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" @click.self="checkinStore.closeModal()">
      <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md transition-all duration-500 animate-in fade-in"></div>
      
      <div class="relative w-full max-w-[420px] bg-[var(--bg-card)] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[var(--border-color)] overflow-hidden text-center p-8 max-sm:p-6 animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)_both] transform-gpu">
        <!-- Close Button -->
        <button @click="checkinStore.closeModal()" class="absolute z-50 top-5 right-5 w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] rounded-full transition-all duration-300 hover:rotate-90 cursor-pointer shadow-sm">
          <X :size="16" stroke-width="2.5" />
        </button>
        
        <!-- Icon Container -->
        <div class="flex justify-center mb-6 relative">
          <!-- Pulse rings -->
          <div v-if="checkinStore.isCheckingIn" class="absolute inset-0 m-auto w-20 h-20 bg-indigo-500/20 rounded-full animate-ping"></div>
          
          <div class="relative w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.3)] transform transition-transform duration-500" 
               :class="checkinStatus === 'success' || checkinStore.hasCheckedInToday ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] scale-110' : (checkinStatus === 'error' ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-[0_8px_20px_rgba(244,63,94,0.3)]' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white')">
            
            <Loader2 v-if="checkinStore.isCheckingIn" class="animate-spin text-white" :size="34" stroke-width="2.5" />
            <MapPin v-else-if="!checkinStore.hasCheckedInToday && checkinStatus !== 'error' && checkinStatus !== 'success'" :size="34" stroke-width="2.5" class="animate-bounce" />
            <CheckCircle v-else-if="checkinStatus === 'success' || checkinStore.hasCheckedInToday" :size="34" stroke-width="2.5" class="animate-in zoom-in" />
            <AlertTriangle v-else-if="checkinStatus === 'error'" :size="34" stroke-width="2.5" />
          </div>
        </div>

        <!-- Typography -->
        <h2 class="text-[1.65rem] font-black text-[var(--text-primary)] tracking-tight mb-3">
          {{ checkinStore.hasCheckedInToday ? "You're Checked In!" : (checkinStore.isCheckingIn ? 'Verifying Location...' : 'Library Check-In') }}
        </h2>
        
        <p v-if="checkinStatus === 'error'" class="text-[0.95rem] text-rose-500 font-medium mb-8 leading-relaxed px-2 bg-rose-500/10 border border-rose-500/20 py-3 rounded-xl">{{ checkinErrorMsg }}</p>
        <p v-else-if="checkinStore.hasCheckedInToday" class="text-[0.95rem] text-[var(--text-secondary)] font-medium mb-8 leading-relaxed px-2">
          You have successfully checked into the library today! Have a great study session.
        </p>
        <p v-else class="text-[0.95rem] text-[var(--text-secondary)] font-medium mb-8 leading-relaxed px-2">
          To check in, you must be physically located at the DUC Library. We will request your location to verify.
        </p>

        <!-- Actions -->
        <button v-if="!checkinStore.hasCheckedInToday && checkinStatus !== 'error'" @click="performCheckin" class="w-full py-3.5 rounded-[16px] font-extrabold text-[1.05rem] text-[var(--bg-primary)] bg-[var(--text-primary)] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_20px_rgba(255,255,255,0.1)] border-none cursor-pointer flex items-center justify-center gap-2.5 group" :disabled="checkinStore.isCheckingIn">
          <MapPin :size="20" stroke-width="2.5" class="group-hover:-translate-y-1 transition-transform" /> 
          {{ checkinStore.isCheckingIn ? 'Locating...' : 'Share Location & Check In' }}
        </button>
        <button v-else-if="checkinStatus === 'error'" @click="performCheckin" class="w-full py-3.5 rounded-[16px] font-extrabold text-[1.05rem] text-[var(--bg-primary)] bg-[var(--text-primary)] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] border-none cursor-pointer flex items-center justify-center gap-2.5" :disabled="checkinStore.isCheckingIn">
          <RefreshCw :size="20" stroke-width="2.5" :class="{ 'animate-spin': checkinStore.isCheckingIn }" /> 
          {{ checkinStore.isCheckingIn ? 'Trying...' : 'Try Again' }}
        </button>
        <button v-else @click="checkinStore.closeModal()" class="w-full py-3.5 mt-2 rounded-[16px] font-extrabold text-[1.05rem] text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] transition-all active:scale-[0.98] border border-[var(--border-color)] cursor-pointer">Done</button>
      </div>
    </div>
    
    <!-- Settings Modal -->
    <SettingsModal :isOpen="isSettingsOpen" @close="isSettingsOpen = false" />
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
import SettingsModal from './SettingsModal.vue';
import { 
  Home, BookOpen, Library, BookmarkCheck, Heart, LayoutDashboard, 
  BookPlus, ClipboardList, Users, LogOut, Sun, Moon, Globe, Download, Bell,
  Compass, Bookmark, MapPin, X, Loader2, CheckCircle, AlertTriangle, RefreshCw, Tags, Settings
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

// Settings State
const isSettingsOpen = ref(false);

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


