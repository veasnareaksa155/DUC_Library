<template>
  <div class="group flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden transition-all duration-200 hover:border-[var(--border-highlight)] select-none">
    
    <!-- Cover Image Section -->
    <div class="relative w-full h-[220px] max-sm:h-[180px] bg-[var(--bg-input)] overflow-hidden flex items-center justify-center p-4">
      <img :src="book.cover_url || fallbackCover" :alt="book.title" class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.05] drop-shadow-md" loading="lazy" decoding="async" />
      
      <!-- Wishlist Heart Button -->
      <button 
        @click.stop="handleWishlistToggle" 
        class="absolute top-3 right-3 w-7 h-7 rounded-md bg-[var(--bg-card)] text-[var(--text-muted)] flex items-center justify-center cursor-pointer z-10 transition-colors shadow-sm hover:text-red-500 border border-[var(--border-color)]"
        :class="{ 'text-red-500': isSaved }"
        :title="isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'"
      >
        <Heart :size="14" :fill="isSaved ? 'currentColor' : 'none'" />
      </button>
      
      <!-- Availability Indicator -->
      <div class="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] text-[0.65rem] font-bold px-2 py-1 rounded-md shadow-sm z-10">
        <span class="w-1.5 h-1.5 rounded-full" :class="book.copies_available > 0 ? 'bg-emerald-500' : 'bg-red-500'"></span>
        {{ book.copies_available > 0 ? `${book.copies_available}` : '0' }}
      </div>
    </div>

    <!-- Details Section -->
    <div class="p-4 flex flex-col flex-1 max-sm:p-3">
      <div class="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
        {{ book.category_name || 'General' }}
      </div>
      <h3 class="text-[0.95rem] py-1 font-bold text-[var(--text-primary)] leading-normal pb-1.5 mb-2.5 line-clamp-2" :title="book.title">{{ book.title }}</h3>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 mt-auto">
        <button @click.stop="$emit('read', book)" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--text-secondary)] text-[0.8rem] font-semibold transition-colors border-none cursor-pointer">
          <BookOpenCheck :size="14" />
          <span>{{ localeStore.t('read') }}</span>
        </button>
        <button 
          @click.stop="$emit('borrow', book)" 
          class="inline-flex items-center justify-center px-3 py-2 rounded-md bg-transparent border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-[0.8rem] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          :disabled="book.copies_available <= 0"
          :title="localeStore.t('borrow')"
        >
          <BookmarkPlus :size="14" />
          <span class="ml-1 max-sm:hidden">{{ localeStore.t('borrow') }}</span>
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


