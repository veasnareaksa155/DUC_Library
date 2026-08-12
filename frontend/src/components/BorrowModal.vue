<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content glass-panel">
      <header class="flex justify-between items-center mb-6">
        <h2>{{ localeStore.t('borrowTitle') }}</h2>
        <button @click="$emit('close')" class="bg-transparent border-none text-[var(--text-muted)] cursor-pointer hover:text-slate-200"><X :size="20" /></button>
      </header>

      <div class="modal-body">
        <div class="flex gap-4 p-4 bg-gray-500/5 rounded-[var(--radius-md)] border border-[var(--border-color)] mb-6">
          <img :src="book?.cover_url || fallbackCover" :alt="book?.title" class="w-[60px] h-[85px] object-cover rounded-md" />
          <div class="summary-details">
            <h3 class="text-base font-bold mb-1">{{ book?.title }}</h3>
            <p class="text-[0.85rem] text-[var(--text-secondary)] mb-1.5">By {{ book?.author }}</p>
            <span class="text-[0.75rem] text-[var(--success)] font-semibold">{{ book?.copies_available }} {{ localeStore.t('available') }}</span>
          </div>
        </div>

        <div class="duration-selector">
          <label class="block text-[0.9rem] font-semibold mb-2 text-[var(--text-primary)]">{{ localeStore.t('selectDuration') }}</label>
          <div class="grid grid-cols-4 gap-2 mb-6">
            <button 
              v-for="d in [7, 14, 21, 30]" 
              :key="d"
              @click="selectedDays = d"
              class="p-2.5 border rounded-[var(--radius-md)] font-semibold text-[0.85rem] transition-all duration-200 cursor-pointer"
              :class="selectedDays === d ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-gray-500/10 border-[var(--border-color)] text-[var(--text-secondary)]'"
            >
              {{ d }} {{ localeStore.t('days') }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2.5 p-3.5 bg-indigo-500/10 border border-dashed border-indigo-500/30 rounded-[var(--radius-md)] text-[0.9rem] text-[var(--text-primary)] mb-6">
          <Calendar :size="18" class="text-[var(--accent-primary)]" />
          <span>{{ localeStore.t('expectedReturn') }} <strong>{{ calculatedDueDate }}</strong></span>
        </div>

        <div v-if="error" class="p-3 bg-[var(--danger-bg)] text-red-500 rounded-[var(--radius-md)] text-[0.85rem] mb-4">
          {{ error }}
        </div>
      </div>

      <footer class="flex justify-end gap-3">
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

