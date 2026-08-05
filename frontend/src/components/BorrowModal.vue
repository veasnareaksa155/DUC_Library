<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content glass-panel">
      <header class="modal-header">
        <h2>{{ localeStore.t('borrowTitle') }}</h2>
        <button @click="$emit('close')" class="btn-close"><X :size="20" /></button>
      </header>

      <div class="modal-body">
        <div class="book-summary">
          <img :src="book?.cover_url || fallbackCover" :alt="book?.title" class="summary-cover" />
          <div class="summary-details">
            <h3>{{ book?.title }}</h3>
            <p class="author">By {{ book?.author }}</p>
            <span class="stock-badge">{{ book?.copies_available }} {{ localeStore.t('available') }}</span>
          </div>
        </div>

        <div class="duration-selector">
          <label class="form-label">{{ localeStore.t('selectDuration') }}</label>
          <div class="duration-options">
            <button 
              v-for="d in [7, 14, 21, 30]" 
              :key="d"
              @click="selectedDays = d"
              class="duration-btn"
              :class="{ active: selectedDays === d }"
            >
              {{ d }} {{ localeStore.t('days') }}
            </button>
          </div>
        </div>

        <div class="due-date-preview">
          <Calendar :size="18" class="icon-calendar" />
          <span>{{ localeStore.t('expectedReturn') }} <strong>{{ calculatedDueDate }}</strong></span>
        </div>

        <div v-if="error" class="error-msg">
          {{ error }}
        </div>
      </div>

      <footer class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">{{ localeStore.t('cancel') }}</button>
        <button @click="handleConfirm" class="btn btn-primary" :disabled="loading">
          <BookmarkPlus :size="18" />
          {{ loading ? localeStore.t('submitting') : localeStore.t('confirmRequest') }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBorrowingsStore } from '../stores/borrowings';
import { useLocaleStore } from '../stores/locale';
import { X, Calendar, BookmarkPlus } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  book: Object
});

const emit = defineEmits(['close', 'success']);

const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();
const selectedDays = ref(14);
const loading = ref(false);
const error = ref('');

const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const calculatedDueDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + selectedDays.value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

async function handleConfirm() {
  if (!props.book) return;
  loading.value = true;
  error.value = '';
  try {
    const res = await borrowingsStore.requestBorrow(props.book.id, selectedDays.value);
    emit('success', res.message);
    emit('close');
  } catch (err) {
    error.value = err.message || 'Failed to request borrow.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
}

.book-summary {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(125, 125, 125, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.summary-cover {
  width: 60px;
  height: 85px;
  object-fit: cover;
  border-radius: 6px;
}

.summary-details h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.summary-details .author {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.stock-badge {
  font-size: 0.75rem;
  color: var(--success);
  font-weight: 600;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.duration-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.duration-btn {
  padding: 0.6rem;
  background: rgba(125, 125, 125, 0.08);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.duration-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.due-date-preview {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px dashed rgba(99, 102, 241, 0.3);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.icon-calendar {
  color: var(--accent-primary);
}

.error-msg {
  padding: 0.75rem;
  background: var(--danger-bg);
  color: #ef4444;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
