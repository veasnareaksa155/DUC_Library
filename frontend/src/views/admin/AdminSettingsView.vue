<template>
  <main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none relative print:w-full print:px-0 print:py-0 print:pb-0">
    <!-- Decorative Background Glow -->
    <div class="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>
    
    <header class="mb-10 flex flex-col gap-3 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Settings :size="20" />
        </div>
        <h1 class="text-[2.2rem] font-extrabold tracking-tight text-[var(--text-primary)]">System Settings</h1>
      </div>
      <p class="text-[1rem] text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">Configure global variables, application limits, and system-wide behaviors.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Borrowing Duration Setting -->
      <div class="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
        <div class="flex items-start justify-between mb-4">
          <div class="flex flex-col">
            <h3 class="text-[1.1rem] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar :size="18" class="text-indigo-500" />
              Borrowing Durations
            </h3>
            <p class="text-[0.85rem] text-[var(--text-secondary)] mt-1">Select the allowed number of days students can borrow physical books.</p>
          </div>
        </div>

        <div class="mt-4 flex-1">
          <label class="block text-[0.8rem] font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wider">Configured Options (Days)</label>
          <div class="flex flex-wrap gap-2 mb-4 min-h-[40px]">
            <div v-for="(day, index) in localDurations" :key="index" class="relative group">
              <span class="flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 text-[0.9rem] min-w-[3rem]">
                {{ day }}
              </span>
              <button @click="removeDuration(index)" class="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110 active:scale-95 cursor-pointer">
                <X :size="12" stroke-width="3" />
              </button>
            </div>
          </div>
          
          <div class="flex gap-2">
            <input 
              v-model.number="newDuration" 
              type="number" 
              placeholder="e.g. 7" 
              class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[0.9rem] font-medium text-[var(--text-primary)] outline-none focus:border-indigo-500 transition-colors"
              @keyup.enter="addDuration"
            />
            <button @click="addDuration" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl text-[0.9rem] font-bold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer">Add</button>
          </div>
        </div>

      </div>
      
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '../../stores/settings';
import { useToastStore } from '../../stores/toast';
import { Settings, Calendar, Save, Loader2, X } from 'lucide-vue-next';

const settingsStore = useSettingsStore();
const toastStore = useToastStore();

const localDurations = ref([]);
const newDuration = ref('');
const loading = ref(false);

onMounted(async () => {
  await settingsStore.fetchSettings();
  // Clone to local state for editing
  localDurations.value = [...settingsStore.borrowingDurations];
});

function addDuration() {
  if (newDuration.value && newDuration.value > 0) {
    if (!localDurations.value.includes(newDuration.value)) {
      localDurations.value.push(newDuration.value);
      localDurations.value.sort((a, b) => a - b);
      saveDurations();
    }
    newDuration.value = '';
  }
}

function removeDuration(index) {
  localDurations.value.splice(index, 1);
  saveDurations();
}

async function saveDurations() {
  if (localDurations.value.length === 0) {
    toastStore.showError('You must have at least one duration option!', 'Invalid');
    return;
  }
  loading.value = true;
  try {
    await settingsStore.updateSetting('borrowing_durations', localDurations.value);
    toastStore.showSuccess('Borrowing durations updated successfully!', 'Saved');
  } catch (err) {
    toastStore.showError('Failed to save settings: ' + err.message);
  } finally {
    loading.value = false;
  }
}
</script>
