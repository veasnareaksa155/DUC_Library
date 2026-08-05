<template>
  <div class="book-card glass-panel">
    <div class="cover-wrapper">
      <img :src="book.cover_url || fallbackCover" :alt="book.title" class="book-cover" loading="lazy" decoding="async" />
      <div class="cover-gradient-overlay"></div>
      
      <div class="category-badge">
        {{ book.category_name || 'General' }}
      </div>

      <button 
        @click.stop="handleWishlistToggle" 
        class="btn-wishlist-toggle"
        :class="{ active: isSaved }"
        :title="isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'"
      >
        <Heart :size="16" :fill="isSaved ? '#ef4444' : 'none'" />
      </button>
      
      <div class="availability-tag" :class="{ 'out-of-stock': book.copies_available <= 0 }">
        <span class="status-dot"></span>
        {{ book.copies_available > 0 ? `${book.copies_available} ${localeStore.t('available')}` : localeStore.t('outOfStock') }}
      </div>
    </div>

    <div class="book-info">
      <h3 class="book-title" :title="book.title">{{ book.title }}</h3>

      <div class="card-footer">
        <button @click.stop="$emit('read', book)" class="btn-read-action">
          <BookOpenCheck :size="15" />
          <span class="read-text">{{ localeStore.t('read') }}</span>
        </button>
        <button 
          @click.stop="$emit('borrow', book)" 
          class="btn-borrow-action"
          :disabled="book.copies_available <= 0"
          :title="localeStore.t('borrow')"
        >
          <BookmarkPlus :size="15" />
          <span class="borrow-text">{{ localeStore.t('borrow') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLocaleStore } from '../stores/locale';
import { useWishlistStore } from '../stores/wishlist';
import { Heart, BookOpenCheck, BookmarkPlus } from 'lucide-vue-next';

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['read', 'borrow', 'toast']);

import { useToastStore } from '../stores/toast';

const localeStore = useLocaleStore();
const wishlistStore = useWishlistStore();
const toastStore = useToastStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const isSaved = computed(() => wishlistStore.isInWishlist(props.book.id));

function handleWishlistToggle() {
  const added = wishlistStore.toggleWishlist(props.book.id);
  toastStore.showWishlist(props.book.title, added);
}

function truncateText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}
</script>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--radius-xl, 20px);
  overflow: hidden;
  position: relative;
  background: var(--bg-card, rgba(30, 41, 59, 0.7));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.3s ease, 
              border-color 0.3s ease;
  user-select: none;
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
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

.cover-wrapper {
  position: relative;
  width: 100%;
  height: 210px;
  overflow: hidden;
  background: #0f172a;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.05) 50%, rgba(15, 23, 42, 0.65) 100%);
  pointer-events: none;
}

/* Category Badge */
.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.25rem 0.7rem;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 2;
  transition: transform 0.25s ease;
}

.book-card:hover .category-badge {
  transform: translateY(-2px);
}

/* Wishlist Toggle Button */
.btn-wishlist-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.btn-wishlist-toggle:hover {
  transform: scale(1.15);
  background: rgba(15, 23, 42, 0.9);
  color: #ef4444;
}

.btn-wishlist-toggle.active {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.6);
  color: #ef4444;
  animation: heartPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes heartPop {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Availability Tag */
.availability-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(16, 185, 129, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  z-index: 2;
  transition: transform 0.25s ease;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 8px #ffffff;
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.availability-tag.out-of-stock {
  background: rgba(239, 68, 68, 0.88);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
}

.book-info {
  padding: 1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.book-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.55;
  padding: 0.1rem 0;
  margin-bottom: 0.3rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.book-author {
  font-size: 0.82rem;
  color: var(--accent-primary, #6366f1);
  font-weight: 600;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.book-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin-bottom: 1.1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: auto;
}

.btn-read-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 1rem;
  border-radius: 9999px;
  background: var(--accent-gradient, linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%));
  color: #ffffff;
  border: none;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.btn-read-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
  filter: brightness(1.08);
}

.btn-read-action:active {
  transform: scale(0.96);
}

.btn-borrow-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.btn-borrow-action:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.btn-borrow-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Mini App & Mobile Responsiveness */
@media (max-width: 640px) {
  .book-card {
    border-radius: 10px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }
  .cover-wrapper {
    width: 100%;
    aspect-ratio: 3 / 4;
    height: auto;
  }
  .book-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .category-badge {
    display: none;
  }
  .btn-wishlist-toggle {
    width: 22px;
    height: 22px;
    top: 4px;
    right: 4px;
  }
  .availability-tag {
    font-size: 0.52rem;
    padding: 0.08rem 0.3rem;
    bottom: 4px;
    right: 4px;
  }
  .book-info {
    padding: 0.35rem 0.4rem 0.45rem;
  }
  .book-title {
    font-size: 0.75rem;
    line-height: 1.5;
    padding: 0.1rem 0;
    margin-bottom: 0.2rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
  .book-author {
    font-size: 0.62rem;
    margin-bottom: 0.2rem;
  }
  .book-desc {
    display: none;
  }
  .card-footer {
    gap: 0.25rem;
    margin-top: 0.2rem;
  }
  .btn-read-action {
    padding: 0.25rem 0.4rem;
    font-size: 0.68rem;
    height: 26px;
    border-radius: 9999px;
  }
  .btn-borrow-action {
    width: 26px;
    height: 26px;
    padding: 0;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .btn-borrow-action .borrow-text {
    display: none;
  }
}
</style>
