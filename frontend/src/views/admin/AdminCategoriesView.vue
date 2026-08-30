<template>
  <main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none">
    <header class="flex justify-between items-end mb-10">
      <div>
        <h1 class="text-[2.5rem] font-extrabold tracking-tight mb-2 text-[var(--text-primary)]">
          {{ localeStore.t('categories') || 'Categories' }} 
          <span class="bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">{{ localeStore.t('categoriesManagement') }}</span>
        </h1>
        <div class="flex items-center gap-3">
          <p class="text-[1.05rem] text-[var(--text-secondary)] m-0">{{ localeStore.t('categoriesManagementDesc') }}</p>
          <span class="inline-flex items-center justify-center px-3 py-1 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-[0.85rem] font-bold shadow-sm whitespace-nowrap">
            <Tags :size="14" class="mr-1.5" />
            {{ booksStore.categories.length }} {{ localeStore.t('categories') }}
          </span>
          <span class="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[0.85rem] font-bold shadow-sm whitespace-nowrap">
            <BookOpen :size="14" class="mr-1.5" />
            {{ totalCatalogBooks }} {{ localeStore.t('books') }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openAddModal" class="inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_25px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 px-6 py-3.5 text-[0.95rem]">
          <Plus :size="20" stroke-width="2.5" /> {{ localeStore.t('addCategory') }}
        </button>
      </div>
    </header>

    <!-- Categories Table -->
    <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-[var(--border-color)]">
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] w-[80px]">{{ localeStore.t('icon') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)]">{{ localeStore.t('categoryName') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] w-[35%]">{{ localeStore.t('description') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] text-center w-[120px]">{{ localeStore.t('books') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] text-right w-[160px]">{{ localeStore.t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="booksStore.loading" class="border-b border-[var(--border-color)]">
              <td colspan="5" class="py-20 text-center text-[var(--text-muted)]">
                <div class="flex flex-col items-center gap-4">
                  <Loader2 class="animate-spin text-indigo-500" :size="40" />
                  <span class="font-medium text-[1.1rem]">{{ localeStore.t('loadingCategories') }}</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="booksStore.categories.length === 0" class="border-b border-[var(--border-color)]">
              <td colspan="5" class="py-20 text-center text-[var(--text-muted)]">
                <div class="flex flex-col items-center gap-4">
                  <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Tags :size="32" />
                  </div>
                  <span class="font-medium text-[1.1rem]">{{ localeStore.t('noCategoriesFound') }}</span>
                </div>
              </td>
            </tr>
            <tr v-for="(category, index) in booksStore.categories" :key="category.id" class="border-b border-[var(--border-color)] hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition-all duration-300 group">
              <td class="py-5 px-6">
                <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-[var(--border-color)] shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <component :is="getIconComponent(category.icon)" :size="22" stroke-width="2.5" />
                </div>
              </td>
              <td class="py-5 px-6">
                <span class="font-extrabold text-[1.1rem] text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" :style="(localeStore.currentLang === 'km' && category.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">{{ (localeStore.currentLang === 'km' && category.name_km) ? category.name_km : category.name }}</span>
              </td>
              <td class="py-5 px-6">
                <span class="text-[0.95rem] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{{ category.description || localeStore.t('noDescriptionProvided') }}</span>
              </td>
              <td class="py-5 px-6 text-center">
                <span class="inline-flex items-center justify-center px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[0.85rem] font-bold shadow-sm whitespace-nowrap">
                  {{ category.book_count || 0 }} {{ localeStore.t('books') }}
                </span>
              </td>
              <td class="py-5 px-6">
                <div class="flex items-center justify-end gap-3 opacity-100 transition-opacity">
                  <button @click="openEditModal(category)" class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" :title="localeStore.t('editCategoryTitle')">
                    <Pencil :size="18" stroke-width="2.5" />
                  </button>
                  <button @click="confirmDelete(category)" class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" :title="localeStore.t('deleteCategoryTitle')">
                    <Trash2 :size="18" stroke-width="2.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Category Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" @click.self="isModalOpen = false">
      <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm transition-all duration-300"></div>
      
      <div class="relative w-full max-w-[600px] bg-[var(--bg-card)] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[var(--border-color)] flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300">
        
        <header class="flex justify-between items-center px-8 py-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Tags :size="24" stroke-width="2.5" />
            </div>
            <div>
              <h2 class="text-[1.4rem] font-extrabold text-[var(--text-primary)] tracking-tight">{{ isEditing ? localeStore.t('editCategoryTitle') : localeStore.t('addNewCategoryTitle') }}</h2>
              <p class="text-[0.85rem] text-[var(--text-secondary)] mt-0.5">{{ isEditing ? localeStore.t('updateDetailsBelow') : localeStore.t('createCategoryDesc') }}</p>
            </div>
          </div>
          <button @click="isModalOpen = false" class="w-10 h-10 rounded-full bg-gray-500/5 flex items-center justify-center text-[var(--text-muted)] border border-transparent hover:bg-gray-500/10 hover:text-[var(--text-primary)] transition-all duration-200 hover:rotate-90"><X :size="20" stroke-width="2" /></button>
        </header>

        <form @submit.prevent="saveCategory" class="flex flex-col flex-1 overflow-hidden">
          <div class="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            
            <div class="group">
              <label class="block text-[0.85rem] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider group-focus-within:text-indigo-500 transition-colors">{{ localeStore.t('categoryNameReq') }}</label>
              <input v-model="form.name" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium text-[1.05rem]" required placeholder="e.g. Science Fiction" />
            </div>

            <div class="group">
              <label class="block text-[0.85rem] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider group-focus-within:text-indigo-500 transition-colors">{{ localeStore.t('categoryNameKmReq') }}</label>
              <input v-model="form.name_km" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium text-[1.05rem] font-khmer" placeholder="ឧ. ប្រលោមលោក" />
            </div>

            <div class="group">
              <label class="block text-[0.85rem] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider group-focus-within:text-indigo-500 transition-colors">{{ localeStore.t('description') }}</label>
              <textarea v-model="form.description" rows="3" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium text-[1.05rem] resize-none" placeholder="..."></textarea>
            </div>

            <div class="group">
              <label class="block text-[0.85rem] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider group-focus-within:text-indigo-500 transition-colors">{{ localeStore.t('iconNameLucide') }}</label>
              <div class="relative">
                <div class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <component :is="getIconComponent(form.icon)" :size="20" />
                </div>
                <input v-model="form.icon" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-mono text-[1rem]" placeholder="e.g. BookOpen, Globe, CPU" />
              </div>
              <p class="text-[0.8rem] text-[var(--text-muted)] mt-2">{{ localeStore.t('enterValidIcon') }} <a href="https://lucide.dev/icons" target="_blank" class="text-indigo-500 hover:underline">{{ localeStore.t('lucideIconSet') }}</a>.</p>
            </div>
            
            <div v-if="formError" class="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl text-[0.95rem] flex items-center gap-3 shadow-sm">
              <AlertCircle :size="20" stroke-width="2.5" class="shrink-0 text-red-500" /> {{ formError }}
            </div>
          </div>

          <footer class="flex justify-end gap-3 px-8 py-6 border-t border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
            <button type="button" @click="isModalOpen = false" class="px-6 py-3 rounded-xl font-bold text-[var(--text-secondary)] bg-transparent border border-transparent hover:bg-gray-500/10 transition-all duration-300">{{ localeStore.t('cancel') }}</button>
            <button type="submit" class="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] flex items-center gap-2 hover:-translate-y-0.5" :disabled="saving">
              <Save :size="20" stroke-width="2.5" :class="{ 'animate-pulse': saving }" />
              {{ saving ? localeStore.t('savingLabel') : localeStore.t('saveCategory') }}
            </button>
          </footer>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200" @click.self="isDeleteModalOpen = false">
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] border-[var(--border-color)] border rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-w-[460px] px-8 py-10 text-center animate-in zoom-in-95 duration-200">
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 border-4 border-red-100 dark:border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
            <div class="absolute inset-0 bg-red-500/20 animate-ping rounded-full"></div>
            <AlertTriangle :size="36" stroke-width="2.5" class="text-red-500 relative z-10" />
          </div>
        </div>

        <h2 class="text-[1.6rem] font-extrabold mb-3 text-[var(--text-primary)]">{{ localeStore.t('deleteCategoryTitle') }}</h2>
        
        <div v-if="categoryToDelete?.book_count > 0" class="mb-8">
          <p class="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed mb-8">
            {{ localeStore.t('cannotDeleteCategory1') }}<strong class="text-indigo-500" :style="(localeStore.currentLang === 'km' && categoryToDelete.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">{{ (localeStore.currentLang === 'km' && categoryToDelete.name_km) ? categoryToDelete.name_km : categoryToDelete.name }}</strong>{{ localeStore.t('cannotDeleteCategory2') }}<strong>{{ categoryToDelete.book_count }}</strong>{{ localeStore.t('cannotDeleteCategory3') }}
          </p>
          <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle class="text-amber-500 shrink-0 mt-0.5" :size="20" />
            <p class="text-[0.9rem] text-amber-800 dark:text-amber-200 m-0 font-medium leading-relaxed">
              {{ localeStore.t('reassignBeforeDelete') }}
            </p>
          </div>
        </div>
        <div v-else class="mb-8">
          <p class="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed mb-8">
            {{ localeStore.t('sureDeleteCategory1') }}<strong class="text-[var(--text-primary)]" :style="(localeStore.currentLang === 'km' && categoryToDelete?.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">{{ (localeStore.currentLang === 'km' && categoryToDelete?.name_km) ? categoryToDelete.name_km : categoryToDelete?.name }}</strong>{{ localeStore.t('sureDeleteCategory2') }}
          </p>
          <p class="text-[0.9rem] font-bold text-red-500 uppercase tracking-wider">{{ localeStore.t('actionCannotUndo') }}</p>
        </div>

        <footer class="flex justify-center gap-4">
          <button @click="isDeleteModalOpen = false" class="px-6 py-3 rounded-xl font-bold text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-gray-500/5 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95">
            {{ categoryToDelete?.book_count > 0 ? localeStore.t('goBack') : localeStore.t('cancel') }}
          </button>
          <button v-if="categoryToDelete?.book_count === 0" @click="executeDelete" class="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] flex items-center gap-2 hover:-translate-y-0.5 active:scale-95" :disabled="deleting">
            <Trash2 :size="20" stroke-width="2.5" />
            {{ deleting ? localeStore.t('deleting') : localeStore.t('yesDeleteBtn') }}
          </button>
        </footer>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useBooksStore } from '../../stores/books';
