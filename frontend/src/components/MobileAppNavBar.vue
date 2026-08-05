<template>
  <nav v-if="!hideOnReadPage" class="mobile-app-navbar">
    <button @click="goToHome" class="mobile-tab" :class="{ active: isHomeActive }">
      <div class="tab-icon-box">
        <Home :size="20" />
      </div>
      <span class="tab-label">{{ localeStore.t('home') || 'Home' }}</span>
    </button>

    <button @click="goToCatalog" class="mobile-tab" :class="{ active: isCatalogActive }">
      <div class="tab-icon-box">
        <BookOpen :size="20" />
      </div>
      <span class="tab-label">{{ localeStore.t('catalog') || 'Catalog' }}</span>
    </button>

    <router-link v-if="authStore.isAuthenticated" to="/my-borrowings" class="mobile-tab" :class="{ active: route.path === '/my-borrowings' }">
      <div class="tab-icon-box">
        <Bookmark :size="20" />
      </div>
      <span class="tab-label">{{ localeStore.t('myBooks') || 'My Books' }}</span>
    </router-link>

    <button @click="goToWishlist" class="mobile-tab" :class="{ active: isWishlistActive }">
      <div class="tab-icon-box">
        <Heart :size="20" :fill="isWishlistActive ? '#ef4444' : 'none'" color="currentColor" />
      </div>
      <span class="tab-label">{{ localeStore.t('wishlist') || 'Wishlist' }}</span>
    </button>

    <button @click="handleProfileClick" class="mobile-tab" :class="{ active: isProfileOpen }">
      <div class="tab-icon-box">
        <User :size="20" />
      </div>
      <span class="tab-label">{{ authStore.isAuthenticated ? (localeStore.t('profile') || 'Profile') : localeStore.t('login') }}</span>
    </button>
  </nav>

  <UserProfileModal v-if="isProfileOpen" :isOpen="isProfileOpen" @close="isProfileOpen = false" />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Home, BookOpen, Bookmark, Heart, User } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useBooksStore } from '../stores/books';
import UserProfileModal from './UserProfileModal.vue';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const booksStore = useBooksStore();
const route = useRoute();
const router = useRouter();

const isProfileOpen = ref(false);
const hideOnReadPage = computed(() => route.path.startsWith('/read'));

const isHomeActive = computed(() => route.path === '/');
const isCatalogActive = computed(() => route.path === '/catalog');
const isWishlistActive = computed(() => route.path === '/wishlist');

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
    isProfileOpen.value = true;
  }
}
</script>

<style scoped>
.mobile-app-navbar {
  display: none;
}

@media (max-width: 768px) {
  .mobile-app-navbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: rgba(11, 15, 25, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 9999;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.4);
  }

  .mobile-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: transparent;
    border: none;
    color: #64748b;
    text-decoration: none;
    font-size: 0.68rem;
    font-weight: 600;
    flex: 1;
    height: 100%;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .tab-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 14px;
    border-radius: 9999px;
    transition: all 0.2s ease;
  }

  .mobile-tab.active {
    color: #6366f1;
  }

  .mobile-tab.active .tab-icon-box {
    background: rgba(99, 102, 241, 0.18);
    color: #818cf8;
  }

  .mobile-tab:active {
    transform: scale(0.92);
  }
}
</style>
