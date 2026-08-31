<template>
  <Transition name="confirm-fade">
    <div v-if="notificationsStore.showPrompt" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"></div>

      <!-- Modal Content -->
      <Transition name="confirm-scale" appear>
        <div class="relative w-full max-w-sm bg-[var(--bg-secondary)] rounded-xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-[var(--border-color)] overflow-hidden text-left z-10">
          
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div class="shrink-0 flex items-center justify-center w-12 h-12 rounded-full mt-0.5 bg-indigo-500/10 text-indigo-500">
              <BellRing :size="24" stroke-width="2.5" />
            </div>

            <!-- Text content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-[1.1rem] font-semibold text-[var(--text-primary)] mb-1 tracking-tight">Stay Updated</h3>
              <p class="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed m-0">Enable push notifications to know instantly when your book requests are approved.</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex items-center justify-end gap-3">
            <button @click="dismissPrompt" class="px-4 py-2 rounded-lg font-semibold text-[0.9rem] bg-transparent text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
              Not Now
            </button>
            <button @click="enablePush" class="px-4 py-2 rounded-lg font-semibold text-[0.9rem] text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer border-none flex items-center gap-2">
              <Bell :size="16" /> Enable
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { useNotificationsStore } from '../stores/notifications';
import { Bell, BellRing } from 'lucide-vue-next';

const notificationsStore = useNotificationsStore();

function dismissPrompt() {
  notificationsStore.showPrompt = false;
  // Remember not to ask again on this device
  localStorage.setItem('duc_push_prompt_dismissed', 'true');
}

function enablePush() {
  notificationsStore.showPrompt = false;
  notificationsStore.subscribeToPushNotifications();
}
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
