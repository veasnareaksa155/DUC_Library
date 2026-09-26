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
            {{ rootCategories.length }} Root • {{ subCategoriesCount }} Sub
          </span>
          <span class="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[0.85rem] font-bold shadow-sm whitespace-nowrap">
            <BookOpen :size="14" class="mr-1.5" />
            {{ totalCatalogBooks }} {{ localeStore.t('books') }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openAddModal(null)" class="inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_25px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 px-6 py-3.5 text-[0.95rem] cursor-pointer">
          <Plus :size="20" stroke-width="2.5" /> {{ localeStore.t('addCategory') }}
        </button>
      </div>
    </header>

    <!-- Categories Multi-Level Tree Table -->
    <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-[var(--border-color)]">
              <th class="py-5 px-3 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] w-[50px] text-center" title="Drag to reorder">⠿</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] w-[80px]">{{ localeStore.t('icon') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)]">{{ localeStore.t('categoryName') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] w-[35%]">{{ localeStore.t('description') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] text-center w-[120px]">{{ localeStore.t('books') }}</th>
              <th class="py-5 px-6 font-bold text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] text-right w-[200px]">{{ localeStore.t('actions') }}</th>
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

            <!-- Multi-level Tree Rows -->
            <tr
              v-for="item in flattenedTree"
              :key="item.id"
              class="border-b border-[var(--border-color)] transition-all duration-200 group"
              :class="[
                dragOverId === item.id ? 'ring-2 ring-inset ring-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10' : '',
                draggingId === item.id ? 'opacity-40 scale-[0.98]' : '',
                item.level === 0 ? 'hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5' : 
                item.level === 1 ? 'bg-indigo-50/15 dark:bg-indigo-500/[0.02] hover:bg-indigo-50/40 dark:hover:bg-indigo-500/[0.05]' :
                'bg-purple-50/20 dark:bg-purple-500/[0.04] hover:bg-purple-50/50 dark:hover:bg-purple-500/[0.07]'
              ]"
              draggable="true"
              @dragstart="onDragStart($event, item)"
              @dragend="onDragEnd"
              @dragover.prevent="onDragOver($event, item)"
              @dragleave="onDragLeave"
              @drop.prevent="onDrop($event, item)"
            >
              <!-- Drag Handle Column -->
              <td class="py-4 px-3 text-center">
                <div
                  class="w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-grab active:cursor-grabbing transition-all"
                  title="Drag to reorder"
                >
                  <GripVertical :size="18" stroke-width="2" />
                </div>
              </td>

              <!-- Icon Column -->
              <td class="py-4 px-6">
                <div
                  class="rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm"
                  :class="[
                    item.level === 0 ? 'w-11 h-11 bg-white dark:bg-slate-800 border border-[var(--border-color)] text-indigo-500 group-hover:scale-110 group-hover:shadow-md' :
                    item.level === 1 ? 'w-9 h-9 bg-white dark:bg-slate-800 border border-dashed border-purple-300 dark:border-purple-500/30 text-purple-500 group-hover:scale-105' :
                    'w-8 h-8 bg-white dark:bg-slate-800 border border-dotted border-pink-300 dark:border-pink-500/30 text-pink-500 group-hover:scale-105'
                  ]"
                >
                  <component :is="getIconComponent(item.icon)" :size="item.level === 0 ? 20 : (item.level === 1 ? 16 : 14)" stroke-width="2.5" />
                </div>
              </td>

              <!-- Category Name Column with Indentation & Branch Lines -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-2" :style="{ paddingLeft: `${item.level * 24}px` }">
                  <!-- Tree connector icon if level > 0 -->
                  <div v-if="item.level > 0" class="flex items-center text-slate-400 dark:text-slate-500 shrink-0">
                    <CornerDownRight :size="14" stroke-width="2.5" />
                  </div>

                  <!-- Expand / Collapse chevron if has children -->
                  <button
                    v-if="item.hasChildren"
                    @click="toggleExpand(item.id)"
                    class="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-all cursor-pointer shrink-0"
                    :title="item.isExpanded ? 'Collapse sub-categories' : 'Expand sub-categories'"
                  >
                    <ChevronDown :size="16" :class="item.isExpanded ? '' : '-rotate-90'" class="transition-transform duration-200" />
                  </button>
                  <div v-else class="w-6 shrink-0"></div>

                  <!-- Name -->
                  <span
                    class="font-bold transition-colors"
                    :class="[
                      item.level === 0 ? 'text-[1.05rem] font-extrabold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400' :
                      item.level === 1 ? 'text-[0.96rem] text-[var(--text-primary)]/90 group-hover:text-indigo-600 dark:group-hover:text-indigo-400' :
                      'text-[0.9rem] text-[var(--text-secondary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    ]"
                    :style="(localeStore.currentLang === 'km' && item.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''"
                  >
                    {{ (localeStore.currentLang === 'km' && item.name_km) ? item.name_km : item.name }}
                  </span>

                  <!-- Sub indicator badge -->
                  <span
                    v-if="item.level > 0"
                    class="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap"
                    :class="item.level === 1 ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-500' : 'bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-500'"
                  >
                    {{ item.level === 1 ? 'sub' : `sub-L${item.level}` }}
                  </span>

                  <!-- Child count badge if has children -->
                  <span
                    v-if="item.hasChildren"
                    class="text-[0.72rem] font-bold px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full whitespace-nowrap"
                  >
                    {{ item.childCount }} sub
                  </span>
                </div>
              </td>

              <!-- Description Column -->
              <td class="py-4 px-6">
                <span class="text-[0.9rem] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {{ item.description || localeStore.t('noDescriptionProvided') }}
                </span>
              </td>

              <!-- Books Count Column -->
              <td class="py-4 px-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span
                    class="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[0.82rem] font-bold shadow-sm whitespace-nowrap"
                    :class="item.hasChildren
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'"
                    :title="item.hasChildren
                      ? `Total: ${item.total_book_count || 0} books (${item.book_count || 0} direct + ${(item.total_book_count || 0) - (item.book_count || 0)} in sub-categories)`
                      : `${item.book_count || 0} books`"
                  >
                    {{ item.hasChildren ? (item.total_book_count || 0) : (item.book_count || 0) }} {{ localeStore.t('books') }}
                  </span>
                  <!-- "incl. sub" label for parents so the user knows it's a total -->
                  <span
                    v-if="item.hasChildren"
                    class="text-[0.62rem] text-[var(--text-muted)] font-medium leading-none"
                  >incl. sub</span>
                </div>
              </td>

              <!-- Actions Column: ALL categories have Add Sub (FolderPlus), Edit (Pencil), Delete (Trash2) -->
              <td class="py-4 px-6">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openAddModal(item)"
                    :title="`Add Sub-Category under &quot;${item.name}&quot;`"
                    class="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  >
                    <FolderPlus :size="16" stroke-width="2.5" />
                  </button>
                  <button
                    @click="openEditModal(item)"
                    :title="localeStore.t('editCategory') || 'Edit'"
                    class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Pencil :size="16" stroke-width="2.5" />
                  </button>
                  <button
                    @click="confirmDelete(item)"
                    :title="localeStore.t('deleteCategory') || 'Delete'"
                    class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Trash2 :size="16" stroke-width="2.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" @click.self="isModalOpen = false">
      <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-[600px] bg-[var(--bg-card)] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-[var(--border-color)] flex flex-col max-h-[90vh] overflow-hidden">
        <header class="flex justify-between items-center px-8 py-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center" :class="form.parent_id ? 'bg-purple-500/10 border border-purple-500/20 text-purple-500' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-500'">
              <FolderPlus v-if="form.parent_id && !isEditing" :size="24" stroke-width="2.5" />
              <Tags v-else :size="24" stroke-width="2.5" />
            </div>
            <div>
              <h2 class="text-[1.4rem] font-extrabold text-[var(--text-primary)] tracking-tight">
                {{ isEditing ? localeStore.t('editCategoryTitle') : (form.parent_id ? 'Add Sub-Category' : localeStore.t('addNewCategoryTitle')) }}
              </h2>
              <p class="text-[0.85rem] text-[var(--text-secondary)] mt-0.5">
                {{ form.parent_id ? `Under parent: "${getParentName(form.parent_id)}"` : localeStore.t('createCategoryDesc') }}
              </p>
            </div>
          </div>
          <button @click="isModalOpen = false" class="w-10 h-10 rounded-full bg-gray-500/5 flex items-center justify-center text-[var(--text-muted)] hover:bg-gray-500/10 hover:text-[var(--text-primary)] transition-all hover:rotate-90 cursor-pointer"><X :size="20" /></button>
        </header>

        <form @submit.prevent="saveCategory" class="flex flex-col flex-1 overflow-hidden">
          <div class="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">

            <!-- Parent Category selector with indented tree view of all categories -->
            <div class="group">
              <label class="block text-[0.85rem] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Parent Category <span class="text-[var(--text-muted)] font-normal normal-case">(optional - select to make it a sub-category)</span>
              </label>
              <div class="relative">
                <FolderOpen :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <select v-model="form.parent_id" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl pl-11 pr-10 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm font-medium appearance-none cursor-pointer">
                  <option value="">— Top-level Category (No parent) —</option>
                  <option v-for="cat in availableParents" :key="cat.id" :value="cat.id">
                    {{ (localeStore.currentLang === 'km' && cat.displayNameKm) ? cat.displayNameKm : cat.displayName }}
                  </option>
                </select>
                <ChevronDown :size="16" class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>

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
            <button type="button" @click="isModalOpen = false" class="px-6 py-3 rounded-xl font-bold text-[var(--text-secondary)] bg-transparent hover:bg-gray-500/10 transition-all cursor-pointer">{{ localeStore.t('cancel') }}</button>
            <button type="submit" :disabled="saving" class="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.3)] flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer">
              <Save :size="20" stroke-width="2.5" :class="{ 'animate-pulse': saving }" />
              {{ saving ? localeStore.t('savingLabel') : localeStore.t('saveCategory') }}
            </button>
          </footer>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" @click.self="isDeleteModalOpen = false">
      <div class="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-w-[460px] px-8 py-10 text-center">
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 border-4 border-red-100 dark:border-red-500/20 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-red-500/20 animate-ping rounded-full"></div>
            <AlertTriangle :size="36" stroke-width="2.5" class="text-red-500 relative z-10" />
          </div>
        </div>
        <h2 class="text-[1.6rem] font-extrabold mb-3 text-[var(--text-primary)]">{{ localeStore.t('deleteCategoryTitle') }}</h2>

        <!-- Warning: Category has sub-categories -->
        <div v-if="categoryToDeleteHasChildren" class="mb-8">
          <p class="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed mb-4">
            Cannot delete <strong class="text-indigo-500">{{ categoryToDelete?.name }}</strong> — it contains sub-categories.
          </p>
          <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle class="text-amber-500 shrink-0 mt-0.5" :size="20" />
            <p class="text-[0.9rem] text-amber-800 dark:text-amber-200 m-0 font-medium leading-relaxed">
              Please delete or reassign its sub-categories first before deleting this category.
            </p>
          </div>
        </div>

        <!-- Warning: Category has books -->
        <div v-else-if="categoryToDelete?.book_count > 0" class="mb-8">
          <p class="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed mb-4">
            Cannot delete <strong class="text-indigo-500">{{ categoryToDelete?.name }}</strong> — it has <strong>{{ categoryToDelete?.book_count }}</strong> book(s).
          </p>
          <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle class="text-amber-500 shrink-0 mt-0.5" :size="20" />
            <p class="text-[0.9rem] text-amber-800 dark:text-amber-200 m-0 font-medium leading-relaxed">{{ localeStore.t('reassignBeforeDelete') }}</p>
          </div>
        </div>

        <!-- Normal confirmation -->
        <div v-else class="mb-8">
          <p class="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed mb-4">
            Are you sure you want to delete <strong class="text-[var(--text-primary)]">{{ categoryToDelete?.name }}</strong>?
          </p>
          <p class="text-[0.9rem] font-bold text-red-500 uppercase tracking-wider">{{ localeStore.t('actionCannotUndo') }}</p>
        </div>

        <footer class="flex justify-center gap-4">
          <button @click="isDeleteModalOpen = false" class="px-6 py-3 rounded-xl font-bold text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-gray-500/5 transition-all active:scale-95 cursor-pointer">
            {{ (categoryToDeleteHasChildren || categoryToDelete?.book_count > 0) ? localeStore.t('goBack') : localeStore.t('cancel') }}
          </button>
          <button
            v-if="!categoryToDeleteHasChildren && categoryToDelete?.book_count === 0"
            @click="executeDelete"
            :disabled="deleting"
            class="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
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
import { Plus, Pencil, Trash2, X, Save, AlertCircle, AlertTriangle, Loader2, Tags, BookOpen, ChevronDown, FolderPlus, FolderOpen, CornerDownRight, GripVertical } from 'lucide-vue-next';

