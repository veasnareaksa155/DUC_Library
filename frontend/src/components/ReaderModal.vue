<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content max-w-[850px] max-h-[92vh] flex flex-col p-0 overflow-hidden glass-panel">
      <header class="flex justify-between items-start px-8 py-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div>
          <span class="inline-flex items-center gap-[0.35rem] text-[0.75rem] font-bold text-violet-500 uppercase tracking-wide mb-1"><BookOpen :size="14" /> {{ localeStore.t('readerTitle') }}</span>
          <h2 class="text-[1.35rem] font-bold text-[var(--text-primary)]">{{ activeBook?.title }}</h2>
          <p class="text-[0.85rem] text-[var(--text-secondary)]">By {{ activeBook?.author }} • {{ activeBook?.publisher }} ({{ activeBook?.publish_year }})</p>
        </div>
        <button @click="$emit('close')" class="bg-transparent border-none text-[var(--text-muted)] p-[0.4rem] rounded-full transition-all duration-200 hover:text-[var(--text-primary)] hover:bg-[rgba(125,125,125,0.15)]">
          <X :size="20" />
        </button>
      </header>

      <div class="flex justify-between items-center px-8 py-3 bg-[var(--bg-glass)] border-b border-[var(--border-color)]">
        <div class="flex items-center gap-2">
          <span class="text-[0.85rem] text-[var(--text-muted)]">{{ localeStore.t('fontSize') }}:</span>
          <button @click="fontSize = Math.max(13, fontSize - 2)" class="w-[28px] h-[28px] rounded-md bg-[rgba(125,125,125,0.1)] text-[var(--text-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold hover:bg-[rgba(125,125,125,0.2)]">-</button>
          <span class="text-[0.85rem] font-semibold min-w-[40px] text-center">{{ fontSize }}px</span>
          <button @click="fontSize = Math.min(24, fontSize + 2)" class="w-[28px] h-[28px] rounded-md bg-[rgba(125,125,125,0.1)] text-[var(--text-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold hover:bg-[rgba(125,125,125,0.2)]">+</button>
        </div>

        <div>
          <span class="text-[0.75rem] text-[var(--text-muted)] bg-[rgba(125,125,125,0.08)] px-[0.6rem] py-[0.2rem] rounded">{{ localeStore.t('digitalEdition') }}</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-8 bg-[var(--reader-bg)] text-[var(--text-primary)] leading-[1.8] transition-colors duration-300" :style="{ fontSize: fontSize + 'px' }">
        <div v-if="loadingFullBook" class="flex flex-col items-center justify-center py-16 px-4 gap-4 text-[var(--text-muted)]">
          <Loader2 :size="36" class="animate-spin" />
          <p>Loading digital edition...</p>
        </div>
        <div v-else-if="activeBook?.digital_content" class="text-justify [&>p]:mb-6">
          <p v-for="(paragraph, index) in formattedParagraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>

        <div v-else-if="activeBook?.pdf_url">
          <iframe :src="activeBook.pdf_url" class="w-full h-[500px] border-none rounded-[var(--radius-md)]"></iframe>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-16 px-4 gap-4 text-[var(--text-muted)]">
          <FileQuestion :size="48" class="text-[var(--text-muted)]" />
          <p>{{ localeStore.t('noDigitalContent') }}</p>
        </div>
      </div>

      <footer class="flex justify-between items-center px-8 py-5 border-t border-[var(--border-color)] bg-[#0f172a]/60">
        <button @click="$emit('close')" class="btn btn-secondary btn-sm">{{ localeStore.t('closeReader') }}</button>
        <button @click="$emit('borrow', activeBook)" class="btn btn-primary btn-sm">
          <BookmarkPlus :size="16" /> {{ localeStore.t('borrowPhysical') }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useLocaleStore } from '../stores/locale';
import { useBooksStore } from '../stores/books';
import { BookOpen, X, BookmarkPlus, FileQuestion, Loader2 } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  book: Object
});

defineEmits(['close', 'borrow']);

const localeStore = useLocaleStore();
const booksStore = useBooksStore();
const fontSize = ref(16);
const fullBook = ref(null);
const loadingFullBook = ref(false);

const activeBook = computed(() => fullBook.value || props.book);

watch(() => [props.isOpen, props.book], async ([open, b]) => {
  if (open && b) {
    if (b.digital_content || b.pdf_url) {
      fullBook.value = b;
    } else {
      loadingFullBook.value = true;
      try {
        const fetched = await booksStore.fetchBookById(b.id);
        fullBook.value = fetched;
      } catch (e) {
        fullBook.value = b;
      } finally {
        loadingFullBook.value = false;
      }
    }
  } else {
    fullBook.value = null;
    loadingFullBook.value = false;
  }
}, { immediate: true });

const formattedParagraphs = computed(() => {
  if (!activeBook.value?.digital_content) return [];
  return activeBook.value.digital_content.split('\n\n').filter(p => p.trim());
});
</script>

