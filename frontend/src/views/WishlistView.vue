<template>
  <div class="wishlist-page-container">

    <!-- Notification Toast -->
    <div v-if="toastMessage" class="toast-alert glass-panel">
      <CheckCircle2 :size="20" class="text-success" />
      <span>{{ toastMessage }}</span>
      <button @click="toastMessage = ''" class="btn-close-toast"><X :size="16" /></button>
    </div>

    <!-- Main Content Section -->
    <main class="wishlist-main-section">
      <!-- Loading State -->
      <div v-if="booksStore.loading" class="loading-state">
        <Loader2 :size="36" class="spin" />
        <p>Loading your saved wishlist...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="wishlistBooks.length === 0" class="empty-wishlist-card glass-panel text-center">
        <div class="empty-heart-circle">
          <Heart :size="48" color="#ef4444" />
        </div>
        <h2 class="empty-title">Your Wishlist is Empty</h2>
        <p class="empty-desc">
          You haven't saved any books to your wishlist yet. Explore the library catalog and tap the heart icon on any book to save it here!
        </p>
        <router-link to="/catalog" class="btn btn-primary btn-lg mt-3">
          <BookOpen :size="18" /> Browse Catalog Now
        </router-link>
      </div>

      <!-- Wishlist Books Grid -->
      <div v-else class="wishlist-grid-wrapper">
        <div class="grid-header-bar">
          <span class="grid-label">Showing {{ wishlistBooks.length }} saved items</span>
          <button @click="clearAllWishlist" class="btn-clear-wishlist">
            <Trash2 :size="15" /> Clear All Wishlist
          </button>
        </div>

        <div class="wishlist-row-list">
          <div 
            v-for="book in wishlistBooks" 
            :key="book.id" 
            class="wishlist-row-card glass-panel"
          >
            <!-- Left Thumbnail Cover -->
            <div class="row-cover-wrapper" @click="openReaderModal(book)">
              <img :src="book.cover_url || fallbackCover" :alt="book.title" class="row-cover-img" loading="lazy" decoding="async" />
              <div class="row-stock-badge" :class="{ 'out-of-stock': book.copies_available <= 0 }">
                {{ book.copies_available > 0 ? `${book.copies_available} In Stock` : 'Out' }}
              </div>
            </div>

            <!-- Center Book Meta Info & Actions -->
            <div class="row-info-body">
              <div class="row-header-meta">
                <span class="row-category-tag">{{ book.category_name || 'General' }}</span>
                <span class="row-author">by {{ book.author || 'DUC Library' }}</span>
              </div>

              <h3 class="row-book-title" @click="openReaderModal(book)">{{ book.title }}</h3>

              <div class="row-actions">
                <button @click="openReaderModal(book)" class="btn btn-primary btn-sm">
                  <BookOpenCheck :size="14" /> Read
                </button>
                <button 
                  @click="openBorrowModal(book)" 
                  class="btn btn-secondary btn-sm" 
                  :disabled="book.copies_available <= 0"
                >
                  <BookmarkPlus :size="14" /> Borrow
                </button>
              </div>
            </div>

            <!-- Right Remove Heart Action Button -->
            <button 
              @click.stop="removeFromWishlist(book)" 
              class="row-remove-btn" 
              title="Remove from Wishlist"
            >
              <Heart :size="16" fill="#ef4444" color="#ef4444" />
              <span class="remove-text">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Reader Modal -->
    <ReaderModal 
      :is-open="isReaderOpen" 
      :book="selectedBook" 
      @close="isReaderOpen = false"
      @borrow="openBorrowFromReader"
    />

    <!-- Borrow Modal -->
    <BorrowModal 
      :is-open="isBorrowOpen" 
      :book="selectedBook" 
      @close="isBorrowOpen = false"
      @success="handleBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useWishlistStore } from '../stores/wishlist';
import { useRouter } from 'vue-router';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { 
  Heart, Bookmark, BookOpen, BookOpenCheck, BookmarkPlus, 
  Trash2, Loader2, CheckCircle2, X 
} from 'lucide-vue-next';

import { useToastStore } from '../stores/toast';

const booksStore = useBooksStore();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const toastStore = useToastStore();
const router = useRouter();

const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const selectedBook = ref(null);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);

const wishlistBooks = computed(() => {
  return (booksStore.books || []).filter(b => wishlistStore.isInWishlist(b.id));
});

onMounted(() => {
  booksStore.fetchBooks();
});

function removeFromWishlist(book) {
  wishlistStore.toggleWishlist(book.id);
  toastStore.showWishlist(book.title, false);
}

function clearAllWishlist() {
  wishlistStore.wishlistIds = [];
  wishlistStore.saveWishlist();
  toastStore.showSuccess('Wishlist collection cleared! 💔', 'Cleared Wishlist');
}

function openReaderModal(book) {
  router.push(`/read/${book.id}`);
}

function openBorrowModal(book) {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/wishlist' } });
    return;
  }
  selectedBook.value = book;
  isBorrowOpen.value = true;
}

function openBorrowFromReader(book) {
  isReaderOpen.value = false;
  openBorrowModal(book);
}

function handleBorrowSuccess(msg) {
  toastMessage.value = msg || 'Borrowing request submitted successfully!';
  booksStore.fetchBooks();
}
</script>

<style scoped>
.wishlist-page-container {
  max-width: 1560px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 4rem;
}

.wishlist-hero-header {
  padding: 2.25rem 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.heart-badge-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.text-gradient-red {
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.wishlist-counter-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  font-size: 0.88rem;
  font-weight: 700;
}

.toast-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  margin-bottom: 1.5rem;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  border-radius: var(--radius-md);
}

.btn-close-toast {
  margin-left: auto;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}

.empty-wishlist-card {
  max-width: 540px;
  margin: 3rem auto;
  padding: 3.5rem 2rem;
  border-radius: var(--radius-lg);
}

.empty-heart-circle {
  width: 88px;
  height: 88px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 35px rgba(239, 68, 68, 0.25);
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 1.5rem;
}

.grid-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.grid-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-muted);
}

.btn-clear-wishlist {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear-wishlist:hover {
  background: rgba(239, 68, 68, 0.25);
}

.wishlist-row-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.wishlist-row-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.wishlist-row-card:hover {
  border-color: rgba(239, 68, 68, 0.35);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.12);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.row-cover-wrapper {
  position: relative;
  width: 96px;
  height: 128px;
  flex-shrink: 0;
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
  cursor: pointer;
  background: #0f172a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.row-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-stock-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  padding: 0.1rem 0.2rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.9);
  color: #ffffff;
  font-size: 0.58rem;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-stock-badge.out-of-stock {
  background: rgba(239, 68, 68, 0.9);
}

.row-info-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.row-header-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.row-category-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: #818cf8;
  text-transform: uppercase;
}

.row-author {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.row-book-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.5;
  padding: 0.1rem 0;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.row-remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.8rem;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.row-remove-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.05);
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .wishlist-page-container {
    padding: 0.75rem 0.5rem 5rem;
  }
  .wishlist-row-card {
    padding: 0.65rem 0.75rem;
    gap: 0.65rem;
  }
  .row-cover-wrapper {
    width: 82px;
    height: 110px;
  }
  .row-book-title {
    font-size: 0.84rem;
  }
  .row-remove-btn .remove-text {
    display: none;
  }
  .row-remove-btn {
    padding: 0.4rem;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    justify-content: center;
  }
}
</style>
