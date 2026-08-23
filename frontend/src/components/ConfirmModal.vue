<template>
  <Transition name="confirm-fade">
    <div v-if="confirmStore.isOpen" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" @click="confirmStore.cancel"></div>

      <!-- Modal Content -->
      <Transition name="confirm-scale" appear>
        <div class="relative w-full max-w-sm bg-[var(--bg-secondary)] rounded-xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-[var(--border-color)] overflow-hidden text-left">
          
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full mt-0.5"
                 :class="{
                   'bg-red-500/10 text-red-500': confirmStore.type === 'danger',
                   'bg-amber-500/10 text-amber-500': confirmStore.type === 'warning',
                   'bg-indigo-500/10 text-indigo-500': confirmStore.type === 'info'
                 }">
              <LogOut v-if="confirmStore.title.toLowerCase().includes('log out')" :size="20" stroke-width="2.5" />
              <AlertTriangle v-else-if="confirmStore.type === 'danger' || confirmStore.type === 'warning'" :size="20" stroke-width="2.5" />
              <Info v-else :size="20" stroke-width="2.5" />
            </div>

            <!-- Text content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-[1.1rem] font-semibold text-[var(--text-primary)] mb-1 tracking-tight">{{ confirmStore.title }}</h3>
              <p class="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed m-0">{{ confirmStore.message }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex items-center justify-end gap-3">
            <button @click="confirmStore.cancel" class="px-4 py-2 rounded-lg font-semibold text-[0.9rem] bg-transparent text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
              {{ confirmStore.cancelText }}
            </button>
            <button @click="confirmStore.confirm" class="px-4 py-2 rounded-lg font-semibold text-[0.9rem] text-white transition-colors cursor-pointer border-none"
                    :class="{
                      'bg-red-600 hover:bg-red-700': confirmStore.type === 'danger',
                      'bg-amber-500 hover:bg-amber-600': confirmStore.type === 'warning',
                      'bg-[var(--text-primary)] !text-[var(--bg-primary)] hover:opacity-80': confirmStore.type === 'info'
                    }">
              {{ confirmStore.confirmText }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { useConfirmStore } from '../stores/confirm';
import { LogOut, AlertTriangle, Info } from 'lucide-vue-next';

const confirmStore = useConfirmStore();
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.3s ease;
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-scale-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.confirm-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
}
.confirm-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.confirm-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