const booksStore = useBooksStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const formError = ref('');
const expandedParents = ref(new Set());

const totalCatalogBooks = computed(() =>
  // Sum total_book_count from ROOT categories only (they include all descendants).
  // This avoids double-counting books that appear in both parent and child totals.
  booksStore.categories
    .filter(c => !c.parent_id)
    .reduce((sum, cat) => sum + (cat.total_book_count || cat.book_count || 0), 0)
);

const rootCategories = computed(() =>
  booksStore.categories.filter(c => !c.parent_id)
);

const subCategoriesCount = computed(() =>
  booksStore.categories.filter(c => !!c.parent_id).length
);

// Multi-level flattened tree for table rendering with arbitrary nesting depth
const flattenedTree = computed(() => {
  const result = [];

  function traverse(parentId = null, level = 0) {
    const items = booksStore.categories.filter(c => {
      if (!parentId) return !c.parent_id;
      return String(c.parent_id) === String(parentId);
    });

    // Sort by sort_order ascending, fallback to name
    items.sort((a, b) => {
      const aOrder = a.sort_order !== undefined && a.sort_order !== '' ? Number(a.sort_order) : 9999;
      const bOrder = b.sort_order !== undefined && b.sort_order !== '' ? Number(b.sort_order) : 9999;
      return aOrder - bOrder || a.name.localeCompare(b.name);
    });

    for (const item of items) {
      const children = booksStore.categories.filter(c => String(c.parent_id) === String(item.id));
      const hasChildren = children.length > 0;
      const isExpanded = expandedParents.value.has(item.id);

      result.push({
        ...item,
        level,
        hasChildren,
        childCount: children.length,
        isExpanded
      });

      if (hasChildren && isExpanded) {
        traverse(item.id, level + 1);
      }
    }
  }

  traverse(null, 0);
  return result;
});

