<template>
  <Transition name="confirm-fade">
    <div v-if="confirmStore.isOpen" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" @click="confirmStore.cancel"></div>

      <!-- Modal Content -->
      <Transition name="confirm-scale" appear>
        <div class="relative w-full max-w-[420px] bg-[var(--bg-card)] rounded-[1.5rem] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-[var(--border-color)] overflow-hidden">
          
          <!-- Background Glow -->
          <div class="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] rounded-full blur-[80px] opacity-20 pointer-events-none"
               :class="{
                 'bg-red-500': confirmStore.type === 'danger',
                 'bg-amber-500': confirmStore.type === 'warning',
                 'bg-indigo-500': confirmStore.type === 'info'
               }"></div>

          <!-- Icon Header -->
          <div class="mb-5 relative z-10 flex items-center justify-center w-16 h-16 rounded-[1.2rem] shadow-sm border mx-auto"
               :class="{
                 'bg-red-500/15 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]': confirmStore.type === 'danger',
                 'bg-amber-500/15 border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]': confirmStore.type === 'warning',
                 'bg-indigo-500/15 border-indigo-500/30 text-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]': confirmStore.type === 'info'
               }">
            <LogOut v-if="confirmStore.title.toLowerCase().includes('log out')" :size="32" stroke-width="2.5" />
            <AlertTriangle v-else-if="confirmStore.type === 'danger' || confirmStore.type === 'warning'" :size="32" stroke-width="2.5" />
            <Info v-else :size="32" stroke-width="2.5" />
          </div>

          <!-- Text content -->
          <div class="text-center relative z-10 mb-8">
            <h3 class="text-[1.3rem] font-extrabold text-[var(--text-primary)] mb-2.5 tracking-tight">{{ confirmStore.title }}</h3>
            <p class="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed m-0">{{ confirmStore.message }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 relative z-10">
            <button @click="confirmStore.cancel" class="flex-1 py-3 px-4 rounded-xl font-bold text-[0.95rem] bg-gray-500/5 hover:bg-gray-500/15 text-[var(--text-primary)] transition-colors duration-200 cursor-pointer border border-[var(--border-color)]">
              {{ confirmStore.cancelText }}
            </button>
            <button @click="confirmStore.confirm" class="flex-1 py-3 px-4 rounded-xl font-bold text-[0.95rem] text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:-translate-y-px active:scale-95 cursor-pointer border-none"
                    :class="{
                      'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.3)]': confirmStore.type === 'danger',
                      'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_4px_15px_rgba(245,158,11,0.3)]': confirmStore.type === 'warning',
                      'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_4px_15px_rgba(99,102,241,0.3)]': confirmStore.type === 'info'
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
