<template>
  <div id="app-root" class="flex flex-col min-h-screen">
    <Navbar v-if="!hideGlobalNav" />
    <MobileHeader v-if="!hideGlobalNav" />
    <main class="flex-1" :class="{ 'max-md:pb-[72px]': !hideGlobalNav }">
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
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import MobileHeader from './components/MobileHeader.vue';
import MobileAppNavBar from './components/MobileAppNavBar.vue';
import ScrollToTop from './components/ScrollToTop.vue';
import ToastNotification from './components/ToastNotification.vue';
import ConfirmModal from './components/ConfirmModal.vue';
import { useAuthStore } from './stores/auth';
import { useToastStore } from './stores/toast';
import { useBorrowingsStore } from './stores/borrowings';
import { useNotificationsStore } from './stores/notifications';
import { useWishlistStore } from './stores/wishlist';
import { requestPhoneNotificationPermission } from './services/notificationService';
import { jwtDecode } from 'jwt-decode';

const authStore = useAuthStore();
const toastStore = useToastStore();
const borrowingsStore = useBorrowingsStore();
const notificationsStore = useNotificationsStore();
const wishlistStore = useWishlistStore();
const route = useRoute();
const hideGlobalNav = computed(() => route.path.startsWith('/admin') || route.path.startsWith('/read'));

let eventSource = null;

function setupSSE(token) {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  
  const tokenParam = token ? `?token=${token}` : '';
  eventSource = new EventSource(`${import.meta.env.VITE_API_URL || ''}/api/events/stream${tokenParam}`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('SSE Event Received:', data.type, data.payload);
      
      if (data.type === 'borrowing_updated') {
        const status = data.payload.status;
        const bookTitle = data.payload.book_title;
        
        if (status === 'approved') {
          toastStore.showSuccess(`Your request for "${bookTitle}" was approved.`, `Request Approved! 🎉`);
        } else if (status === 'rejected') {
          toastStore.showError(`Your request for "${bookTitle}" was declined.`, `Request Declined`);
        } else if (status === 'returned') {
          toastStore.showSuccess(`"${bookTitle}" has been successfully returned.`, `Book Returned`);
        } else {
          toastStore.showSuccess(`Status for "${bookTitle}" changed to ${status}.`, `Update`);
        }
        
        // Refresh stores to instantly update the UI (bypassing local cache)
        borrowingsStore.fetchMyBorrowings(true);
        notificationsStore.loadNotifications();
      } else if (data.type === 'session_terminated') {
        if (authStore.token) {
          try {
            const decoded = jwtDecode(authStore.token);
            if (decoded.session_id === data.payload.session_id) {
              authStore.logout();
              window.location.href = '/login';
            }
          } catch (e) {}
        }
      } else if (data.type === 'new_borrowing_request') {
        if (authStore.isAdmin) {
          toastStore.showSuccess(
            `New book request for "${data.payload.book_title}"`, 
            'New Request Alert'
          );
          borrowingsStore.fetchAdminBorrowings('all', true);
          borrowingsStore.fetchAdminDashboardStats(true);
        }
      } else if (data.type === 'new_checkin') {
        if (authStore.isAdmin) {
          toastStore.showSuccess(
            `New check-in from ${data.payload.user_name}`, 
            'Check-In Alert'
          );
          window.dispatchEvent(new CustomEvent('refresh-admin-checkins'));
        }
      } else if (data.type === 'new_digital_read') {
        if (authStore.isAdmin) {
          // Throttle toasts during mass concurrency: only show 1 per second
          const now = Date.now();
          if (!window.lastReadToast || now - window.lastReadToast > 1000) {
            toastStore.showSuccess(
              `Student ${data.payload.user_name} started reading "${data.payload.book_title}"`, 
              'Live Reading Alert'
            );
            window.lastReadToast = now;
          }
          
          if (!borrowingsStore.dashboardStats) {
            borrowingsStore.dashboardStats = { active_readers_count: data.payload.total_active_readers || 1 };
          } else if (typeof data.payload.total_active_readers !== 'undefined') {
            borrowingsStore.dashboardStats.active_readers_count = data.payload.total_active_readers;
          }
          
          // Debounce dispatching the refresh event to prevent flooding
          if (window.readRefreshTimer) clearTimeout(window.readRefreshTimer);
          window.readRefreshTimer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-admin-digital-reads'));
          }, 300);
        }
      } else if (data.type === 'digital_read_ended') {
        if (authStore.isAdmin) {
          if (!borrowingsStore.dashboardStats) {
            borrowingsStore.dashboardStats = { active_readers_count: data.payload.total_active_readers || 0 };
          } else if (typeof data.payload.total_active_readers !== 'undefined') {
            borrowingsStore.dashboardStats.active_readers_count = data.payload.total_active_readers;
          }
          
          if (window.readEndRefreshTimer) clearTimeout(window.readEndRefreshTimer);
          window.readEndRefreshTimer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-admin-digital-reads'));
          }, 300);
        }
      } else if (data.type === 'active_readers_updated') {
        window.dispatchEvent(new CustomEvent('active_readers_updated', { detail: data.payload }));
      } else if (data.type === 'catalog_updated') {
        window.dispatchEvent(new CustomEvent('catalog_updated', { detail: data.payload }));
        // Trigger real-time catalog update
        import('./stores/books').then(module => {
          const booksStore = module.useBooksStore();
          if (data.payload?.type === 'categories') {
            booksStore.fetchCategories(true);
          } else if (data.payload?.type === 'books') {
            booksStore.fetchBooks(true);
          } else {
            booksStore.fetchCategories(true);
            booksStore.fetchBooks(true);
          }
        });
      } else if (data.type === 'wishlist_trends_updated') {
        if (authStore.isAdmin) {
           wishlistStore.fetchPopularBooks(true);
        }
      } else if (data.type === 'settings_updated') {
        import('./stores/settings').then(module => {
          const settingsStore = module.useSettingsStore();
          // Real-time optimistic update of frontend cache
          settingsStore.settings[data.payload.setting_key] = data.payload.setting_value;
        });
      }
    } catch (e) {
      console.error('SSE parsing error:', e);
    }
  };
  
  eventSource.onerror = () => {
    console.error('SSE connection lost. Forcing reconnect...');
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    // Try reconnecting after 2 seconds
    setTimeout(() => {
      setupSSE(authStore.token);
    }, 2000);
  };
}

watch(() => authStore.token, (newToken) => {
  setupSSE(newToken);
}, { immediate: true });

onMounted(() => {
  authStore.checkAuth();
  wishlistStore.fetchMyWishlist();
  requestPhoneNotificationPermission();
  
  // Re-establish connection when waking up from background on mobile
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('App became visible. Checking SSE connection...');
      if (authStore.token) {
        setupSSE(authStore.token);
      }
    }
  });
});
</script>