// Indented list of available parent categories for modal dropdown, excluding self and all descendants to prevent loops
const availableParents = computed(() => {
  const excludedIds = new Set();
  if (isEditing.value && form.id) {
    excludedIds.add(String(form.id));
    function markDescendants(pId) {
      booksStore.categories.forEach(c => {
        if (String(c.parent_id) === String(pId)) {
          excludedIds.add(String(c.id));
          markDescendants(c.id);
        }
      });
    }
    markDescendants(form.id);
  }

  const list = [];
  function buildOptions(parentId = null, level = 0) {
    const items = booksStore.categories.filter(c => {
      if (!parentId) return !c.parent_id;
      return String(c.parent_id) === String(parentId);
    });
    items.sort((a, b) => a.name.localeCompare(b.name));
    for (const item of items) {
      if (!excludedIds.has(String(item.id))) {
        const indent = level > 0 ? `${'   '.repeat(level)}↳ ` : '';
        list.push({
          id: item.id,
          name: item.name,
          name_km: item.name_km,
          displayName: `${indent}${item.name}`,
          displayNameKm: `${indent}${item.name_km || item.name}`
        });
        buildOptions(item.id, level + 1);
      }
    }
  }
  buildOptions(null, 0);
  return list;
});

function getParentName(parentId) {
  const p = booksStore.categories.find(c => String(c.id) === String(parentId));
  return p ? p.name : '';
}

