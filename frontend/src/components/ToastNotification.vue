<template>
  <Transition name="toast-slide">
    <div 
      v-if="toastStore.isVisible" 
      class="fixed top-6 right-6 max-sm:top-4 max-sm:right-4 max-sm:left-4 z-[99999] w-auto max-sm:w-auto min-w-[320px] max-w-[420px] pointer-events-auto"
      :class="toastStore.type"
      @click="toastStore.hide"
    >
      <div 
        class="flex items-start gap-4 px-4 py-4 rounded-2xl bg-[var(--bg-card)] backdrop-blur-2xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[var(--border-color)] cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
        :class="{
          'border-red-500/40 shadow-[0_20px_50px_rgba(239,68,68,0.15)]': toastStore.type === 'wishlist-add',
          'border-red-400/30': toastStore.type === 'wishlist-remove',
          'border-emerald-500/40 shadow-[0_20px_50px_rgba(16,185,129,0.15)]': toastStore.type === 'success',
          'border-indigo-500/40 shadow-[0_20px_50px_rgba(99,102,241,0.15)]': !['wishlist-add', 'wishlist-remove', 'success'].includes(toastStore.type)
        }"
      >
        <!-- Icon Container -->
        <div 
          class="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center shrink-0 shadow-sm relative mt-0.5"
          :class="{
            'bg-red-500/15 border border-red-500/30 text-red-500': toastStore.type === 'wishlist-add',
            'bg-red-400/15 border border-red-400/30 text-red-400': toastStore.type === 'wishlist-remove',
            'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500': toastStore.type === 'success',
            'bg-indigo-500/15 border border-indigo-500/30 text-indigo-500': !['wishlist-add', 'wishlist-remove', 'success'].includes(toastStore.type)
          }"
        >
          <!-- Glowing effect behind icon -->
          <div class="absolute inset-0 blur-md opacity-40 rounded-[14px]" :class="{
            'bg-red-500': toastStore.type === 'wishlist-add',
            'bg-red-400': toastStore.type === 'wishlist-remove',
            'bg-emerald-500': toastStore.type === 'success',
            'bg-indigo-500': !['wishlist-add', 'wishlist-remove', 'success'].includes(toastStore.type)
          }"></div>

          <Heart v-if="toastStore.type === 'wishlist-add'" :size="20" class="relative z-10 fill-current" />
          <HeartOff v-else-if="toastStore.type === 'wishlist-remove'" :size="20" class="relative z-10" />
          <CheckCircle2 v-else-if="toastStore.type === 'success'" :size="22" class="relative z-10" stroke-width="2.5" />
          <Info v-else :size="22" class="relative z-10" stroke-width="2.5" />
        </div>

        <!-- Text Content -->
        <div class="flex-1 min-w-0 flex flex-col justify-center mt-0.5">
          <h4 class="text-[0.95rem] font-extrabold text-[var(--text-primary)] m-0 mb-1.5 leading-tight tracking-tight">{{ toastStore.title }}</h4>
          <p class="text-[0.82rem] text-[var(--text-secondary)] m-0 leading-snug line-clamp-2 font-medium">{{ toastStore.message }}</p>
        </div>

        <!-- Close Button -->
        <button @click.stop="toastStore.hide" class="bg-transparent border-none text-[var(--text-muted)] p-1.5 -mr-1.5 -mt-1 rounded-full cursor-pointer transition-colors hover:text-[var(--text-primary)] hover:bg-gray-500/10">
          <X :size="16" stroke-width="2.5" />
        </button>

        <!-- Animated Progress Bar -->
        <div class="absolute bottom-0 left-0 h-[4px] bg-gradient-to-r w-full"
             :class="{
               'from-red-600 to-red-400': toastStore.type === 'wishlist-add',
               'from-red-500 to-red-300': toastStore.type === 'wishlist-remove',
               'from-emerald-600 to-emerald-400': toastStore.type === 'success',
               'from-indigo-600 via-purple-500 to-indigo-400': !['wishlist-add', 'wishlist-remove', 'success'].includes(toastStore.type)
             }"
             style="animation: toastProgress 3s linear forwards;"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useToastStore } from '../stores/toast';
import { Heart, HeartOff, CheckCircle2, Info, X } from 'lucide-vue-next';

const toastStore = useToastStore();
</script>

<style scoped>
@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Spring entrance slide animation for Top Right */
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
