<template>
  <!-- Floating Check-In Button (Global for Mobile & Desktop) -->
  <button 
    v-if="authStore.isAuthenticated && authStore.user?.role !== 'admin' && !hideOnReadPage"
    @click="openCheckinModal"
    class="flex fixed right-4 md:right-8 bottom-[85px] md:bottom-8 w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full items-center justify-center text-[var(--bg-primary)] z-[9998] transition-all duration-300 outline-none cursor-pointer border border-[var(--border-color)] shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
    :class="checkinStore.hasCheckedInToday ? 'bg-emerald-500 text-white' : 'bg-[var(--text-primary)]'"
    :title="checkinStore.hasCheckedInToday ? 'Checked In' : 'Check In to Library'"
  >
    <MapPin :size="24" :class="{ 'animate-bounce': !checkinStore.hasCheckedInToday }" />
  </button>

  <nav v-if="!hideOnReadPage" class="hidden md:hidden max-md:flex items-center justify-around fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--bg-card)] border-t border-[var(--border-color)] z-[9999] pb-[env(safe-area-inset-bottom)]">
    
    <button @click="goToHome" class="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer border-none bg-transparent" :class="isHomeActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <Home :size="22" :stroke-width="isHomeActive ? 2.5 : 2" />
      <span class="text-[0.65rem] font-semibold">{{ localeStore.t('home') || 'Home' }}</span>
    </button>

    <button @click="goToCatalog" class="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer border-none bg-transparent" :class="isCatalogActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <BookOpen :size="22" :stroke-width="isCatalogActive ? 2.5 : 2" />
      <span class="text-[0.65rem] font-semibold">{{ localeStore.t('catalog') || 'Catalog' }}</span>
    </button>

    <router-link v-if="authStore.isAuthenticated" to="/my-borrowings" class="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors no-underline" :class="route.path === '/my-borrowings' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <Bookmark :size="22" :stroke-width="route.path === '/my-borrowings' ? 2.5 : 2" />
      <span class="text-[0.65rem] font-semibold">{{ localeStore.t('myBooks') || 'My Books' }}</span>
    </router-link>

    <button @click="goToWishlist" class="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer border-none bg-transparent" :class="isWishlistActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <Library :size="22" :stroke-width="isWishlistActive ? 2.5 : 2" />
      <span class="text-[0.65rem] font-semibold">{{ localeStore.t('wishlist') || 'Collection' }}</span>
    </button>

    <button @click="handleProfileClick" class="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer border-none bg-transparent" :class="isProfileActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
      <User :size="22" :stroke-width="isProfileActive ? 2.5 : 2" />
      <span class="text-[0.65rem] font-semibold">{{ authStore.isAuthenticated ? (localeStore.t('profile') || 'Profile') : localeStore.t('login') }}</span>
    </button>

  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Home, BookOpen, Bookmark, Heart, User, MapPin, Library } from 'lucide-vue-next';
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


