<template>
  <aside class="w-[280px] h-fit max-h-[calc(100vh-2rem)] sticky top-4 self-start m-4 ml-4 flex flex-col p-6 z-40 shrink-0 box-border max-[900px]:hidden bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
    <!-- Brand Header -->
    <div class="pb-6 mb-6 border-b border-[var(--border-color)]">
      <router-link to="/admin" class="flex items-center gap-3.5 group">
        <div class="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--bg-primary)] border border-[var(--border-color)] p-1.5 shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          <img src="/duc-logo.png" alt="DUC Logo" class="w-full h-full object-contain" />
        </div>
        <div class="flex flex-col">
          <span class="text-[1.35rem] font-black text-[var(--text-primary)] tracking-tight">DUC<span class="text-transparent bg-clip-text [background-image:var(--accent-gradient)]">Library</span></span>
          <span class="text-[0.65rem] text-[var(--text-muted)] font-extrabold uppercase tracking-[0.15em] mt-0.5">{{ localeStore.t('adminPortal') }}</span>
        </div>
      </router-link>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex flex-col gap-1.5 mb-6 flex-1">
      <div class="flex items-center gap-3 px-2 mb-3">
        <span class="text-[0.65rem] font-extrabold text-[var(--text-muted)] tracking-[0.15em] uppercase">Main Menu</span>
        <div class="h-px bg-gradient-to-r from-[var(--border-color)] to-transparent flex-1"></div>
      </div>

      <router-link to="/admin" class="group flex items-center gap-3.5 px-3 py-2.5 rounded-[14px] text-[var(--text-secondary)] text-[0.92rem] font-bold transition-all duration-300 hover:text-[var(--text-primary)] hover:bg-indigo-500/5 [&.active]:text-[var(--text-primary)] [&.active]:bg-[var(--bg-primary)] [&.active]:shadow-[0_2px_10px_rgba(0,0,0,0.02)] [&.active]:border [&.active]:border-[var(--border-color)] border border-transparent" active-class="active" exact>
        <div class="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 [&.active]:[background:var(--accent-gradient)] [&.active]:text-white [&.active]:shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover:not(.active):text-indigo-500 group-hover:not(.active):bg-indigo-500/10 text-[var(--text-muted)]">
          <LayoutDashboard :size="18" class="transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span class="tracking-wide capitalize">{{ localeStore.t('dashboard') }}</span>
      </router-link>

      <router-link to="/admin/books" class="group flex items-center gap-3.5 px-3 py-2.5 rounded-[14px] text-[var(--text-secondary)] text-[0.92rem] font-bold transition-all duration-300 hover:text-[var(--text-primary)] hover:bg-indigo-500/5 [&.active]:text-[var(--text-primary)] [&.active]:bg-[var(--bg-primary)] [&.active]:shadow-[0_2px_10px_rgba(0,0,0,0.02)] [&.active]:border [&.active]:border-[var(--border-color)] border border-transparent" active-class="active">
        <div class="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 [&.active]:[background:var(--accent-gradient)] [&.active]:text-white [&.active]:shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover:not(.active):text-indigo-500 group-hover:not(.active):bg-indigo-500/10 text-[var(--text-muted)]">
          <BookPlus :size="18" class="transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span class="tracking-wide capitalize">{{ localeStore.t('books') }}</span>
      </router-link>

      <router-link to="/admin/categories" class="group flex items-center gap-3.5 px-3 py-2.5 rounded-[14px] text-[var(--text-secondary)] text-[0.92rem] font-bold transition-all duration-300 hover:text-[var(--text-primary)] hover:bg-indigo-500/5 [&.active]:text-[var(--text-primary)] [&.active]:bg-[var(--bg-primary)] [&.active]:shadow-[0_2px_10px_rgba(0,0,0,0.02)] [&.active]:border [&.active]:border-[var(--border-color)] border border-transparent" active-class="active">
        <div class="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 [&.active]:[background:var(--accent-gradient)] [&.active]:text-white [&.active]:shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover:not(.active):text-indigo-500 group-hover:not(.active):bg-indigo-500/10 text-[var(--text-muted)]">
          <Tags :size="18" class="transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span class="tracking-wide capitalize">{{ localeStore.t('categories', 'Categories') }}</span>
      </router-link>

      <router-link to="/admin/borrowings" class="group flex items-center gap-3.5 px-3 py-2.5 rounded-[14px] text-[var(--text-secondary)] text-[0.92rem] font-bold transition-all duration-300 hover:text-[var(--text-primary)] hover:bg-indigo-500/5 [&.active]:text-[var(--text-primary)] [&.active]:bg-[var(--bg-primary)] [&.active]:shadow-[0_2px_10px_rgba(0,0,0,0.02)] [&.active]:border [&.active]:border-[var(--border-color)] border border-transparent" active-class="active">
        <div class="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 [&.active]:[background:var(--accent-gradient)] [&.active]:text-white [&.active]:shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover:not(.active):text-indigo-500 group-hover:not(.active):bg-indigo-500/10 text-[var(--text-muted)] relative">
          <ClipboardList :size="18" class="transition-transform duration-300 group-hover:scale-110" />
          <span v-if="pendingCount > 0" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
          <span v-if="pendingCount > 0" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[var(--bg-card)]"></span>
        </div>
        <span class="tracking-wide capitalize flex-1">{{ localeStore.t('requests') }}</span>
        <span v-if="pendingCount > 0" class="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 group-[.active]:bg-rose-500/20 group-[.active]:text-rose-500 border border-rose-200 dark:border-rose-500/20 group-[.active]:border-rose-500/30 text-[0.7rem] font-extrabold px-2 py-0.5 rounded-md transition-colors">{{ pendingCount }}</span>
      </router-link>

      <router-link to="/admin/checkins" class="group flex items-center gap-3.5 px-3 py-2.5 rounded-[14px] text-[var(--text-secondary)] text-[0.92rem] font-bold transition-all duration-300 hover:text-[var(--text-primary)] hover:bg-indigo-500/5 [&.active]:text-[var(--text-primary)] [&.active]:bg-[var(--bg-primary)] [&.active]:shadow-[0_2px_10px_rgba(0,0,0,0.02)] [&.active]:border [&.active]:border-[var(--border-color)] border border-transparent" active-class="active">
        <div class="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 [&.active]:[background:var(--accent-gradient)] [&.active]:text-white [&.active]:shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover:not(.active):text-indigo-500 group-hover:not(.active):bg-indigo-500/10 text-[var(--text-muted)]">
          <MapPin :size="18" class="transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span class="tracking-wide capitalize">{{ localeStore.t('checkins', 'Check-Ins') }}</span>
      </router-link>

      <router-link to="/admin/users" class="group flex items-center gap-3.5 px-3 py-2.5 rounded-[14px] text-[var(--text-secondary)] text-[0.92rem] font-bold transition-all duration-300 hover:text-[var(--text-primary)] hover:bg-indigo-500/5 [&.active]:text-[var(--text-primary)] [&.active]:bg-[var(--bg-primary)] [&.active]:shadow-[0_2px_10px_rgba(0,0,0,0.02)] [&.active]:border [&.active]:border-[var(--border-color)] border border-transparent" active-class="active">
        <div class="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 [&.active]:[background:var(--accent-gradient)] [&.active]:text-white [&.active]:shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover:not(.active):text-indigo-500 group-hover:not(.active):bg-indigo-500/10 text-[var(--text-muted)]">
          <Users :size="18" class="transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span class="tracking-wide capitalize">{{ localeStore.t('users') }}</span>
      </router-link>
    </nav>

    <!-- Sidebar Footer Controls -->
    <div class="pt-6 mt-auto border-t border-[var(--border-color)] flex flex-col gap-4">
      <div class="flex gap-3">
        <!-- Language Switcher -->
        <button @click="toggleLanguage" class="group flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm text-[var(--text-primary)] text-[0.8rem] font-bold transition-all duration-300 hover:border-indigo-500/30 hover:text-indigo-500 hover:-translate-y-0.5" title="Toggle Language">
          <Globe :size="16" class="transition-transform duration-300 group-hover:rotate-12" />
          <span>{{ localeStore.currentLang === 'en' ? 'EN' : 'ខ្មែរ' }}</span>
        </button>

        <!-- Theme Toggle -->
        <button @click="toggleTheme" class="group flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm text-[var(--text-primary)] text-[0.8rem] font-bold transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-0.5" title="Toggle Theme">
          <Sun v-if="isDark" :size="16" class="text-amber-500 transition-transform duration-300 group-hover:rotate-90" />
          <Moon v-else :size="16" class="text-indigo-500 transition-transform duration-300 group-hover:-rotate-12" />
        </button>
      </div>

      <!-- Admin User Pill -->
      <div class="flex items-center gap-3 p-3 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] hover:border-indigo-500/30 border border-[var(--border-color)] rounded-[16px] cursor-pointer transition-all duration-300 group shadow-[0_2px_10px_rgba(0,0,0,0.02)]" @click="router.push('/admin/profile')" title="Click to view My Full Profile">
        <div class="w-10 h-10 rounded-[12px] bg-[var(--accent-gradient)] text-white flex items-center justify-center font-extrabold text-[1.1rem] shadow-[0_4px_12px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform duration-300 overflow-hidden">
          <img v-if="authStore.user?.profile_photo" :src="authStore.user.profile_photo" class="w-full h-full object-cover" alt="Admin Photo" />
          <span v-else>{{ (authStore.user?.name_latin || authStore.user?.name || 'A').charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex flex-col leading-tight flex-1 overflow-hidden">
          <span class="text-[0.85rem] font-bold text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">{{ authStore.user?.name || 'Admin' }}</span>
          <span class="text-[0.65rem] text-[var(--text-muted)] font-extrabold tracking-wider mt-0.5">{{ authStore.user?.role?.toUpperCase() || 'ADMIN' }}</span>
        </div>
        <button @click.stop="handleLogout" class="bg-transparent border-none text-[var(--text-muted)] p-2 rounded-lg transition-all duration-300 hover:text-rose-500 hover:bg-rose-500/10" title="Log Out">
          <LogOut :size="18" class="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useBorrowingsStore } from '../stores/borrowings';
import { useConfirmStore } from '../stores/confirm';
import { useRouter } from 'vue-router';
import { 
  ShieldCheck, LayoutDashboard, BookPlus, ClipboardList, 
  Users, Globe, Sun, Moon, LogOut, Tags, MapPin
} from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const borrowingsStore = useBorrowingsStore();
const router = useRouter();

const isDark = ref(true);

const pendingCount = computed(() => {
  if (borrowingsStore.adminBorrowings?.length > 0) {
    return borrowingsStore.adminBorrowings.filter(b => b.status === 'pending').length;
  }
  return borrowingsStore.dashboardStats?.pending_requests || 0;
});
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

async function handleLogout() {
  const confirmStore = useConfirmStore();
  const confirmed = await confirmStore.showConfirm({
    title: 'Log Out',
    message: 'Are you sure you want to log out of the admin portal?',
    confirmText: 'Log Out',
    type: 'danger'
  });

  if (confirmed) {
    authStore.logout();
    router.push('/login');
  }
}
</script>


