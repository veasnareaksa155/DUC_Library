<template>
  <div class="flex items-start min-h-screen w-full">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 py-6 px-8 pb-16 w-[calc(100%-280px)] max-w-none">
      <header class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-[2.2rem] font-extrabold text-[var(--text-primary)]">{{ localeStore.t('books') }} Management</h1>
          <p class="text-[var(--text-secondary)]">Add new books, update stock counts, edit digital content, or remove books.</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="openBookSyncModal" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-5 py-2.5 text-sm mr-2">
            <FileSpreadsheet :size="18" /> Sync Books from Sheet
          </button>
          <button @click="openAddModal" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-5 py-2.5 text-sm">
            <Plus :size="18" /> {{ localeStore.t('addNewBook') }}
          </button>
        </div>
      </header>

      <!-- Books Table -->
      <div class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm">
        <div class="mb-6 flex flex-wrap gap-4 items-center">
          <div class="relative flex-1 min-w-[280px] max-w-[450px] flex items-center">
            <Search :size="18" class="absolute left-4 text-[var(--text-muted)] pointer-events-none" />
            <input 
              v-model="booksStore.searchQuery" 
              @input="booksStore.fetchBooks()" 
              type="text" 
              class="w-full pl-10 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm placeholder:text-[var(--text-muted)]"
              placeholder="Search by title, author, category, or ISBN..." 
            />
          </div>
          
          <div class="relative min-w-[240px]">
            <Library :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <select 
              v-model="booksStore.selectedCategory"
              class="w-full appearance-none pl-10 pr-10 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium cursor-pointer shadow-sm"
            >
              <option value="all" class="bg-[var(--bg-card)] font-medium">All Categories (Catalog)</option>
              <option v-for="cat in booksStore.categories" :key="cat.id" :value="cat.id" class="bg-[var(--bg-card)] font-medium">
                {{ cat.name }}
              </option>
            </select>
            <ChevronDown :size="16" class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        <!-- Premium Glassmorphic Skeleton Loader -->
        <div v-if="booksStore.loading && booksStore.books.length === 0" class="animate-pulse w-full overflow-x-auto">
          <table class="w-full border-collapse text-left opacity-70">
            <thead>
              <tr>
                <th v-for="i in 6" :key="'th-'+i" class="px-4 py-3.5 bg-gray-500/5 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-20"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="'tr-'+i">
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="flex items-center gap-3.5">
                    <div class="w-[42px] h-[60px] bg-[var(--border-color)] rounded"></div>
                    <div class="flex flex-col gap-2">
                      <div class="h-4 bg-[var(--border-color)] rounded w-32"></div>
                      <div class="h-3 bg-[var(--border-color)] rounded w-24"></div>
                    </div>
                  </div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)]"><div class="h-4 bg-[var(--border-color)] rounded w-24"></div></td>
                <td class="p-4 border-b border-[var(--border-color)]"><div class="h-6 bg-[var(--border-color)] rounded-full w-20"></div></td>
                <td class="p-4 border-b border-[var(--border-color)]"><div class="h-4 bg-[var(--border-color)] rounded w-16"></div></td>
                <td class="p-4 border-b border-[var(--border-color)]"><div class="h-4 bg-[var(--border-color)] rounded w-28"></div></td>
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="flex gap-1.5">
                    <div class="h-8 bg-[var(--border-color)] rounded w-20"></div>
                    <div class="h-8 bg-[var(--border-color)] rounded w-16"></div>
                    <div class="h-8 bg-[var(--border-color)] rounded w-10"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr class="bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-extrabold uppercase tracking-wider">
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Cover & Title</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Author</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Category</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Stock / Available</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">ISBN</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              <tr v-for="book in paginatedBooks" :key="book.id" class="group hover:bg-indigo-500/[0.03] dark:hover:bg-indigo-500/[0.05] transition-colors duration-200">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img :src="book.cover_url || fallbackCover" class="w-[50px] h-[72px] object-cover rounded-md border border-[var(--border-color)] transition-opacity duration-300" />
                    <div class="flex flex-col">
                      <span class="font-extrabold text-[0.98rem] text-[var(--text-primary)] group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 max-w-[280px]" :title="book.title">{{ book.title }}</span>
                      <span class="text-[0.78rem] text-[var(--text-muted)] font-medium mt-0.5 truncate max-w-[280px]">{{ book.publisher || 'Unknown Publisher' }} ({{ book.publish_year || 'N/A' }})</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-[0.92rem] font-semibold text-[var(--text-secondary)]">{{ book.author }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 flex-wrap max-w-[180px]">
                    <span class="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] px-2.5 py-1 rounded-md text-[0.75rem] font-bold tracking-wide whitespace-nowrap">{{ book.category_name || 'General' }}</span>
                    <span v-if="book.pdf_url" class="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md text-[0.72rem] font-bold whitespace-nowrap" title="Digital PDF Document Attached"><FileText :size="12" stroke-width="2.5" /> PDF</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full" :class="book.copies_available === 0 ? 'bg-red-500' : 'bg-emerald-500'"></div>
                    <span class="font-bold text-[0.9rem]" :class="book.copies_available === 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'">
                      {{ book.copies_available }} / {{ book.copies_total }}
                    </span>
                    <span class="text-[0.78rem] text-[var(--text-muted)] font-medium">copies</span>
                  </div>
                </td>
                <td class="px-6 py-4 font-mono text-[0.88rem] text-[var(--text-secondary)] font-medium">{{ book.isbn || 'N/A' }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      @click="toggleFeatured(book)" 
                      class="p-2 rounded-md transition-colors"
                      :class="[
                        book.is_featured ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-amber-500',
                        loadingFeatureId === book.id ? 'opacity-70 cursor-not-allowed' : ''
                      ]"
                      :title="book.is_featured ? 'Remove from Popular/Featured' : 'Add to Popular/Featured'"
                      :disabled="loadingFeatureId === book.id"
                    >
                      <Loader2 v-if="loadingFeatureId === book.id" :size="16" class="animate-spin text-amber-500" />
                      <Star v-else :size="16" :fill="book.is_featured ? 'currentColor' : 'none'" :stroke-width="2" />
                    </button>
                    <button @click="openEditModal(book)" class="p-2 rounded-md bg-transparent text-[var(--text-muted)] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Edit Book">
                      <Pencil :size="16" stroke-width="2" />
                    </button>
                    <button @click="confirmDelete(book)" class="p-2 rounded-md bg-transparent text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Delete Book">
                      <Trash2 :size="16" stroke-width="2" />
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="!booksStore.loading && paginatedBooks.length === 0">
                <td colspan="6" class="px-6 py-20 text-center bg-gray-500/5">
                  <div class="flex flex-col items-center justify-center text-[var(--text-muted)] gap-4">
                    <div class="w-20 h-20 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
                      <Search :size="36" class="opacity-50 text-indigo-400" />
                    </div>
                    <div class="flex flex-col gap-1">
                      <p class="font-extrabold text-[1.1rem] text-[var(--text-primary)]">No books found</p>
                      <p class="text-[0.88rem] max-w-sm mx-auto leading-relaxed">We couldn't find any books matching "{{ booksStore.searchQuery }}" or the selected category filter. Try adjusting your search criteria.</p>
                    </div>
                    <button @click="booksStore.searchQuery = ''; booksStore.selectedCategory = 'all'" class="mt-2 text-indigo-500 text-[0.85rem] font-bold hover:underline">Clear Filters</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div v-if="booksStore.books.length > 0" class="flex justify-between items-center pt-5 mt-4 border-t border-[var(--border-color)]">
          <div class="text-[0.85rem] text-[var(--text-muted)] font-medium">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, booksStore.books.length) }} of {{ booksStore.books.length }} books
          </div>

          <div class="flex items-center gap-3">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/10 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft :size="16" />
            </button>

            <span class="text-[0.85rem] font-bold text-[var(--text-primary)]">Page {{ currentPage }} of {{ totalPages }}</span>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/10 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Book Modal -->
      <!-- Add / Edit Book Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" @click.self="isModalOpen = false">
        <!-- Adaptable Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-all duration-300"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-[850px] bg-[var(--bg-card)] rounded-lg shadow-xl border border-[var(--border-color)] flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300">
          
          <!-- Header -->
          <header class="flex justify-between items-center px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-card)] shrink-0">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-bold text-[var(--text-primary)] tracking-tight">{{ isEditing ? 'Edit Book Inventory' : 'Add New Book' }}</h2>
            </div>
            <button @click="isModalOpen = false" class="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer p-1 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"><X :size="20" stroke-width="2" /></button>
          </header>

          <form @submit.prevent="saveBook" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-8">
              
              <!-- Core Information -->
              <div class="space-y-4">
                <h3 class="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                  <Star :size="16" stroke-width="2" class="text-[var(--text-secondary)]" /> Core Information
                </h3>
                
                <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div class="col-span-2 group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Book Title *</label>
                    <input v-model="form.title" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium" required placeholder="e.g. Clean Code" />
                  </div>

                  <div class="group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Author *</label>
                    <input v-model="form.author" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium" required placeholder="e.g. Robert C. Martin" />
                  </div>

                  <div class="group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Category *</label>
                    <div class="relative">
                      <select v-model="form.category_id" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm appearance-none font-medium" required>
                        <option v-for="cat in booksStore.categories" :key="cat.id" :value="cat.id" class="bg-[var(--bg-primary)]">
                          {{ cat.name }}
                        </option>
                      </select>
                      <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                        <ChevronRight :size="16" class="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Physical Details -->
              <div class="space-y-4">
                <h3 class="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                  <Bookmark :size="16" stroke-width="2" class="text-[var(--text-secondary)]" /> Publishing & Inventory
                </h3>
                
                <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div class="group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">ISBN Number</label>
                    <input v-model="form.isbn" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-mono text-[0.9rem]" placeholder="978-..." />
                  </div>

                  <div class="group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Total Copies *</label>
                    <input 
                      v-model.number="form.copies_total" 
                      type="number" 
                      class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm font-mono text-[0.9rem]" 
                      min="0" 
                      required 
                    />
                  </div>

                  <div class="group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Publisher</label>
                    <input v-model="form.publisher" type="text" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium" placeholder="Publisher name" />
                  </div>

                  <div class="group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Publish Year</label>
                    <input v-model.number="form.publish_year" type="number" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-mono text-[0.9rem]" placeholder="2024" />
                  </div>
                </div>
              </div>

              <!-- Digital Assets -->
              <div class="space-y-4">
                <h3 class="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                  <Image :size="16" stroke-width="2" class="text-[var(--text-secondary)]" /> Media & Digital Assets
                </h3>

                <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div class="col-span-2 group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Cover Image (URL or Upload)</label>
                    <div class="flex gap-3 items-stretch">
                      <div class="relative flex-1">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]/60">
                          <Image :size="16" />
                        </div>
                        <input 
                          :value="form.cover_url && form.cover_url.startsWith('data:image/') ? '[ Local Image File Attached ]' : form.cover_url" 
                          @input="form.cover_url = $event.target.value"
                          :readonly="form.cover_url && form.cover_url.startsWith('data:image/')"
                          type="text" 
                          placeholder="https://..." 
                          class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-mono text-[0.85rem]" 
                          :class="{'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10': form.cover_url && form.cover_url.startsWith('data:image/')}"
                        />
                      </div>
                      <button type="button" @click="triggerImageSelect" class="flex items-center justify-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-5 font-semibold transition-colors shadow-sm whitespace-nowrap cursor-pointer">
                        <Upload :size="16" stroke-width="2" /> <span class="hidden sm:inline">Upload</span>
                      </button>
                      <input type="file" ref="imageFileInputRef" accept="image/*" @change="onImageFileSelected" style="display: none" />
                    </div>
                  </div>

                  <div class="col-span-2 group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Book PDF (For Online Reading)</label>
                    <div class="flex gap-3 items-stretch">
                      <div class="relative flex-1">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]/60">
                          <FileText :size="16" />
                        </div>
                        <input 
                          :value="form.pdf_url && form.pdf_url.startsWith('data:application/pdf') ? '[ Local PDF File Attached ]' : form.pdf_url" 
                          @input="form.pdf_url = $event.target.value"
                          :readonly="form.pdf_url && form.pdf_url.startsWith('data:application/pdf')"
                          type="text" 
                          placeholder="https://..." 
                          class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-mono text-[0.85rem]" 
                          :class="{'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10': form.pdf_url && form.pdf_url.startsWith('data:application/pdf')}"
                        />
                      </div>
                      <button type="button" @click="triggerPdfSelect" class="flex items-center justify-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-5 font-semibold transition-colors shadow-sm whitespace-nowrap cursor-pointer">
                        <Upload :size="16" stroke-width="2" /> <span class="hidden sm:inline">Upload</span>
                      </button>
                      <input type="file" ref="pdfFileInputRef" accept="application/pdf" @change="onPdfFileSelected" style="display: none" />
                    </div>
                    
                    <div v-if="form.pdf_url" class="mt-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-md flex flex-col gap-2 transition-all">
                      <div class="inline-flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-[0.85rem] font-bold">
                        <CheckCircle :size="16" stroke-width="2" /> PDF Document Attached
                      </div>
                      <div v-if="form.digital_content" class="inline-flex items-center gap-2 text-[var(--text-secondary)] text-[0.75rem] font-medium bg-[var(--bg-card)] border border-[var(--border-color)] self-start px-2 py-1 rounded">
                        <Star :size="14" stroke-width="2" /> Auto-Extracted ({{ form.digital_content.length }} chars)
                      </div>
                    </div>
                  </div>

                  <div class="col-span-2 group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Book Description</label>
                    <textarea v-model="form.description" rows="3" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50 font-medium resize-none" placeholder="Brief summary of the book content..."></textarea>
                  </div>

                  <div class="col-span-2 group">
                    <label class="block text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1.5 transition-colors">Digital Text (For E-Reader)</label>
                    <textarea v-model="form.digital_content" rows="4" class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm font-mono text-[0.82rem] placeholder:text-[var(--text-muted)]/50 resize-none custom-scrollbar" placeholder="Chapter 1 content or book excerpt..."></textarea>
                  </div>

                  <div class="col-span-2 mt-2">
                    <label class="flex items-center gap-3 cursor-pointer group w-fit">
                      <div class="relative flex items-center justify-center">
                        <input type="checkbox" v-model="form.is_featured" class="peer appearance-none w-4 h-4 border border-[var(--border-color)] rounded-sm flex-shrink-0 checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer bg-[var(--bg-primary)]" />
                        <Check :size="12" stroke-width="3" class="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span class="font-medium text-[var(--text-primary)] text-[0.85rem] transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        Feature this book in Popular List
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div v-if="formError" class="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-medium rounded-md text-[0.85rem] flex items-center gap-2">
                <AlertCircle :size="16" stroke-width="2" class="shrink-0 text-red-500" /> {{ formError }}
              </div>
            </div>

            <footer class="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] shrink-0">
              <button type="button" @click="isModalOpen = false" class="px-5 py-2 rounded-md font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">Cancel</button>
              <button type="submit" class="px-5 py-2 rounded-md font-medium text-white bg-indigo-600 border border-transparent hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer" :disabled="saving">
                <Save :size="16" :class="{ 'animate-pulse': saving }" />
                {{ saving ? 'Saving...' : 'Save Book' }}
              </button>
            </footer>
          </form>
        </div>
      </div>

      <!-- Sync Google Sheet Book Inventory Modal -->
      <div v-if="isBookSyncModalOpen" class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200" @click.self="isBookSyncModalOpen = false">
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <header class="flex justify-between items-center mb-6">
            <h2>Sync Books from Google Sheet</h2>
            <button @click="isBookSyncModalOpen = false" class="bg-transparent border-none text-[var(--text-muted)] cursor-pointer hover:text-slate-200"><X :size="20" /></button>
          </header>

          <div class="modal-body">
            <p class="text-[0.9rem] text-[var(--text-secondary)] mb-4 leading-relaxed">
              Import book inventory, categories, titles, and physical stock counts automatically from your Google Sheet!
            </p>

            <div class="mt-4">
              <label class="block text-[0.82rem] font-semibold text-[var(--text-secondary)] mb-1.5">Book Inventory Google Spreadsheet ID</label>
              <input 
                v-model="bookSpreadsheetId" 
                type="text" 
                class="w-full"
                placeholder="e.g. 1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU" 
              />
              <small class="text-[0.78rem] text-[var(--text-muted)] block mt-1">Found in your Google Sheet URL between <code>/d/</code> and <code>/edit</code></small>
            </div>

            <div v-if="bookSyncMessage" class="flex items-center gap-2 px-4 py-3 bg-emerald-500/15 text-emerald-500 rounded-[var(--radius-md)] mt-4 text-[0.88rem]">
              <CheckCircle :size="16" /> {{ bookSyncMessage }}
            </div>

            <div v-if="bookSyncError" class="flex items-center gap-2 px-4 py-3 bg-red-500/15 text-red-500 rounded-[var(--radius-md)] mt-4 text-[0.88rem]">
              <AlertCircle :size="16" /> {{ bookSyncError }}
            </div>
          </div>

          <footer class="flex justify-end gap-3 mt-6">
            <button @click="isBookSyncModalOpen = false" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-5 py-2.5 text-sm">Cancel</button>
            <button @click="handleBookSync" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-5 py-2.5 text-sm" :disabled="bookSyncing">
              <RefreshCw :size="16" :class="{ 'animate-spin': bookSyncing }" />
              {{ bookSyncing ? 'Importing Books...' : 'Sync Book Inventory Now' }}
            </button>
          </footer>
        </div>
      </div>
      <!-- Custom Delete Confirmation Modal -->
      <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200" @click.self="isDeleteModalOpen = false">
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm max-w-[440px] px-6 py-8 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-red-500/12 border border-red-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.2)]">
              <AlertTriangle :size="32" class="text-red-500" />
            </div>
          </div>

          <h2 class="text-[1.35rem] font-extrabold mb-2">Delete Book</h2>
          <p class="text-[0.95rem] text-[var(--text-primary)] mb-1.5 leading-relaxed">
            Are you sure you want to delete <strong class="text-[var(--accent-primary)]">"{{ bookToDelete?.title }}"</strong> from library inventory?
          </p>
          <small class="text-[0.78rem] text-[var(--text-muted)] block mb-5">This action cannot be undone and will permanently remove the book from the catalog.</small>

          <footer class="flex justify-center gap-3 mt-4">
            <button @click="isDeleteModalOpen = false" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-5 py-2.5 text-sm">Cancel</button>
            <button @click="executeDeleteBook" class="bg-gradient-to-br from-red-500 to-red-600 text-white border-none font-bold shadow-[0_4px_15px_rgba(239,68,68,0.35)] transition-all duration-250 ease-[var(--spring-ease)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)] px-4 py-2 rounded-md flex items-center gap-2" :disabled="deleting">
              <Trash2 :size="16" />
              {{ deleting ? 'Deleting...' : 'Yes, Delete Book' }}
            </button>
          </footer>
        </div>
      </div>

      <!-- Delete Success Popup Modal -->
      <div v-if="isDeleteSuccessOpen" class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200 backdrop-blur-[8px]" @click="isDeleteSuccessOpen = false">
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm max-w-[420px] px-7 py-9 animate-[modalPopIn_0.35s_var(--spring-ease)] text-center">
          <div class="flex justify-center mb-4">
            <div class="w-[70px] h-[70px] rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle :size="36" class="text-emerald-500" />
            </div>
          </div>

          <h2 class="text-[1.3rem] font-extrabold text-emerald-500 mb-2">Book Deleted Successfully!</h2>
          <p class="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed">
            <strong class="text-[var(--accent-primary)]">"{{ deleteSuccessTitle }}"</strong> has been removed from the library catalog.
          </p>
          <button @click="isDeleteSuccessOpen = false" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-4 py-2 text-sm mt-5">OK, Got It</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useBooksStore } from '../../stores/books';
