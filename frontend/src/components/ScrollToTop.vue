<template>
  <Transition name="fab-bounce">
    <button 
      v-if="isVisible" 
      @click="scrollToTop" 
      class="fixed bottom-6 right-6 max-md:bottom-[108px] max-md:right-[14px] w-[44px] h-[44px] max-md:w-[40px] max-md:h-[40px] rounded-full bg-[var(--bg-card,rgba(30,41,59,0.85))] backdrop-blur-[16px] border border-[var(--border-highlight,rgba(99,102,241,0.4))] text-[var(--text-primary,#ffffff)] flex items-center justify-center cursor-pointer z-[999] shadow-[0_10px_25px_rgba(0,0,0,0.25),0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none hover:-translate-y-1 hover:scale-110 hover:bg-[var(--accent-gradient,linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%))] hover:text-white hover:border-transparent hover:shadow-[0_14px_30px_rgba(99,102,241,0.5)] active:scale-95 glass-panel"
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
