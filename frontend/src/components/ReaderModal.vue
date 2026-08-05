<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content reader-modal glass-panel">
      <header class="reader-header">
        <div class="reader-title-group">
          <span class="reading-badge"><BookOpen :size="14" /> {{ localeStore.t('readerTitle') }}</span>
          <h2>{{ activeBook?.title }}</h2>
          <p class="reader-meta">By {{ activeBook?.author }} • {{ activeBook?.publisher }} ({{ activeBook?.publish_year }})</p>
        </div>
        <button @click="$emit('close')" class="btn-close">
          <X :size="20" />
        </button>
      </header>

      <div class="reader-controls">
        <div class="font-controls">
          <span class="control-label">{{ localeStore.t('fontSize') }}:</span>
          <button @click="fontSize = Math.max(13, fontSize - 2)" class="ctrl-btn">-</button>
          <span class="font-size-val">{{ fontSize }}px</span>
          <button @click="fontSize = Math.min(24, fontSize + 2)" class="ctrl-btn">+</button>
        </div>

        <div class="reader-mode">
          <span class="mode-tag">{{ localeStore.t('digitalEdition') }}</span>
        </div>
      </div>

      <div class="reader-body" :style="{ fontSize: fontSize + 'px' }">
        <div v-if="loadingFullBook" class="empty-content">
          <Loader2 :size="36" class="spin" />
          <p>Loading digital edition...</p>
        </div>
        <div v-else-if="activeBook?.digital_content" class="digital-text">
          <p v-for="(paragraph, index) in formattedParagraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>

        <div v-else-if="activeBook?.pdf_url" class="pdf-wrapper">
          <iframe :src="activeBook.pdf_url" class="pdf-iframe"></iframe>
        </div>

        <div v-else class="empty-content">
          <FileQuestion :size="48" class="text-muted" />
          <p>{{ localeStore.t('noDigitalContent') }}</p>
        </div>
      </div>

      <footer class="reader-footer">
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

<style scoped>
.reader-modal {
  max-width: 850px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.reading-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #8b5cf6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.reader-title-group h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
}

.reader-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.4rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: var(--text-primary);
  background: rgba(125, 125, 125, 0.15);
}

.reader-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: var(--bg-glass);
  border-bottom: 1px solid var(--border-color);
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.ctrl-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(125, 125, 125, 0.1);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.ctrl-btn:hover {
  background: rgba(125, 125, 125, 0.2);
}

.font-size-val {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.mode-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: rgba(125, 125, 125, 0.08);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.reader-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: var(--reader-bg);
  color: var(--text-primary);
  line-height: 1.8;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.digital-text p {
  margin-bottom: 1.5rem;
  text-align: justify;
}

.pdf-iframe {
  width: 100%;
  height: 500px;
  border: none;
  border-radius: var(--radius-md);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  color: var(--text-muted);
}

.reader-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  border-top: 1px solid var(--border-color);
  background: rgba(15, 23, 42, 0.6);
}
</style>