import { useAuthStore } from '../../stores/auth';
import { useLocaleStore } from '../../stores/locale';
import { useToastStore } from '../../stores/toast';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { Star, Plus, Search, Pencil, Trash2, X, Save, FileSpreadsheet, RefreshCw, CheckCircle, AlertCircle, 
AlertTriangle, ChevronLeft, ChevronRight, FileText, Upload, Bookmark, Image, Loader2, Library, ChevronDown, BookOpen } from 'lucide-vue-next';

const booksStore = useBooksStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const pdfFileInputRef = ref(null);
const imageFileInputRef = ref(null);

function triggerPdfSelect() {
  if (pdfFileInputRef.value) {
    pdfFileInputRef.value.click();
  }
}

function triggerImageSelect() {
  if (imageFileInputRef.value) {
    imageFileInputRef.value.click();
  }
}

function onImageFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    formError.value = 'Image file size must be less than 5MB.';
    return;
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    form.cover_url = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function onPdfFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > 30 * 1024 * 1024) {
    formError.value = 'PDF file size must be less than 30MB.';
    return;
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    form.pdf_url = evt.target.result;
  };
  reader.readAsDataURL(file);
}

const currentPage = ref(1);
const itemsPerPage = ref(15);

const totalPages = computed(() => Math.ceil((booksStore.books?.length || 0) / itemsPerPage.value) || 1);

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return (booksStore.books || []).slice(start, start + itemsPerPage.value);
});