function toggleExpand(catId) {
  const s = new Set(expandedParents.value);
  s.has(catId) ? s.delete(catId) : s.add(catId);
  expandedParents.value = s;
}

const form = reactive({ id: '', name: '', name_km: '', description: '', icon: 'BookOpen', parent_id: '' });

// --- Drag & Drop Reordering ---
const draggingId = ref(null);
const dragOverId = ref(null);
const dragItem = ref(null);

function onDragStart(event, item) {
  draggingId.value = item.id;
  dragItem.value = item;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', item.id);
}

function onDragEnd() {
  draggingId.value = null;
  dragOverId.value = null;
  dragItem.value = null;
}

function onDragOver(event, item) {
  if (!dragItem.value || dragItem.value.id === item.id) return;
  // Only allow reordering within the same parent
  if (String(dragItem.value.parent_id || '') !== String(item.parent_id || '')) return;
  dragOverId.value = item.id;
}

function onDragLeave() {
  dragOverId.value = null;
}

async function onDrop(event, dropTarget) {
  if (!dragItem.value || dragItem.value.id === dropTarget.id) {
    onDragEnd();
    return;
  }
  // Only allow reordering within the same parent level
  if (String(dragItem.value.parent_id || '') !== String(dropTarget.parent_id || '')) {
    onDragEnd();
    return;
  }

  // Get all siblings (same parent), sorted by current sort_order
  const siblings = booksStore.categories
    .filter(c => String(c.parent_id || '') === String(dragItem.value.parent_id || ''))
    .slice()
    .sort((a, b) => {
      const ao = a.sort_order !== undefined && a.sort_order !== '' ? Number(a.sort_order) : 9999;
      const bo = b.sort_order !== undefined && b.sort_order !== '' ? Number(b.sort_order) : 9999;
      return ao - bo || a.name.localeCompare(b.name);
    });

  // Remove dragged item from list, insert before drop target
  const fromIndex = siblings.findIndex(c => String(c.id) === String(dragItem.value.id));
  const toIndex = siblings.findIndex(c => String(c.id) === String(dropTarget.id));
  if (fromIndex === -1 || toIndex === -1) { onDragEnd(); return; }

  siblings.splice(fromIndex, 1);
  const adjustedTo = siblings.findIndex(c => String(c.id) === String(dropTarget.id));
  siblings.splice(adjustedTo, 0, { ...dragItem.value });

  // Build new orders
  const orders = siblings.map((c, idx) => ({ id: c.id, sort_order: idx }));

  // Optimistic update: patch sort_order locally for instant feedback
  booksStore.categories.forEach(c => {
    const found = orders.find(o => String(o.id) === String(c.id));
    if (found) c.sort_order = found.sort_order;
  });

  onDragEnd();

  try {
    await booksStore.reorderCategories(orders);
    toastStore.showSuccess('Category order saved!');
  } catch (err) {
    toastStore.show(err.message || 'Failed to save order', { type: 'error', title: 'Error' });
    await booksStore.fetchCategories(true); // revert on failure
  }
}