import { useLocaleStore } from '../../stores/locale';
import { useToastStore } from '../../stores/toast';
import * as LucideIcons from 'lucide-vue-next';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, AlertTriangle, Loader2, Tags, BookOpen } from 'lucide-vue-next';

const booksStore = useBooksStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const saving = ref(false);

const totalCatalogBooks = computed(() => {
  return booksStore.categories.reduce((sum, cat) => sum + (cat.book_count || 0), 0);
});
const formError = ref('');
const form = reactive({
  id: '',
  name: '',
  name_km: '',
  description: '',
  icon: 'BookOpen'
});

const isDeleteModalOpen = ref(false);
const deleting = ref(false);
const categoryToDelete = ref(null);

onMounted(async () => {
  if (booksStore.categories.length === 0) {
    await booksStore.fetchCategories();
  }
});

// Dynamic Icon Resolution
const getIconComponent = (iconName) => {
  if (iconName && LucideIcons[iconName]) {
    return LucideIcons[iconName];
  }
  return BookOpen; // Fallback
};

const openAddModal = () => {
  isEditing.value = false;
  form.id = '';
  form.name = '';
  form.name_km = '';
  form.description = '';
  form.icon = 'BookOpen';
  formError.value = '';
  isModalOpen.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  form.id = category.id;
  form.name = category.name;
  form.name_km = category.name_km || '';
  form.description = category.description || '';
  form.icon = category.icon || 'BookOpen';
  formError.value = '';
  isModalOpen.value = true;
};