watch(() => booksStore.searchQuery, () => {
  currentPage.value = 1;
});

const isModalOpen = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const saving = ref(false);
const formError = ref('');

const isBookSyncModalOpen = ref(false);
const bookSpreadsheetId = ref('');
const bookSyncing = ref(false);
const bookSyncMessage = ref('');
const bookSyncError = ref('');

function openBookSyncModal() {
  bookSyncMessage.value = '';
  bookSyncError.value = '';
  isBookSyncModalOpen.value = true;
}

async function handleBookSync() {
  if (!bookSpreadsheetId.value.trim()) {
    bookSyncError.value = 'Please enter a valid Google Spreadsheet ID.';
    return;
  }

  bookSyncing.value = true;
  bookSyncMessage.value = '';
  bookSyncError.value = '';

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/sync-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ spreadsheet_id: bookSpreadsheetId.value })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Book sync failed');

    bookSyncMessage.value = data.message;
    await booksStore.fetchCategories();
    await booksStore.fetchBooks();
  } catch (err) {
    bookSyncError.value = err.message || 'Failed to sync book inventory from Google Sheet.';
  } finally {
    bookSyncing.value = false;
  }
}

const form = reactive({
  title: '',
  author: '',
  isbn: '',
  category_id: 1,
  description: '',
  cover_url: '',
  pdf_url: '',
  digital_content: '',
  copies_total: 1,
  publisher: '',
  publish_year: new Date().getFullYear(),
  is_featured: false
});

