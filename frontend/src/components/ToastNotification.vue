<template>
  <Transition name="toast-slide">
    <div 
      v-if="toastStore.isVisible" 
      class="fixed bottom-6 right-6 max-sm:bottom-auto max-sm:top-20 max-sm:right-4 max-sm:left-auto z-[999999] w-auto max-sm:w-auto min-w-[320px] max-w-[380px] pointer-events-auto"
      :class="toastStore.type"
      @click="toastStore.hide"
    >
      <div class="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-secondary)] shadow-lg border border-[var(--border-color)] cursor-pointer transition-transform duration-200 active:scale-[0.98]">
        
        <!-- Minimal Naked Icon -->
        <div class="shrink-0 mt-0.5">
          <Heart v-if="toastStore.type === 'wishlist-add'" :size="18" class="text-indigo-500 fill-indigo-500" />
          <HeartOff v-else-if="toastStore.type === 'wishlist-remove'" :size="18" class="text-[var(--text-muted)]" />
          <CheckCircle2 v-else-if="toastStore.type === 'success'" :size="18" class="text-emerald-500" stroke-width="2.5" />
          <AlertCircle v-else-if="toastStore.type === 'error'" :size="18" class="text-red-500" stroke-width="2.5" />
          <Info v-else :size="18" class="text-blue-500" stroke-width="2.5" />
        </div>

        <!-- Sleek Text Content -->
        <div class="flex-1 min-w-0">
          <h4 class="text-[0.875rem] font-semibold text-[var(--text-primary)] m-0 mb-0.5 tracking-tight leading-tight">{{ toastStore.title }}</h4>
          <p class="text-[0.8rem] text-[var(--text-secondary)] m-0 leading-relaxed line-clamp-2">{{ toastStore.message }}</p>
        </div>

        <!-- Hidden Close Button (Shows on Hover) -->
        <button @click.stop="toastStore.hide" class="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 -mr-2 -mt-1 rounded-md transition-colors cursor-pointer border-none bg-transparent opacity-0 group-hover:opacity-100 focus:opacity-100">
          <X :size="14" />
        </button>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useToastStore } from '../stores/toast';
import { Heart, HeartOff, CheckCircle2, Info, X, AlertCircle } from 'lucide-vue-next';

const toastStore = useToastStore();
</script>

<style scoped>
/* Spring entrance slide animation for Bottom Right */
.toast-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
</style>
