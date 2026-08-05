<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <router-link to="/" class="brand-logo" @click="goHome">
        <img src="/duc-logo.png" alt="DUC Logo" class="navbar-duc-logo" />
        <span class="brand-title">DUC<span class="text-gradient">Library</span></span>
      </router-link>

      <nav class="nav-links">
        <button 
          @click="goHome" 
          class="nav-link nav-btn-link" 
          :class="{ active: route.path === '/' && booksStore.selectedCategory !== 'wishlist' }"
        >
          <Home :size="18" />
          <span>Home</span>
        </button>

        <button 
          @click="goCatalog" 
          class="nav-link nav-btn-link" 
          :class="{ active: route.path === '/catalog' && booksStore.selectedCategory !== 'wishlist' }"
        >
          <Library :size="18" />
          <span>{{ localeStore.t('catalog') }}</span>
        </button>

        <router-link v-if="authStore.isAuthenticated" to="/my-borrowings" class="nav-link" active-class="active" @click="booksStore.selectedCategory = 'all'">
          <BookmarkCheck :size="18" />
          <span>{{ localeStore.t('myBorrowings') }}</span>
        </router-link>

        <router-link to="/wishlist" class="nav-link" active-class="active">
          <Heart :size="18" :fill="route.path === '/wishlist' ? '#ef4444' : 'none'" color="#ef4444" />
          <span>Wishlist</span>
        </router-link>

        <div v-if="authStore.isAdmin" class="admin-nav-group">
          <span class="admin-divider"></span>
          <router-link to="/admin" class="nav-link admin-link" active-class="active">
            <LayoutDashboard :size="18" />
            <span>{{ localeStore.t('dashboard') }}</span>
          </router-link>
          <router-link to="/admin/books" class="nav-link admin-link" active-class="active">
            <BookPlus :size="18" />
            <span>{{ localeStore.t('books') }}</span>
          </router-link>
          <router-link to="/admin/borrowings" class="nav-link admin-link" active-class="active">
            <ClipboardList :size="18" />
            <span>{{ localeStore.t('requests') }}</span>
          </router-link>
          <router-link to="/admin/users" class="nav-link admin-link" active-class="active">
            <Users :size="18" />
            <span>{{ localeStore.t('users') }}</span>
          </router-link>
        </div>
      </nav>

      <div class="nav-actions">
        <!-- Language Switcher Dropdown / Toggle -->
        <button 
          @click="localeStore.toggleLanguage()" 
          class="lang-toggle-btn"
          :title="localeStore.currentLang === 'en' ? 'Switch to Khmer (ភាសាខ្មែរ)' : 'Switch to English'"
        >
          <Globe :size="16" />
          <span class="lang-text">{{ localeStore.currentLang === 'en' ? 'EN' : 'ខ្មែរ' }}</span>
        </button>

        <!-- Theme Toggle Button -->
        <button 
          @click="themeStore.toggleTheme()" 
          class="theme-toggle-btn" 
          :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <Sun v-if="themeStore.isDark" :size="19" class="sun-icon" />
          <Moon v-else :size="19" class="moon-icon" />
        </button>

        <!-- Notifications Bell Button -->
        <button 
          @click="notifStore.toggleDrawer()" 
          class="notif-bell-btn" 
          title="Notifications"
        >
          <Bell :size="19" />
          <span v-if="notifStore.unreadCount > 0" class="notif-badge-count">
            {{ notifStore.unreadCount }}
          </span>
        </button>

        <!-- PWA Mini App Install Button -->
        <button 
          v-if="canInstallPwa" 
          @click="installPwaApp" 
          class="pwa-install-btn" 
          title="Install DUC Library Mini App"
        >
          <Download :size="15" />
          <span>App</span>
        </button>

        <template v-if="authStore.isAuthenticated">
          <div class="user-pill" @click="isProfileModalOpen = true" title="Click to view My Full Profile">
            <div class="user-avatar">
              <img v-if="authStore.user?.profile_photo" :src="authStore.user.profile_photo" class="navbar-avatar-img" />
              <span v-else>{{ authStore.user?.name?.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <span class="user-role" :class="authStore.user?.role">{{ authStore.user?.role }}</span>
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

    <!-- My Student Profile Modal -->
    <UserProfileModal :isOpen="isProfileModalOpen" @close="isProfileModalOpen = false" />

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
import { useRoute, useRouter } from 'vue-router';
import UserProfileModal from './UserProfileModal.vue';
import NotificationsDrawer from './NotificationsDrawer.vue';
import { 
  Home, BookOpen, Library, BookmarkCheck, Heart, LayoutDashboard, 
  BookPlus, ClipboardList, Users, LogOut, Sun, Moon, Globe, Download, Bell 
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

const isProfileModalOpen = ref(false);
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

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.navbar-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 0.85rem 1.5rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navbar-duc-logo {
  height: 52px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  transition: transform 0.2s ease;
}

.brand-logo:hover .navbar-duc-logo {
  transform: scale(1.05);
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--accent-glow);
}

.brand-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(125, 125, 125, 0.1);
}

.nav-link.active {
  color: var(--text-primary);
  background: rgba(99, 102, 241, 0.15);
  font-weight: 600;
}

.nav-btn-link {
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: pointer;
}

.admin-nav-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 0.4rem;
}

.admin-link.active {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.lang-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  background: rgba(125, 125, 125, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.lang-toggle-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--border-highlight);
}

.lang-text {
  letter-spacing: 0.03em;
}

.theme-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(125, 125, 125, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--border-highlight);
}

.notif-bell-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(125, 125, 125, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notif-bell-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--border-highlight);
  color: var(--accent-primary);
}

.notif-badge-count {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9999px;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

.sun-icon {
  color: #f59e0b;
}

.moon-icon {
  color: #6366f1;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.75rem;
  background: rgba(125, 125, 125, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 9999px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  overflow: hidden;
}

.navbar-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.user-role {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.user-role.admin {
  color: #8b5cf6;
  font-weight: 700;
}

.pwa-install-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;
}

.pwa-install-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45);
}

@media (max-width: 768px) {
  .navbar-header {
    display: none !important;
  }
}
</style>