onMounted(() => {
  booksStore.fetchCategories();
  booksStore.fetchBooks();
});

const loadingFeatureId = ref(null);

async function toggleFeatured(book) {
  if (loadingFeatureId.value) return;
  loadingFeatureId.value = book.id;
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/${book.id}/toggle-featured`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    if (res.ok) {
      const isNowFeatured = !book.is_featured;
      await booksStore.fetchBooks();
      toastStore.showSuccess(
        isNowFeatured ? `"${book.title}" added to Popular list! ⭐` : `"${book.title}" removed from Popular list.`,
        'Success'
      );
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to toggle featured status');
    }
  } catch (err) {
    console.error('Failed to toggle featured status:', err);
    toastStore.show(err.message || 'An error occurred while updating.', { type: 'error', title: 'Error' });
  } finally {
    loadingFeatureId.value = null;
  }
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  formError.value = '';
  Object.assign(form, {
    title: '',
    author: '',
    isbn: '',
    category_id: booksStore.categories[0]?.id || 1,
    description: '',
    cover_url: '',
    pdf_url: '',
    digital_content: '',
    copies_total: 3,
    publisher: '',
    publish_year: new Date().getFullYear(),
    is_featured: false
  });
  isModalOpen.value = true;
}

async function openEditModal(book) {
  isEditing.value = true;
  editingId.value = book.id;
  formError.value = '';
  
  // Show modal immediately with basic info while fetching full details
  Object.assign(form, {
    title: book.title,
    author: book.author,
    isbn: book.isbn || '',
    category_id: book.category_id || 1,
    description: book.description || '',
    cover_url: book.cover_url || '',
    pdf_url: 'Loading...',
    digital_content: 'Loading...',
    copies_total: book.copies_total,
    publisher: book.publisher || '',
    publish_year: book.publish_year || new Date().getFullYear(),
    is_featured: Boolean(book.is_featured)
  });
  isModalOpen.value = true;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/${book.id}`);
    if (res.ok) {
      const fullBook = await res.json();
      form.pdf_url = fullBook.pdf_url || '';
      form.digital_content = fullBook.digital_content || '';
    }
  } catch (err) {
    console.error('Failed to load full book details:', err);
    form.pdf_url = '';
    form.digital_content = '';
  }
}

