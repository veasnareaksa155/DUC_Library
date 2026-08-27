<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200" @click.self="$emit('close')">
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
      <header class="flex justify-between items-center px-5 py-4 border-b border-[var(--border-color)]">
        <h2 class="text-[1.1rem] font-bold text-[var(--text-primary)] tracking-tight">{{ localeStore.t('borrowTitle') }}</h2>
        <button @click="$emit('close')" class="bg-transparent border-none text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"><X :size="18" /></button>
      </header>

      <div class="px-5 py-5">
        <div class="flex gap-4 p-3 bg-[var(--bg-input)] rounded-md border border-[var(--border-color)] mb-6">
          <img :src="book?.cover_url || fallbackCover" :alt="book?.title" class="w-[50px] h-[75px] object-contain rounded bg-[var(--bg-card)] border border-[var(--border-color)]" />
          <div class="flex flex-col justify-center">
            <h3 class="text-[0.95rem] font-bold mb-0.5 text-[var(--text-primary)] leading-tight">{{ book?.title }}</h3>
            <p class="text-[0.8rem] text-[var(--text-secondary)] mb-1.5">By {{ book?.author }}</p>
            <span class="inline-flex items-center gap-1 text-[0.7rem] font-bold text-emerald-600 dark:text-emerald-400"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{{ book?.copies_available }} {{ localeStore.t('available') }}</span>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-[0.85rem] font-bold mb-2.5 text-[var(--text-primary)]">{{ localeStore.t('selectDuration') }}</label>
          <div class="grid grid-cols-4 gap-2">
            <button 
              v-for="d in settingsStore.borrowingDurations" 
              :key="d"
              @click="selectedDays = d"
              class="h-10 border rounded-md font-bold text-[0.8rem] transition-colors cursor-pointer"
              :class="selectedDays === d ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'"
            >
              {{ d }} {{ localeStore.t('days') }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between p-3.5 bg-transparent border border-[var(--border-color)] rounded-md text-[0.85rem] text-[var(--text-primary)] mb-6">
          <div class="flex items-center gap-2 text-[var(--text-muted)] font-semibold">
            <Calendar :size="16" />
            <span>{{ localeStore.t('expectedReturn') }}</span>
          </div>
          <strong class="font-bold text-[var(--text-primary)]">{{ calculatedDueDate }}</strong>
        </div>

      </div>

      <footer class="flex justify-end gap-3 px-5 py-4 border-t border-[var(--border-color)] bg-[var(--bg-card-hover)]">
        <button @click="$emit('close')" class="h-9 px-4 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] text-[0.85rem] font-bold hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">{{ localeStore.t('cancel') }}</button>
        <button @click="handleConfirm" class="h-9 px-5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white border-none text-[0.85rem] font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50" :disabled="loading">
          <BookmarkPlus :size="16" />
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
import { useToastStore } from '../stores/toast';
import { useSettingsStore } from '../stores/settings';
import { X, Calendar, BookmarkPlus } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  book: Object
});

const emit = defineEmits(['close', 'success']);

const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();
const settingsStore = useSettingsStore();
const selectedDays = ref(14);
const loading = ref(false);

import { onMounted, watch } from 'vue';

onMounted(() => {
  settingsStore.fetchSettings().then(() => {
    if (!settingsStore.borrowingDurations.includes(selectedDays.value)) {
      selectedDays.value = settingsStore.borrowingDurations[0] || 14;
    }
  });
});

watch(() => props.isOpen, async (open) => {
  if (open) {
    // Fetch fresh settings every time the modal opens to guarantee immediate updates
    await settingsStore.fetchSettings();
    if (!settingsStore.borrowingDurations.includes(selectedDays.value)) {
      selectedDays.value = settingsStore.borrowingDurations[0] || 14;
    }
  }
});

const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const calculatedDueDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + selectedDays.value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

async function handleConfirm() {
  if (!props.book) return;
  loading.value = true;
  try {
    const res = await borrowingsStore.requestBorrow(props.book.id, selectedDays.value);
    toastStore.showSuccess(res.message || 'Book borrowing request submitted successfully!', 'Request Sent');
    emit('success', res.message);
    emit('close');
  } catch (err) {
    toastStore.showError(err.message || 'Failed to request borrow.', 'Action Denied');
    emit('close');
  } finally {
    loading.value = false;
  }
}
</script>

