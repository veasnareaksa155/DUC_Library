<template>
  <nav v-if="!hideOnReadPage" class="hidden md:hidden max-md:flex items-center justify-around fixed bottom-4 left-4 right-4 h-[60px] px-2 bg-[var(--bg-card)]/85 backdrop-blur-3xl rounded-[30px] border border-[var(--border-highlight)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] z-[9999]">
    
    <button @click="goToHome" class="relative flex flex-1 h-full items-center justify-center text-[var(--text-secondary)] transition-colors duration-300 bg-transparent border-none cursor-pointer p-0 group [-webkit-tap-highlight-color:transparent]" :class="{ 'text-indigo-600 dark:text-indigo-400': isHomeActive }">
      <div class="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-200 group-active:scale-90">
        <Home :size="22" :stroke-width="isHomeActive ? 2.5 : 2" class="absolute transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isHomeActive ? 'top-[18%] drop-shadow-[0_4px_8px_rgba(79,70,229,0.3)]' : 'top-[50%] -translate-y-[50%]'" />
        <span class="absolute bottom-[15%] text-[0.6rem] font-bold tracking-wide transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isHomeActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75'">{{ localeStore.t('home') || 'Home' }}</span>
      </div>
    </button>

    <button @click="goToCatalog" class="relative flex flex-1 h-full items-center justify-center text-[var(--text-secondary)] transition-colors duration-300 bg-transparent border-none cursor-pointer p-0 group [-webkit-tap-highlight-color:transparent]" :class="{ 'text-indigo-600 dark:text-indigo-400': isCatalogActive }">
      <div class="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-200 group-active:scale-90">
        <BookOpen :size="22" :stroke-width="isCatalogActive ? 2.5 : 2" class="absolute transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isCatalogActive ? 'top-[18%] drop-shadow-[0_4px_8px_rgba(79,70,229,0.3)]' : 'top-[50%] -translate-y-[50%]'" />
        <span class="absolute bottom-[15%] text-[0.6rem] font-bold tracking-wide transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isCatalogActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75'">{{ localeStore.t('catalog') || 'Catalog' }}</span>
      </div>
    </button>

    <router-link v-if="authStore.isAuthenticated" to="/my-borrowings" class="relative flex flex-1 h-full items-center justify-center text-[var(--text-secondary)] transition-colors duration-300 bg-transparent border-none cursor-pointer p-0 group no-underline [-webkit-tap-highlight-color:transparent]" :class="{ 'text-indigo-600 dark:text-indigo-400': route.path === '/my-borrowings' }">
      <div class="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-200 group-active:scale-90">
        <Bookmark :size="22" :stroke-width="route.path === '/my-borrowings' ? 2.5 : 2" class="absolute transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="route.path === '/my-borrowings' ? 'top-[18%] drop-shadow-[0_4px_8px_rgba(79,70,229,0.3)]' : 'top-[50%] -translate-y-[50%]'" />
        <span class="absolute bottom-[15%] text-[0.6rem] font-bold tracking-wide transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="route.path === '/my-borrowings' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75'">{{ localeStore.t('myBooks') || 'My Books' }}</span>
      </div>
    </router-link>

    <button @click="goToWishlist" class="relative flex flex-1 h-full items-center justify-center text-[var(--text-secondary)] transition-colors duration-300 bg-transparent border-none cursor-pointer p-0 group [-webkit-tap-highlight-color:transparent]" :class="{ 'text-pink-600 dark:text-pink-400': isWishlistActive }">
      <div class="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-200 group-active:scale-90">
        <Heart :size="22" :stroke-width="isWishlistActive ? 2.5 : 2" :fill="isWishlistActive ? 'currentColor' : 'none'" class="absolute transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isWishlistActive ? 'top-[18%] drop-shadow-[0_4px_8px_rgba(236,72,153,0.3)]' : 'top-[50%] -translate-y-[50%]'" />
        <span class="absolute bottom-[15%] text-[0.6rem] font-bold tracking-wide transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isWishlistActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75'">{{ localeStore.t('wishlist') || 'Wishlist' }}</span>
      </div>
    </button>

    <button @click="handleProfileClick" class="relative flex flex-1 h-full items-center justify-center text-[var(--text-secondary)] transition-colors duration-300 bg-transparent border-none cursor-pointer p-0 group [-webkit-tap-highlight-color:transparent]" :class="{ 'text-indigo-600 dark:text-indigo-400': isProfileActive }">
      <div class="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-200 group-active:scale-90">
        <User :size="22" :stroke-width="isProfileActive ? 2.5 : 2" class="absolute transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isProfileActive ? 'top-[18%] drop-shadow-[0_4px_8px_rgba(79,70,229,0.3)]' : 'top-[50%] -translate-y-[50%]'" />
        <span class="absolute bottom-[15%] text-[0.6rem] font-bold tracking-wide transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="isProfileActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75'">{{ authStore.isAuthenticated ? (localeStore.t('profile') || 'Profile') : localeStore.t('login') }}</span>
      </div>
    </button>

  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Home, BookOpen, Bookmark, Heart, User } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useBooksStore } from '../stores/books';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const booksStore = useBooksStore();
const route = useRoute();
const router = useRouter();

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


