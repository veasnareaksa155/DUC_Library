<template>
  <Transition name="fab-bounce">
    <button 
      v-if="isVisible" 
      @click="scrollToTop" 
      class="scroll-to-top-btn glass-panel"
      title="Back to Top"
      aria-label="Back to Top"
    >
      <ChevronUp :size="20" />
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronUp } from 'lucide-vue-next';

const isVisible = ref(false);

function handleScroll() {
  isVisible.value = window.scrollY > 280;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.scroll-to-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-card, rgba(30, 41, 59, 0.85));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-highlight, rgba(99, 102, 241, 0.4));
  color: var(--text-primary, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25), 0 0 15px rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

.scroll-to-top-btn:hover {
  transform: translateY(-4px) scale(1.1);
  background: var(--accent-gradient, linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%));
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 14px 30px rgba(99, 102, 241, 0.5);
}

.scroll-to-top-btn:active {
  transform: scale(0.92);
}

/* Mobile positioning - sit neatly right above bottom tab bar */
@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 74px;
    right: 14px;
    width: 40px;
    height: 40px;
  }
}

.fab-bounce-enter-active,
.fab-bounce-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-bounce-enter-from,
.fab-bounce-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.6);
}
</style>