const isDeleteModalOpen = ref(false);
const deleting = ref(false);
const categoryToDelete = ref(null);

const categoryToDeleteHasChildren = computed(() => {
  if (!categoryToDelete.value) return false;
  return booksStore.categories.some(c => String(c.parent_id) === String(categoryToDelete.value.id));
});

onMounted(async () => {
  await booksStore.fetchCategories(true);
  // Auto-expand all categories that have children
  const s = new Set();
  booksStore.categories.forEach(cat => {
    const hasKids = booksStore.categories.some(c => String(c.parent_id) === String(cat.id));
    if (hasKids) s.add(cat.id);
  });
  expandedParents.value = s;
});

const getIconComponent = (iconName) => (iconName && LucideIcons[iconName]) ? LucideIcons[iconName] : BookOpen;

const openAddModal = (parentCategory = null) => {
  isEditing.value = false;
  Object.assign(form, {
    id: '',
    name: '',
    name_km: '',
    description: '',
    icon: 'BookOpen',
    parent_id: parentCategory ? parentCategory.id : ''
  });
  formError.value = '';
  isModalOpen.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  Object.assign(form, {
    id: category.id,
    name: category.name,
    name_km: category.name_km || '',
    description: category.description || '',
    icon: category.icon || 'BookOpen',
    parent_id: category.parent_id || ''
  });
  formError.value = '';
  isModalOpen.value = true;
};

const saveCategory = async () => {
  if (!form.name.trim()) { formError.value = 'Category name is required'; return; }
  saving.value = true;
  formError.value = '';
  const payload = {
    name: form.name.trim(),
    name_km: form.name_km ? form.name_km.trim() : '',
    description: form.description ? form.description.trim() : '',
    icon: form.icon || 'BookOpen',
    parent_id: form.parent_id || ''
  };

  try {
    if (isEditing.value) {
      await booksStore.updateCategory(form.id, payload);
      toastStore.showSuccess('Category updated successfully');
    } else {
      await booksStore.addCategory(payload);
      toastStore.showSuccess(form.parent_id ? 'Sub-category created!' : 'Category created successfully');
    }

    // Auto-expand the parent and all ancestors of the affected category
    if (form.parent_id) {
      const s = new Set(expandedParents.value);
      let currId = form.parent_id;
      while (currId) {
        s.add(currId);
        const p = booksStore.categories.find(c => String(c.id) === String(currId));
        currId = p?.parent_id;
      }
      expandedParents.value = s;
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
