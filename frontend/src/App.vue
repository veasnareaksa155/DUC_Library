<template>
  <div id="app-root">
    <Navbar v-if="!hideGlobalNav" />
    <MobileHeader v-if="!hideGlobalNav" />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <MobileAppNavBar />
    <ScrollToTop />
    <ToastNotification />
    <footer v-if="!hideGlobalNav" class="app-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <!-- Col 1: Brand & Mission -->
          <div class="footer-col brand-col">
            <div class="footer-logo-row">
              <img src="/duc-logo.png" alt="DUC Logo" class="footer-duc-logo" />
              <span class="footer-brand-title">DUC <span class="text-gradient">Digital Library</span></span>
            </div>
            <p class="footer-about">
              Empowering students, faculty, and researchers with digital learning resources, e-books, physical book reservations, and academic tools.
            </p>
            <div class="footer-accreditation">
              <span class="accreditation-badge">DUC Academic Excellence System</span>
            </div>
          </div>

          <!-- Col 2: Quick Links -->
          <div class="footer-col">
            <h4 class="footer-heading">Quick Navigation</h4>
            <ul class="footer-links-list">
              <li><router-link to="/">Library Catalog</router-link></li>
              <li><router-link to="/my-borrowings">My Borrowed Books</router-link></li>
              <li><router-link to="/login">Student & Staff Portal</router-link></li>
              <li><router-link to="/register">Create Library Account</router-link></li>
            </ul>
          </div>

          <!-- Col 3: Services & Support -->
          <div class="footer-col">
            <h4 class="footer-heading">Library Services</h4>
            <ul class="footer-links-list">
              <li><span>Digital PDF E-Reader</span></li>
              <li><span>Online Book Reservation</span></li>
              <li><span>Physical Book Borrowing</span></li>
              <li><span>Official Report Generator</span></li>
            </ul>
          </div>

          <!-- Col 4: Contact & Hours -->
          <div class="footer-col">
            <h4 class="footer-heading">Contact & Hours</h4>
            <div class="contact-info-list">
              <p><strong>Hours:</strong> Mon - Sat (7:30 AM - 8:00 PM)</p>
              <p><strong>Campus:</strong> DUC Resource Center</p>
              <p><strong>Email:</strong> library@duc.edu.kh</p>
              <p><strong>Desk:</strong> +855 (0) 23 888 999</p>
            </div>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <p>&copy; 2026 <strong>DUC Digital Library</strong>. All Rights Reserved. Dewey International University Library.</p>
          <div class="footer-legal-pills">
            <span>Privacy Policy</span> •
            <span>Library Regulations</span> •
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

<style scoped>
#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}

.app-footer {
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  padding: 3rem 1.5rem 1.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.footer-container {
  max-width: 1560px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
}

.footer-logo-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.footer-duc-logo {
  height: 44px;
  width: auto;
  object-fit: contain;
}

.footer-brand-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.footer-about {
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.accreditation-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--accent-primary, #6366f1);
}

.footer-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.footer-links-list a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links-list a:hover {
  color: var(--accent-primary);
}

.footer-links-list span {
  color: var(--text-secondary);
}

.contact-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.contact-info-list p {
  margin: 0;
  line-height: 1.4;
}

.contact-info-list strong {
  color: var(--text-primary);
}

.footer-bottom-bar {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.footer-bottom-bar p {
  margin: 0;
}

.footer-legal-pills {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .app-main {
    padding-bottom: 72px;
  }
  .app-footer {
    display: none;
  }
}
</style>