const saveCategory = async () => {
  if (!form.name.trim()) {
    formError.value = "Category name is required";
    return;
  }

  saving.value = true;
  formError.value = '';

  try {
    if (isEditing.value) {
      await booksStore.updateCategory(form.id, {
        name: form.name,
        name_km: form.name_km,
        description: form.description,
        icon: form.icon
      });
      toastStore.showSuccess('Category updated successfully');
    } else {
      await booksStore.addCategory({
        name: form.name,
        name_km: form.name_km,
        description: form.description,
        icon: form.icon
      });
      toastStore.showSuccess('Category created successfully');
    }
    isModalOpen.value = false;
  } catch (err) {
    formError.value = err.message || 'Failed to save category';
    toastStore.show(formError.value, { type: 'error', title: 'Error' });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (category) => {
  categoryToDelete.value = category;
  isDeleteModalOpen.value = true;
};

const executeDelete = async () => {
  if (!categoryToDelete.value) return;
  
  deleting.value = true;
  try {
    await booksStore.deleteCategory(categoryToDelete.value.id);
    toastStore.showSuccess('Category deleted successfully');
    isDeleteModalOpen.value = false;
  } catch (err) {
    toastStore.show(err.message || 'Failed to delete category', { type: 'error', title: 'Error' });
  } finally {
    deleting.value = false;
  }
};
</script>
