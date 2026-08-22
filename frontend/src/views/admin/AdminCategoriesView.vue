<template>
  <div class="flex items-start min-h-screen w-full">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 py-6 px-8 pb-16 w-[calc(100%-280px)] max-w-none">
      <header class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-[2.2rem] font-extrabold">{{ localeStore.t('categories', 'Categories') }} <span class="text-gradient">Management</span></h1>
          <p class="text-[var(--text-secondary)]">Organize your library catalog by managing categories.</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="openAddModal" class="btn btn-primary shadow-md shadow-indigo-500/20">
            <Plus :size="18" /> Add Category
          </button>
        </div>
      </header>

      <!-- Categories Table -->
      <div class="p-6 glass-panel">
        <div class="overflow-x-auto min-h-[400px]">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[var(--border-color)]">
                <th class="py-4 px-4 font-bold text-[0.8rem] uppercase tracking-wider text-[var(--text-muted)] w-[60px]">Icon</th>
                <th class="py-4 px-4 font-bold text-[0.8rem] uppercase tracking-wider text-[var(--text-muted)]">Category Name</th>
                <th class="py-4 px-4 font-bold text-[0.8rem] uppercase tracking-wider text-[var(--text-muted)]">Description</th>
                <th class="py-4 px-4 font-bold text-[0.8rem] uppercase tracking-wider text-[var(--text-muted)] text-center w-[120px]">Books</th>
                <th class="py-4 px-4 font-bold text-[0.8rem] uppercase tracking-wider text-[var(--text-muted)] text-right w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="booksStore.loading" class="border-b border-[var(--border-color)]">
                <td colspan="5" class="py-12 text-center text-[var(--text-muted)]">
                  <div class="flex flex-col items-center gap-3">
                    <Loader2 class="animate-spin text-indigo-500" :size="32" />
                    <span>Loading categories...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="booksStore.categories.length === 0" class="border-b border-[var(--border-color)]">
                <td colspan="5" class="py-12 text-center text-[var(--text-muted)]">
                  No categories found. Click "Add Category" to create one.
                </td>
              </tr>
              <tr v-for="category in booksStore.categories" :key="category.id" class="border-b border-[var(--border-color)] hover:bg-gray-500/5 transition-colors group">
                <td class="py-4 px-4">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                    <component :is="getIconComponent(category.icon)" :size="18" stroke-width="2.5" />
                  </div>
                </td>
                <td class="py-4 px-4">
                  <span class="font-bold text-[1rem] text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{{ category.name }}</span>
                </td>
                <td class="py-4 px-4">
                  <span class="text-[0.9rem] text-[var(--text-secondary)] line-clamp-1">{{ category.description || 'No description' }}</span>
                </td>
                <td class="py-4 px-4 text-center">
                  <span class="inline-flex items-center justify-center px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[0.85rem] font-bold">
                    {{ category.book_count || 0 }}
                  </span>
                </td>
                <td class="py-4 px-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal(category)" class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all shadow-sm" title="Edit Category">
                      <Pencil :size="14" />
                    </button>
                    <button @click="confirmDelete(category)" class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all shadow-sm" title="Delete Category">
                      <Trash2 :size="14" />
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
        <div class="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-md transition-all duration-300"></div>
        
        <div class="relative w-full max-w-[600px] bg-[var(--bg-card)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[var(--border-color)] flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
          
          <header class="flex justify-between items-center px-8 py-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Tags :size="20" stroke-width="2.5" />
              </div>
              <h2 class="text-[1.3rem] font-bold text-[var(--text-primary)] tracking-tight">{{ isEditing ? 'Edit Category' : 'Add New Category' }}</h2>
            </div>
            <button @click="isModalOpen = false" class="w-10 h-10 rounded-full bg-gray-500/5 flex items-center justify-center text-[var(--text-muted)] border border-transparent hover:bg-gray-500/10 hover:text-[var(--text-primary)] transition-all duration-200"><X :size="20" stroke-width="2" /></button>
          </header>

          <form @submit.prevent="saveCategory" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              <div class="group">
                <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide group-focus-within:text-indigo-500 transition-colors">Category Name *</label>
                <input v-model="form.name" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium" required placeholder="e.g. Science Fiction" />
              </div>

              <div class="group">
                <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide group-focus-within:text-indigo-500 transition-colors">Description</label>
                <textarea v-model="form.description" rows="3" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium resize-none" placeholder="Brief description of this category..."></textarea>
              </div>

              <div class="group">
                <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide group-focus-within:text-indigo-500 transition-colors">Icon Name (Lucide)</label>
                <input v-model="form.icon" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-mono text-[0.9rem]" placeholder="e.g. BookOpen, Globe, CPU" />
                <p class="text-[0.75rem] text-[var(--text-muted)] mt-2">Enter any valid icon name from the Lucide icon set.</p>
              </div>
              
              <div v-if="formError" class="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl text-[0.9rem] flex items-center gap-3">
                <AlertCircle :size="18" stroke-width="2.5" class="shrink-0 text-red-500" /> {{ formError }}
              </div>
            </div>

            <footer class="flex justify-end gap-3 px-8 py-5 border-t border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
              <button type="button" @click="isModalOpen = false" class="px-6 py-2.5 rounded-xl font-bold text-[var(--text-secondary)] bg-transparent border border-transparent hover:bg-gray-500/5 transition-all duration-300">Cancel</button>
              <button type="submit" class="px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-md shadow-indigo-500/20 flex items-center gap-2" :disabled="saving">
                <Save :size="18" :class="{ 'animate-pulse': saving }" />
                {{ saving ? 'Saving...' : 'Save Category' }}
              </button>
            </footer>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="isDeleteModalOpen" class="modal-backdrop" @click.self="isDeleteModalOpen = false">
        <div class="modal-content glass-panel max-w-[440px] px-6 py-8 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-red-500/12 border border-red-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.2)]">
              <AlertTriangle :size="32" class="text-red-500" />
            </div>
          </div>

          <h2 class="text-[1.35rem] font-extrabold mb-2">Delete Category</h2>
          
          <div v-if="categoryToDelete?.book_count > 0" class="mb-5">
            <p class="text-[0.95rem] text-[var(--text-primary)] mb-3 leading-relaxed">
              Cannot delete <strong class="text-[var(--accent-primary)]">"{{ categoryToDelete.name }}"</strong> because it currently contains <strong>{{ categoryToDelete.book_count }} book(s)</strong>.
            </p>
            <p class="text-[0.85rem] text-[var(--text-secondary)] bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              Please reassign or delete these books before removing the category.
            </p>
          </div>
          <div v-else>
            <p class="text-[0.95rem] text-[var(--text-primary)] mb-1.5 leading-relaxed">
              Are you sure you want to delete <strong class="text-[var(--accent-primary)]">"{{ categoryToDelete?.name }}"</strong>?
            </p>
            <small class="text-[0.78rem] text-[var(--text-muted)] block mb-5">This action cannot be undone.</small>
          </div>

          <footer class="flex justify-center gap-3 mt-4">
            <button @click="isDeleteModalOpen = false" class="btn btn-secondary">{{ categoryToDelete?.book_count > 0 ? 'Close' : 'Cancel' }}</button>
            <button v-if="categoryToDelete?.book_count === 0" @click="executeDelete" class="bg-gradient-to-br from-red-500 to-red-600 text-white border-none font-bold shadow-[0_4px_15px_rgba(239,68,68,0.35)] transition-all duration-250 ease-[var(--spring-ease)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)] px-4 py-2 rounded-md flex items-center gap-2" :disabled="deleting">
              <Trash2 :size="16" />
              {{ deleting ? 'Deleting...' : 'Yes, Delete Category' }}
            </button>
          </footer>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useBooksStore } from '../../stores/books';
import { useLocaleStore } from '../../stores/locale';
import { useToastStore } from '../../stores/toast';
import AdminSidebar from '../../components/AdminSidebar.vue';
import * as LucideIcons from 'lucide-vue-next';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, AlertTriangle, Loader2, Tags, BookOpen } from 'lucide-vue-next';

const booksStore = useBooksStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const formError = ref('');
const form = reactive({
  id: '',
  name: '',
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
  form.description = '';
  form.icon = 'BookOpen';
  formError.value = '';
  isModalOpen.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  form.id = category.id;
  form.name = category.name;
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
        description: form.description,
        icon: form.icon
      });
      toastStore.showSuccess('Category updated successfully');
    } else {
      await booksStore.addCategory({
        name: form.name,
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
