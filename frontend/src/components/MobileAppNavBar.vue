<template>
  <!-- Floating Check-In Button (Global for Mobile & Desktop) -->
  <div v-if="authStore.isAuthenticated && authStore.user?.role !== 'admin' && !hideOnReadPage" class="fixed right-4 md:right-8 bottom-[85px] md:bottom-8 z-[9998] group">
    <!-- Glowing background pulse (only when not checked in) -->
    <div v-if="!checkinStore.hasCheckedInToday" class="absolute inset-0 bg-indigo-500/40 rounded-full blur-xl animate-pulse group-hover:bg-indigo-500/60 transition-all duration-500"></div>
    
    <button 
      @click="openCheckinModal"
      class="relative flex w-[55px] h-[55px] md:w-[65px] md:h-[65px] rounded-[1.2rem] md:rounded-full items-center justify-center text-white z-[9999] transition-all duration-500 outline-none cursor-pointer border-2 shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_35px_rgba(99,102,241,0.4)] hover:-translate-y-1.5 active:scale-95 group-hover:rotate-3 overflow-hidden"
      :class="checkinStore.hasCheckedInToday ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-400/50 shadow-[0_8px_25px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-white/30 dark:border-white/10'"
      :title="checkinStore.hasCheckedInToday ? 'Checked In' : 'Check In to Library'"
    >
      <!-- Glossy highlight overlay -->
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none"></div>
      
      <MapPin :size="26" stroke-width="2.5" class="relative z-10 transition-transform duration-500" :class="{ 'animate-bounce': !checkinStore.hasCheckedInToday, 'scale-110': checkinStore.hasCheckedInToday }" />
    </button>
  </div>

  <nav v-if="!hideOnReadPage" class="hidden md:hidden max-md:flex items-center justify-around fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--bg-card)] backdrop-blur-lg border-t border-[var(--border-color)] z-[9999] pb-[env(safe-area-inset-bottom)]">
    
    <button @click="goToHome" class="group flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer border-none bg-transparent" :class="isHomeActive ? 'text-[var(--nav-active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <div class="px-4 py-1 rounded-full transition-all duration-300" :class="isHomeActive ? 'bg-[var(--nav-active-bg)]' : 'bg-transparent'">
        <Home :size="22" :stroke-width="isHomeActive ? 2.5 : 2" />
      </div>
      <span class="text-[0.65rem] font-semibold tracking-tight">{{ localeStore.t('home') || 'Home' }}</span>
    </button>

    <button @click="goToCatalog" class="group flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer border-none bg-transparent" :class="isCatalogActive ? 'text-[var(--nav-active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <div class="px-4 py-1 rounded-full transition-all duration-300" :class="isCatalogActive ? 'bg-[var(--nav-active-bg)]' : 'bg-transparent'">
        <Tags :size="22" :stroke-width="isCatalogActive ? 2.5 : 2" class="transition-transform duration-300 group-hover:scale-110" />
      </div>
      <span class="text-[0.65rem] font-semibold tracking-tight">{{ localeStore.t('catalog') || 'Catalog' }}</span>
    </button>

    <router-link v-if="authStore.isAuthenticated" to="/my-borrowings" class="group flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors no-underline" :class="route.path === '/my-borrowings' ? 'text-[var(--nav-active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <div class="px-4 py-1 rounded-full transition-all duration-300" :class="route.path === '/my-borrowings' ? 'bg-[var(--nav-active-bg)]' : 'bg-transparent'">
        <Bookmark :size="22" :stroke-width="route.path === '/my-borrowings' ? 2.5 : 2" />
      </div>
      <span class="text-[0.65rem] font-semibold tracking-tight">{{ localeStore.t('myBooks') || 'My Books' }}</span>
    </router-link>

    <button @click="goToWishlist" class="group flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer border-none bg-transparent" :class="isWishlistActive ? 'text-[var(--nav-active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <div class="px-4 py-1 rounded-full transition-all duration-300" :class="isWishlistActive ? 'bg-[var(--nav-active-bg)]' : 'bg-transparent'">
        <Library :size="22" :stroke-width="isWishlistActive ? 2.5 : 2" />
      </div>
      <span class="text-[0.65rem] font-semibold tracking-tight">{{ localeStore.t('wishlist') || 'Collection' }}</span>
    </button>

    <button @click="handleProfileClick" class="group flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer border-none bg-transparent" :class="isProfileActive ? 'text-[var(--nav-active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <div class="px-4 py-1 rounded-full transition-all duration-300" :class="isProfileActive ? 'bg-[var(--nav-active-bg)]' : 'bg-transparent'">
        <User :size="22" :stroke-width="isProfileActive ? 2.5 : 2" />
      </div>
      <span class="text-[0.65rem] font-semibold tracking-tight">{{ authStore.isAuthenticated ? (localeStore.t('profile') || 'Profile') : localeStore.t('login') }}</span>
    </button>

  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Home, BookOpen, Bookmark, Heart, User, MapPin, Library, Tags } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useBooksStore } from '../stores/books';
import { useCheckinStore } from '../stores/checkin';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const booksStore = useBooksStore();
const checkinStore = useCheckinStore();
const route = useRoute();
const router = useRouter();

function openCheckinModal() {
  checkinStore.openModal();
}

const hideOnReadPage = computed(() => route.path.startsWith('/read'));
const isHomeActive = computed(() => route.path === '/');
const isCatalogActive = computed(() => route.path === '/catalog');
const isWishlistActive = computed(() => route.path === '/wishlist');
const isProfileActive = computed(() => route.path === '/profile');

function goToHome() {
  booksStore.selectedCategory = 'all';
  router.push('/');
}

function goToCatalog() {
  booksStore.selectedCategory = 'all';
  router.push('/catalog');
}

function goToWishlist() {
  router.push('/wishlist');
}

function handleProfileClick() {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    router.push('/profile');
  }
}
</script>


