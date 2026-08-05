<template>
  <div class="detail-container">
    <button @click="router.back()" class="btn btn-secondary btn-sm back-btn">
      <ArrowLeft :size="16" /> Back to Catalog
    </button>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="36" class="spin" />
      <p>Loading book details...</p>
    </div>

    <div v-else-if="book" class="book-detail-card glass-panel">
      <div class="detail-grid">
        <div class="cover-col">
          <img :src="book.cover_url || fallbackCover" :alt="book.title" class="detail-cover" />
        </div>

        <div class="info-col">
          <span class="cat-badge">{{ book.category_name || 'General' }}</span>
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author">by {{ book.author }}</p>

          <div class="meta-row">
            <span class="meta-item">Publisher: <strong>{{ book.publisher || 'N/A' }}</strong></span>
            <span class="meta-item">Year: <strong>{{ book.publish_year || 'N/A' }}</strong></span>
            <span class="meta-item">ISBN: <strong>{{ book.isbn || 'N/A' }}</strong></span>
          </div>

          <div class="stock-banner" :class="{ 'out-of-stock': book.copies_available <= 0 }">
            <PackageCheck :size="18" />
            <span>{{ book.copies_available > 0 ? `${book.copies_available} of ${book.copies_total} physical copies available` : 'Currently Out of Stock' }}</span>
          </div>

          <div class="desc-section">
            <h3>Synopsis & Description</h3>
            <p>{{ book.description || 'No description provided.' }}</p>
          </div>

          <div class="detail-actions">
            <button @click="router.push(`/read/${book.id}`)" class="btn btn-secondary">
              <BookOpen :size="18" /> Read Digital Book
            </button>
            <button 
              @click="openBorrow" 
              class="btn btn-primary"
              :disabled="book.copies_available <= 0"
            >
              <BookmarkPlus :size="18" /> Borrow Book
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reader Modal -->
    <ReaderModal 
      :is-open="isReaderOpen" 
      :book="book" 
      @close="isReaderOpen = false"
      @borrow="openBorrowFromReader"
    />

    <!-- Borrow Modal -->
    <BorrowModal 
      :is-open="isBorrowOpen" 
      :book="book" 
      @close="isBorrowOpen = false"
      @success="handleBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { ArrowLeft, Loader2, PackageCheck, BookOpen, BookmarkPlus } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const booksStore = useBooksStore();
const authStore = useAuthStore();

const book = ref(null);
const loading = ref(true);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

onMounted(async () => {
  try {
    book.value = await booksStore.fetchBookById(route.params.id);
  } catch (err) {
    console.error('Failed to load book:', err);
  } finally {
    loading.value = false;
  }
});

function openBorrow() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  isBorrowOpen.value = true;
}

function openBorrowFromReader() {
  isReaderOpen.value = false;
  openBorrow();
}

function handleBorrowSuccess(msg) {
  alert(msg);
  booksStore.fetchBookById(route.params.id).then(res => book.value = res);
}
</script>

<style scoped>
.detail-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

.back-btn {
  margin-bottom: 1.5rem;
}

.book-detail-card {
  padding: 2.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
}

.detail-cover {
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.cat-badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.book-title {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 0.35rem;
}

.book-author {
  font-size: 1.1rem;
  color: var(--accent-primary);
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.meta-row {
  display: flex;
  gap: 1.5rem;
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.stock-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.25rem;
  background: var(--success-bg);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.stock-banner.out-of-stock {
  background: var(--danger-bg);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.desc-section {
  margin-bottom: 2rem;
}

.desc-section h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.desc-section p {
  color: var(--text-secondary);
  line-height: 1.7;
}

.detail-actions {
  display: flex;
  gap: 1rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
