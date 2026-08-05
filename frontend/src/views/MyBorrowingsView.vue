<template>
  <div class="borrowings-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">{{ localeStore.t('myBorrowingsTitle') }}</h1>
        <p class="page-subtitle">{{ localeStore.t('myBorrowingsSubtitle') }}</p>
      </div>
    </header>

    <div v-if="borrowingsStore.loading" class="loading-state">
      <Loader2 :size="36" class="spin" />
      <p>Loading your borrowing records...</p>
    </div>

    <div v-else-if="borrowingsStore.myBorrowings.length === 0" class="empty-state glass-panel">
      <BookmarkX :size="48" class="text-muted" />
      <h3>{{ localeStore.t('noActiveBorrowings') }}</h3>
      <p>{{ localeStore.t('noActiveBorrowingsSub') }}</p>
      <router-link to="/" class="btn btn-primary btn-sm mt-3">
        <Library :size="16" /> {{ localeStore.t('browseCatalog') }}
      </router-link>
    </div>

    <div v-else class="borrowings-list">
      <div v-for="item in borrowingsStore.myBorrowings" :key="item.id" class="borrow-card glass-panel">
        <img :src="item.book_cover || fallbackCover" :alt="item.book_title" class="book-cover" />
        
        <div class="borrow-details">
          <div class="status-header">
            <span class="badge" :class="`badge-${item.status}`">
              {{ localeStore.t(item.status) || item.status }}
            </span>
            <span class="borrow-date">{{ localeStore.t('requested') }} {{ formatDate(item.borrow_date) }}</span>
          </div>

          <h3 class="book-title">{{ item.book_title }}</h3>
          <p class="book-author">by {{ item.book_author }}</p>

          <div class="due-info">
            <Calendar :size="16" />
            <span>{{ localeStore.t('dueDate') }} <strong>{{ formatDate(item.due_date) }}</strong></span>
          </div>

          <div v-if="item.admin_notes" class="admin-note">
            <Info :size="14" /> Note: {{ item.admin_notes }}
          </div>

          <div class="borrow-actions">
            <button @click="openReader(item)" class="btn btn-secondary btn-sm">
              <BookOpen :size="16" /> {{ localeStore.t('read') }}
            </button>

            <button 
              v-if="item.status === 'approved'"
              @click="handleReturn(item.id)" 
              class="btn btn-primary btn-sm"
              :disabled="actionLoading === item.id"
            >
              <RotateCcw :size="16" /> 
              {{ actionLoading === item.id ? localeStore.t('returning') : localeStore.t('returnBook') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reader Modal -->
    <ReaderModal 
      :is-open="isReaderOpen" 
      :book="selectedBook" 
      @close="isReaderOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBorrowingsStore } from '../stores/borrowings';
import { useLocaleStore } from '../stores/locale';
import ReaderModal from '../components/ReaderModal.vue';
import { Loader2, BookmarkX, Library, Calendar, Info, BookOpen, RotateCcw } from 'lucide-vue-next';

const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const isReaderOpen = ref(false);
const selectedBook = ref(null);
const actionLoading = ref(null);

onMounted(() => {
  borrowingsStore.fetchMyBorrowings();
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function openReader(item) {
  selectedBook.value = {
    title: item.book_title,
    author: item.book_author,
    pdf_url: item.pdf_url,
    digital_content: item.digital_content
  };
  isReaderOpen.value = true;
}

async function handleReturn(borrowingId) {
  actionLoading.value = borrowingId;
  try {
    await borrowingsStore.returnBook(borrowingId);
  } catch (err) {
    alert(err.message || 'Failed to return book');
  } finally {
    actionLoading.value = null;
  }
}
</script>

<style scoped>
.borrowings-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
}

.page-subtitle {
  color: var(--text-secondary);
}

.borrowings-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.borrow-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.25rem;
}

.book-cover {
  width: 90px;
  height: 130px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.borrow-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.borrow-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.book-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.book-author {
  font-size: 0.88rem;
  color: var(--accent-primary);
  margin-bottom: 0.75rem;
}

.due-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.admin-note {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--warning);
  background: var(--warning-bg);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
}

.borrow-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.mt-3 {
  margin-top: 1rem;
}
</style>
