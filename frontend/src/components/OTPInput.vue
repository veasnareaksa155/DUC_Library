<template>
  <div class="flex gap-2 sm:gap-3 justify-center w-full">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      :ref="el => inputs[index] = el"
      v-model="digits[index]"
      type="text"
      inputmode="numeric"
      maxlength="1"
      @input="onInput(index, $event)"
      @keydown.delete="onDelete(index, $event)"
      @paste.prevent="onPaste"
      class="w-10 h-14 sm:w-12 sm:h-16 p-0 bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-[var(--text-primary)] text-2xl font-black text-center rounded-[14px] focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const digits = ref(Array(6).fill(''));
const inputs = ref([]);

watch(() => props.modelValue, (newVal) => {
  if (newVal === '') {
    digits.value = Array(6).fill('');
  } else if (newVal.length === 6) {
    digits.value = newVal.split('');
  }
}, { immediate: true });

function updateValue() {
  const val = digits.value.join('');
  emit('update:modelValue', val);
}

function onInput(index, event) {
  const value = event.target.value;
  if (!/^\d*$/.test(value)) {
    digits.value[index] = '';
    return;
  }
  
  updateValue();
  
  if (value && index < 5) {
    nextTick(() => {
      inputs.value[index + 1]?.focus();
    });
  }
}

function onDelete(index, event) {
  if (!digits.value[index] && index > 0) {
    inputs.value[index - 1]?.focus();
  }
  updateValue();
}

function onPaste(event) {
  const pastedData = event.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
  if (pastedData) {
    pastedData.split('').forEach((char, i) => {
      if (i < 6) digits.value[i] = char;
    });
    updateValue();
    nextTick(() => {
      const focusIndex = Math.min(pastedData.length, 5);
      inputs.value[focusIndex]?.focus();
    });
  }
}
</script>
