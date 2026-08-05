<template>
  <Transition name="toast-slide">
    <div 
      v-if="toastStore.isVisible" 
      class="toast-popup-container"
      :class="toastStore.type"
      @click="toastStore.hide"
    >
      <div class="toast-popup-card glass-panel">
        <div class="toast-icon-circle">
          <Heart v-if="toastStore.type === 'wishlist-add'" :size="20" fill="#ef4444" color="#ef4444" />
          <HeartOff v-else-if="toastStore.type === 'wishlist-remove'" :size="20" color="#f87171" />
          <CheckCircle2 v-else-if="toastStore.type === 'success'" :size="20" color="#10b981" />
          <Info v-else :size="20" color="#6366f1" />
        </div>

        <div class="toast-content-body">
          <h4 class="toast-title">{{ toastStore.title }}</h4>
          <p class="toast-message">{{ toastStore.message }}</p>
        </div>

        <button @click.stop="toastStore.hide" class="btn-toast-close" title="Close">
          <X :size="16" />
        </button>

        <!-- Animated Progress Bar -->
        <div class="toast-progress-bar"></div>
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
.toast-popup-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  width: 92%;
  max-width: 440px;
  pointer-events: auto;
}

.toast-popup-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.1rem;
  border-radius: var(--radius-xl, 18px);
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(99, 102, 241, 0.25);
  position: relative;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
}

/* Color theme variations */
.wishlist-add .toast-popup-card {
  border-color: rgba(239, 68, 68, 0.45);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(239, 68, 68, 0.3);
}

.wishlist-add .toast-icon-circle {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.4);
}

.wishlist-remove .toast-popup-card {
  border-color: rgba(248, 113, 113, 0.35);
}

.success .toast-popup-card {
  border-color: rgba(16, 185, 129, 0.45);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(16, 185, 129, 0.25);
}

.success .toast-icon-circle {
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(16, 185, 129, 0.4);
}

.toast-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-content-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.12rem 0;
  line-height: 1.3;
}

.toast-message {
  font-size: 0.8rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-toast-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.25rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-toast-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.toast-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ef4444);
  animation: toastProgress 3s linear forwards;
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Spring entrance slide animation */
.toast-slide-enter-active {
  transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -35px) scale(0.85);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}

@media (max-width: 640px) {
  .toast-popup-container {
    top: 14px;
    width: calc(100% - 24px);
  }
}
</style>
