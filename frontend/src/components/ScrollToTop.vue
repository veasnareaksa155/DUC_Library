<template>
  <Transition name="fab-bounce">
    <button 
      v-if="isVisible" 
      @click="scrollToTop" 
      :class="[
        'fixed w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer z-[999] shadow-md transition-all duration-300 hover:-translate-y-1 hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] hover:shadow-lg active:scale-95 print:hidden',
        hasCheckinBtn 
          ? 'bottom-[108px] right-8 max-md:bottom-[150px] max-md:right-4' 
          : 'bottom-8 right-8 max-md:bottom-[85px] max-md:right-4'
      ]"
      title="Back to Top"
      aria-label="Back to Top"
    >
      <ChevronUp class="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" />
    </button>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronUp } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

const hasCheckinBtn = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role !== 'admin' && !route.path.startsWith('/read');
});

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