async function saveBook() {
  saving.value = true;
  formError.value = '';
  
  if (form.copies_total < 0) {
    formError.value = 'Total Copies cannot be negative.';
    saving.value = false;
    return;
  }
  
  try {
    if (isEditing.value) {
      await booksStore.updateBook(editingId.value, form);
    } else {
      await booksStore.addBook(form);
    }
    isModalOpen.value = false;
  } catch (err) {
    formError.value = err.message || 'Failed to save book.';
  } finally {
    saving.value = false;
  }
}

const isDeleteModalOpen = ref(false);
const bookToDelete = ref(null);
const deleting = ref(false);

const isDeleteSuccessOpen = ref(false);
const deleteSuccessTitle = ref('');

function confirmDelete(book) {
  bookToDelete.value = book;
  isDeleteModalOpen.value = true;
}

async function executeDeleteBook() {
  if (!bookToDelete.value) return;
  deleting.value = true;
  try {
    deleteSuccessTitle.value = bookToDelete.value.title;
    await booksStore.deleteBook(bookToDelete.value.id);
    isDeleteModalOpen.value = false;
    isDeleteSuccessOpen.value = true;
    setTimeout(() => {
      isDeleteSuccessOpen.value = false;
    }, 2800);
  } catch (err) {
    alert(err.message || 'Failed to delete book.');
  } finally {
    deleting.value = false;
  }
}
</script>


