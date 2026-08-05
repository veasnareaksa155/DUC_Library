<template>
  <aside class="admin-sidebar glass-panel">
    <!-- Brand Header -->
    <div class="sidebar-header">
      <router-link to="/admin" class="brand-logo">
        <img src="/duc-logo.png" alt="DUC Logo" class="sidebar-duc-logo" />
        <div class="brand-text">
          <span class="brand-title">DUC<span class="text-gradient">Library</span></span>
          <span class="brand-subtitle">{{ localeStore.t('adminPortal') }}</span>
        </div>
      </router-link>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <div class="nav-section-title">MAIN MENU</div>

      <router-link to="/admin" class="sidebar-link" active-class="active" exact>
        <LayoutDashboard :size="18" />
        <span>{{ localeStore.t('dashboard') }}</span>
      </router-link>

      <router-link to="/admin/books" class="sidebar-link" active-class="active">
        <BookPlus :size="18" />
        <span>{{ localeStore.t('books') }}</span>
      </router-link>

      <router-link to="/admin/borrowings" class="sidebar-link" active-class="active">
        <ClipboardList :size="18" />
        <span>{{ localeStore.t('requests') }}</span>
        <span v-if="pendingCount > 0" class="badge-count">{{ pendingCount }}</span>
      </router-link>

      <router-link to="/admin/users" class="sidebar-link" active-class="active">
        <Users :size="18" />
        <span>{{ localeStore.t('users') }}</span>
      </router-link>
    </nav>

    <!-- Sidebar Footer Controls -->
    <div class="sidebar-footer">
      <div class="controls-row">
        <!-- Language Switcher -->
        <button @click="toggleLanguage" class="ctrl-pill" title="Toggle Language">
          <Globe :size="15" />
          <span>{{ localeStore.currentLang === 'en' ? 'EN' : 'ខ្មែរ' }}</span>
        </button>

        <!-- Theme Toggle -->
        <button @click="toggleTheme" class="ctrl-pill" title="Toggle Theme">
          <Sun v-if="isDark" :size="15" class="sun-icon" />
          <Moon v-else :size="15" class="moon-icon" />
        </button>
      </div>

      <!-- Admin User Pill -->
      <div class="admin-user-card" @click="isProfileModalOpen = true" style="cursor: pointer" title="Click to view My Full Profile">
        <div class="user-avatar">
          {{ authStore.user?.name?.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <span class="user-role">{{ authStore.user?.role?.toUpperCase() || 'USER' }}</span>
        </div>
        <button @click.stop="handleLogout" class="btn-logout" title="Log Out">
          <LogOut :size="16" />
        </button>
      </div>
    </div>

    <!-- My Student Profile Modal -->
    <UserProfileModal :isOpen="isProfileModalOpen" @close="isProfileModalOpen = false" />
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useBorrowingsStore } from '../stores/borrowings';
import { useRouter } from 'vue-router';
import UserProfileModal from './UserProfileModal.vue';
import { 
  ShieldCheck, LayoutDashboard, BookPlus, ClipboardList, 
  Users, Globe, Sun, Moon, LogOut 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const borrowingsStore = useBorrowingsStore();
const router = useRouter();

const isDark = ref(true);
const isProfileModalOpen = ref(false);

const pendingCount = computed(() => borrowingsStore.dashboardStats?.pending_requests || 0);

onMounted(() => {
  const savedTheme = localStorage.getItem('duc_theme') || 'dark';
  isDark.value = savedTheme === 'dark';
  applyTheme(savedTheme);
});

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
.admin-sidebar {
  width: 260px;
  height: fit-content;
  max-height: calc(100vh - 2rem);
  position: sticky;
  top: 1rem;
  align-self: flex-start;
  margin: 1rem 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1rem;
  border-radius: var(--radius-xl);
  z-index: 40;
  flex-shrink: 0;
  box-sizing: border-box;
}

.sidebar-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-duc-logo {
  height: 48px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}

.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--accent-glow);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.brand-subtitle {
  font-size: 0.7rem;
  color: #8b5cf6;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.nav-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  padding: 0.5rem 0.75rem 0.25rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.25s var(--spring-ease);
}

.sidebar-link:hover {
  color: var(--text-primary);
  background: rgba(125, 125, 125, 0.1);
  transform: translateX(4px);
}

.sidebar-link.active {
  color: white;
  background: var(--accent-gradient);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
}

.badge-count {
  margin-left: auto;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  animation: pulseAlert 2s infinite;
}

.mt-4 {
  margin-top: 1rem;
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls-row {
  display: flex;
  gap: 0.5rem;
}

.ctrl-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem;
  border-radius: var(--radius-md);
  background: rgba(125, 125, 125, 0.08);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.ctrl-pill:hover {
  background: rgba(125, 125, 125, 0.18);
}

.sun-icon { color: #f59e0b; }
.moon-icon { color: #6366f1; }

.admin-user-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  background: rgba(125, 125, 125, 0.06);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.65rem;
  color: #8b5cf6;
  font-weight: 800;
}

.btn-logout {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

@media (max-width: 900px) {
  .admin-sidebar {
    display: none;
  }
}
</style>
