<template>
  <div id="app-root" class="flex flex-col min-h-screen">
    <Navbar v-if="!hideGlobalNav" />
    <MobileHeader v-if="!hideGlobalNav" />
    <main class="flex-1 max-md:pb-[72px]">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <MobileAppNavBar v-if="!hideGlobalNav" />
    <ScrollToTop />
    <ToastNotification />
    <ConfirmModal />
    <footer v-if="!hideGlobalNav" class="hidden md:block border-t border-[var(--border-color)] bg-[var(--bg-card)] pt-12 pb-6 text-[0.85rem] text-[var(--text-muted)] transition-colors duration-300">
      <div class="max-w-[1280px] mx-auto px-6 max-sm:px-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-8 lg:gap-10 mb-10">
          <!-- Col 1: Brand & Mission -->
          <div class="flex flex-col">
            <div class="flex items-center gap-3 mb-3.5">
              <img src="/duc-logo.png" alt="DUC Logo" class="h-11 w-auto object-contain" />
              <span class="text-[1.2rem] font-extrabold text-[var(--text-primary)]">DUC <span class="bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent">Digital Library</span></span>
            </div>
            <p class="text-[0.84rem] leading-relaxed text-[var(--text-secondary)] mb-4">
              Empowering students, faculty, and researchers with digital learning resources, e-books, physical book reservations, and academic tools.
            </p>
            <div>
              <span class="inline-block text-[0.72rem] font-bold px-2.5 py-1 rounded-full bg-indigo-500/12 border border-indigo-500/30 text-indigo-500">DUC Academic Excellence System</span>
            </div>
          </div>

          <!-- Col 2: Quick Links -->
          <div class="flex flex-col">
            <h4 class="text-[0.95rem] font-bold text-[var(--text-primary)] mb-4 tracking-[0.02em]">Quick Navigation</h4>
            <ul class="list-none p-0 m-0 flex flex-col gap-2">
              <li><router-link to="/" class="text-[var(--text-secondary)] no-underline transition-colors hover:text-indigo-500">Library Catalog</router-link></li>
              <li><router-link to="/my-borrowings" class="text-[var(--text-secondary)] no-underline transition-colors hover:text-indigo-500">My Borrowed Books</router-link></li>
              <li><router-link to="/login" class="text-[var(--text-secondary)] no-underline transition-colors hover:text-indigo-500">Student & Staff Portal</router-link></li>

            </ul>
          </div>

          <!-- Col 3: Services & Support -->
          <div class="flex flex-col">
            <h4 class="text-[0.95rem] font-bold text-[var(--text-primary)] mb-4 tracking-[0.02em]">Library Services</h4>
            <ul class="list-none p-0 m-0 flex flex-col gap-2 text-[var(--text-secondary)]">
              <li><span>Digital PDF E-Reader</span></li>
              <li><span>Online Book Reservation</span></li>
              <li><span>Physical Book Borrowing</span></li>
              <li><span>Official Report Generator</span></li>
            </ul>
          </div>

          <!-- Col 4: Contact & Hours -->
          <div class="flex flex-col">
            <h4 class="text-[0.95rem] font-bold text-[var(--text-primary)] mb-4 tracking-[0.02em]">Contact & Hours</h4>
            <div class="flex flex-col gap-1.5 text-[0.82rem] text-[var(--text-secondary)] leading-relaxed">
              <p class="m-0"><strong class="text-[var(--text-primary)]">Hours:</strong> Mon - Sat (7:30 AM - 8:00 PM)</p>
              <p class="m-0"><strong class="text-[var(--text-primary)]">Campus:</strong> DUC Resource Center</p>
              <p class="m-0"><strong class="text-[var(--text-primary)]">Email:</strong> library@duc.edu.kh</p>
              <p class="m-0"><strong class="text-[var(--text-primary)]">Desk:</strong> +855 (0) 23 888 999</p>
            </div>
          </div>
        </div>

        <div class="border-t border-[var(--border-color)] pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[0.8rem] text-[var(--text-muted)]">
          <p class="m-0">&copy; 2026 <strong class="text-[var(--text-primary)]">DUC Digital Library</strong>. All Rights Reserved. Dewey International University Library.</p>
          <div class="flex gap-2">
            <span>Privacy Policy</span> &bull;
            <span>Library Regulations</span> &bull;
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import MobileHeader from './components/MobileHeader.vue';
import MobileAppNavBar from './components/MobileAppNavBar.vue';
import ScrollToTop from './components/ScrollToTop.vue';
import ToastNotification from './components/ToastNotification.vue';
import ConfirmModal from './components/ConfirmModal.vue';
import { useAuthStore } from './stores/auth';
import { requestPhoneNotificationPermission } from './services/notificationService';

const authStore = useAuthStore();
const route = useRoute();
const hideGlobalNav = computed(() => route.path.startsWith('/admin') || route.path.startsWith('/read'));

onMounted(() => {
  authStore.checkAuth();
  requestPhoneNotificationPermission();
});
</script>


