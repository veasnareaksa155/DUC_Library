<template>
  <div class="group flex flex-col h-full rounded-[var(--radius-xl,20px)] overflow-hidden relative bg-[var(--bg-card,rgba(30,41,59,0.7))] border border-[var(--border-color,rgba(255,255,255,0.08))] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)_both] max-sm:rounded-[10px] max-sm:shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
    <div class="relative w-full h-[210px] overflow-hidden bg-slate-900 max-sm:aspect-[3/4] max-sm:h-auto">
      <img :src="book.cover_url || fallbackCover" :alt="book.title" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/25 via-slate-900/5 to-slate-900/65 pointer-events-none"></div>
      
      <div class="absolute top-2.5 left-2.5 bg-slate-900/70 backdrop-blur-md border border-white/20 text-slate-100 text-[0.7rem] font-bold tracking-[0.02em] px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)] z-[2] transition-transform duration-250 ease-out group-hover:-translate-y-0.5 max-sm:hidden">
        {{ book.category_name || 'General' }}
      </div>

      <button 
        @click.stop="handleWishlistToggle" 
        class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-slate-400 flex items-center justify-center cursor-pointer z-10 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:scale-[1.15] hover:bg-slate-900/90 hover:text-red-500 max-sm:w-[22px] max-sm:h-[22px] max-sm:top-1 max-sm:right-1"
        :class="{ 'bg-red-500/25 border-red-500/60 text-red-500 animate-[heartPop_0.35s_cubic-bezier(0.34,1.56,0.64,1)]': isSaved }"
        :title="isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'"
      >
        <Heart :size="16" :fill="isSaved ? '#ef4444' : 'none'" class="max-sm:scale-75" />
      </button>
      
      <div class="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white border border-white/30 text-[0.7rem] font-bold px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.35)] z-[2] transition-transform duration-250 ease-out max-sm:text-[0.52rem] max-sm:px-1.5 max-sm:py-0.5 max-sm:bottom-1 max-sm:right-1" :class="{ 'bg-red-500/90 shadow-[0_4px_12px_rgba(239,68,68,0.35)]': book.copies_available <= 0 }">
        <span class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-[pulse-dot_1.8s_infinite]"></span>
        {{ book.copies_available > 0 ? `${book.copies_available} ${localeStore.t('available')}` : localeStore.t('outOfStock') }}
      </div>
    </div>

    <div class="p-4 pb-[1.1rem] flex flex-col flex-1 max-sm:px-1.5 max-sm:py-[0.35rem] max-sm:pb-[0.45rem]">
      <h3 class="text-[0.95rem] font-bold text-[var(--text-primary)] leading-[1.55] py-0.5 mb-1 line-clamp-2 break-words max-sm:text-[0.75rem] max-sm:leading-[1.5] max-sm:mb-0.5" :title="book.title">{{ book.title }}</h3>

      <div class="flex items-center gap-2.5 mt-auto max-sm:gap-1 max-sm:mt-1">
        <button @click.stop="$emit('read', book)" class="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none text-[0.84rem] font-bold cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:brightness-110 active:scale-[0.96] max-sm:px-1.5 max-sm:py-1 max-sm:text-[0.68rem] max-sm:h-[26px]">
          <BookOpenCheck :size="15" />
          <span>{{ localeStore.t('read') }}</span>
        </button>
        <button 
          @click.stop="$emit('borrow', book)" 
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 border border-white/15 text-[var(--text-primary)] text-[0.82rem] font-semibold cursor-pointer backdrop-blur-md transition-all duration-200 hover:not(:disabled):bg-indigo-500/15 hover:not(:disabled):border-indigo-500 hover:not(:disabled):text-indigo-500 hover:not(:disabled):-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed max-sm:w-[26px] max-sm:h-[26px] max-sm:p-0 max-sm:shrink-0"
          :disabled="book.copies_available <= 0"
          :title="localeStore.t('borrow')"
        >
          <BookmarkPlus :size="15" class="max-sm:scale-90" />
          <span class="max-sm:hidden">{{ localeStore.t('borrow') }}</span>
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


