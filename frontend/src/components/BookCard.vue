<template>
  <div class="group flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-1">
    
    <!-- Cover Image Section -->
    <div class="p-3 pb-0">
      <div @click="goToDetails" class="relative w-full aspect-[4/5] bg-[var(--bg-secondary)] dark:bg-[var(--bg-input)] rounded-lg overflow-hidden cursor-pointer flex items-center justify-center p-4">
        
        <img :src="book.cover_url || fallbackCover" :alt="book.title" class="h-[95%] w-auto object-contain shadow-lg transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />

        <!-- Wishlist Heart Button -->
        <button 
          @click.stop="handleWishlistToggle" 
          class="absolute top-2.5 right-2.5 w-8 h-8 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer z-10 transition-all duration-200 shadow-sm hover:text-red-500 hover:border-red-500/30"
          :class="{ 'text-red-500': isSaved }"
          :title="isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'"
        >
          <Heart :size="15" :fill="isSaved ? 'currentColor' : 'none'" />
        </button>
        
        <!-- Availability Indicator -->
        <div class="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] px-2 py-1 rounded-md shadow-sm z-10 text-[0.7rem] font-bold">
          <span class="w-1.5 h-1.5 rounded-full" :class="book.copies_available > 0 ? 'bg-emerald-500' : 'bg-red-500'"></span>
          {{ book.copies_available > 0 ? book.copies_available : 'Out' }}
        </div>
      </div>
    </div>

    <!-- Details Section -->
    <div class="p-4 pt-4 flex flex-col flex-1">
      <div class="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 line-clamp-1">
        {{ book.category_name || 'General' }}
      </div>
      <h3 @click="goToDetails" class="text-[0.95rem] font-bold text-[var(--text-primary)] leading-snug mb-4 line-clamp-2 cursor-pointer hover:text-[var(--text-muted)] transition-colors pb-2" style="line-height: 25px;" :title="book.title">{{ book.title }}</h3>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 mt-auto">
        <button @click.stop="handleRead" class="flex-1 inline-flex whitespace-nowrap items-center justify-center gap-1.5 px-2 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 text-[0.8rem] font-bold transition-all shadow-sm active:scale-95 border-none cursor-pointer">
          <BookOpenCheck :size="16" class="shrink-0" />
          <span class="truncate">{{ localeStore.t('read') || 'Read' }}</span>
        </button>
        <button 
          @click.stop="handleBorrow" 
          class="flex-1 inline-flex whitespace-nowrap items-center justify-center gap-1.5 px-2 py-2 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-[0.8rem] font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          :disabled="book.copies_available <= 0"
        >
          <BookmarkPlus :size="16" class="shrink-0" />
          <span class="truncate">{{ localeStore.t('borrow') || 'Borrow' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../stores/locale';
import { useWishlistStore } from '../stores/wishlist';
import { useAuthStore } from '../stores/auth';
import { Heart, BookOpenCheck, BookmarkPlus } from 'lucide-vue-next';

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['read', 'borrow', 'toast']);

import { useToastStore } from '../stores/toast';

const router = useRouter();
const localeStore = useLocaleStore();
const wishlistStore = useWishlistStore();
const toastStore = useToastStore();
const authStore = useAuthStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const isSaved = computed(() => wishlistStore.isInWishlist(props.book.id));

function handleWishlistToggle() {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to add to wishlist!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  const added = wishlistStore.toggleWishlist(props.book.id);
  toastStore.showWishlist(props.book.title, added);
}

function handleRead() {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to read books!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  emit('read', props.book);
}

function handleBorrow() {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to borrow books!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  emit('borrow', props.book);
}

function truncateText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function goToDetails() {
  router.push(`/book/${props.book.id}`);
}
</script>


