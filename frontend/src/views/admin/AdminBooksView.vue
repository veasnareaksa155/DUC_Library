<template>
  <div class="admin-layout-wrapper">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="admin-main-content">
      <header class="admin-header">
        <div>
          <h1 class="page-title">{{ localeStore.t('books') }} <span class="text-gradient">Management</span></h1>
          <p class="page-subtitle">Add new books, update stock counts, edit digital content, or remove books.</p>
        </div>
        <div class="header-actions">
          <button @click="openBookSyncModal" class="btn btn-secondary mr-2">
            <FileSpreadsheet :size="18" /> Sync Books from Sheet
          </button>
          <button @click="openAddModal" class="btn btn-primary">
            <Plus :size="18" /> {{ localeStore.t('addNewBook') }}
          </button>
        </div>
      </header>

      <!-- Books Table -->
      <div class="glass-panel main-panel">
        <div class="search-filter-bar">
          <div class="search-input">
            <Search :size="18" class="icon" />
            <input 
              v-model="booksStore.searchQuery" 
              @input="booksStore.fetchBooks()" 
              type="text" 
              placeholder="Search by title, author, or ISBN..." 
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Cover & Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Stock / Available</th>
                <th>ISBN</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in paginatedBooks" :key="book.id">
                <td>
                  <div class="book-cell">
                    <img :src="book.cover_url || fallbackCover" class="table-cover" />
                    <div>
                      <div class="book-title-text">{{ book.title }}</div>
                      <div class="publisher-text">{{ book.publisher || 'Unknown Publisher' }} ({{ book.publish_year || 'N/A' }})</div>
                    </div>
                  </div>
                </td>
                <td>{{ book.author }}</td>
                <td>
                  <span class="cat-pill">{{ book.category_name || 'General' }}</span>
                  <span v-if="book.pdf_url" class="pdf-tag ml-1" title="Digital PDF Document Attached"><FileText :size="12" /> PDF</span>
                </td>
                <td>
                  <span class="stock-count" :class="{ empty: book.copies_available === 0 }">
                    {{ book.copies_available }} / {{ book.copies_total }} copies
                  </span>
                </td>
                <td class="font-mono">{{ book.isbn || 'N/A' }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="toggleFeatured(book)" 
                      class="btn btn-sm"
                      :class="book.is_featured ? 'btn-warning-star' : 'btn-secondary'"
                      :title="book.is_featured ? 'Remove from Popular/Featured' : 'Add to Popular/Featured'"
                    >
                      <Star :size="14" :fill="book.is_featured ? '#f59e0b' : 'none'" color="#f59e0b" />
                      <span>{{ book.is_featured ? 'Featured' : 'Feature' }}</span>
                    </button>
                    <button @click="openEditModal(book)" class="btn btn-secondary btn-sm" title="Edit Book">
                      <Pencil :size="14" /> Edit
                    </button>
                    <button @click="confirmDelete(book)" class="btn btn-danger btn-sm" title="Delete Book">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div v-if="booksStore.books.length > 0" class="pagination-bar">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, booksStore.books.length) }} of {{ booksStore.books.length }} books
          </div>

          <div class="pagination-controls">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="btn-page"
            >
              <ChevronLeft :size="16" />
            </button>

            <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="btn-page"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Book Modal -->
      <div v-if="isModalOpen" class="modal-backdrop" @click.self="isModalOpen = false">
        <div class="modal-content glass-panel modal-lg">
          <header class="modal-header">
            <h2>{{ isEditing ? 'Edit Book Inventory' : 'Add New Book to Library' }}</h2>
            <button @click="isModalOpen = false" class="btn-close"><X :size="20" /></button>
          </header>

          <form @submit.prevent="saveBook" class="modal-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Book Title *</label>
                <input v-model="form.title" type="text" required placeholder="e.g. Clean Code" />
              </div>

              <div class="form-group">
                <label>Author *</label>
                <input v-model="form.author" type="text" required placeholder="e.g. Robert C. Martin" />
              </div>

              <div class="form-group">
                <label>Category *</label>
                <select v-model="form.category_id" required>
                  <option v-for="cat in booksStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>ISBN Number</label>
                <input v-model="form.isbn" type="text" placeholder="978-..." />
              </div>

              <div class="form-group">
                <label>Total Physical Copies</label>
                <input v-model.number="form.copies_total" type="number" min="1" required />
              </div>

              <div class="form-group">
                <label>Publisher</label>
                <input v-model="form.publisher" type="text" placeholder="Publisher name" />
              </div>

              <div class="form-group">
                <label>Publish Year</label>
                <input v-model.number="form.publish_year" type="number" placeholder="2024" />
              </div>

              <div class="form-group full-width">
                <label>Cover Image URL</label>
                <input v-model="form.cover_url" type="url" placeholder="https://images.unsplash.com/..." />
              </div>

              <div class="form-group full-width">
                <label class="pdf-label"><FileText :size="16" /> Book PDF Document (For Online Reading)</label>
                <div class="pdf-upload-row">
                  <input v-model="form.pdf_url" type="text" placeholder="Paste PDF URL (https://...) or choose a PDF file to upload" class="pdf-url-input" />
                  <button type="button" @click="triggerPdfSelect" class="btn btn-secondary btn-sm upload-pdf-btn">
                    <Upload :size="15" /> Choose PDF File
                  </button>
                  <input type="file" ref="pdfFileInputRef" accept="application/pdf" @change="onPdfFileSelected" style="display: none" />
                </div>
                <div v-if="form.pdf_url" class="pdf-attached-badge mt-2">
                  <CheckCircle :size="14" /> PDF Document Attached & Ready!
                  <span v-if="form.digital_content" class="text-extracted-pill ml-2">
                    ⚡ PDF Text Auto-Extracted for Fast Reading ({{ form.digital_content.length }} chars)
                  </span>
                </div>
              </div>

              <div class="form-group full-width">
                <label>Book Description</label>
                <textarea v-model="form.description" rows="3" placeholder="Brief summary of the book content..."></textarea>
              </div>

              <div class="form-group full-width">
                <label>Online Digital Text Content (For E-Reader)</label>
                <textarea v-model="form.digital_content" rows="5" placeholder="Chapter 1 content or book excerpt for reading online..."></textarea>
              </div>

              <div class="form-group full-width featured-checkbox-group">
                <label class="checkbox-label flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="form.is_featured" class="feature-checkbox" />
                  <span class="font-semibold text-warning">⭐ Feature this book in Popular / Slider ("កំពុងពេញនិយម")</span>
                </label>
              </div>
            </div>

            <div v-if="formError" class="error-msg">{{ formError }}</div>

            <footer class="modal-footer">
              <button type="button" @click="isModalOpen = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <Save :size="18" />
                {{ saving ? 'Saving Book...' : 'Save Book' }}
              </button>
            </footer>
          </form>
        </div>
      </div>

      <!-- Sync Google Sheet Book Inventory Modal -->
      <div v-if="isBookSyncModalOpen" class="modal-backdrop" @click.self="isBookSyncModalOpen = false">
        <div class="modal-content glass-panel">
          <header class="modal-header">
            <h2>Sync Books from Google Sheet</h2>
            <button @click="isBookSyncModalOpen = false" class="btn-close"><X :size="20" /></button>
          </header>

          <div class="modal-body">
            <p class="modal-desc">
              Import book inventory, categories, titles, and physical stock counts automatically from your Google Sheet!
            </p>

            <div class="form-group mt-3">
              <label>Book Inventory Google Spreadsheet ID</label>
              <input 
                v-model="bookSpreadsheetId" 
                type="text" 
                placeholder="e.g. 1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU" 
              />
              <small class="help-text">Found in your Google Sheet URL between <code>/d/</code> and <code>/edit</code></small>
            </div>

            <div v-if="bookSyncMessage" class="success-box">
              <CheckCircle :size="16" /> {{ bookSyncMessage }}
            </div>

            <div v-if="bookSyncError" class="error-box">
              <AlertCircle :size="16" /> {{ bookSyncError }}
            </div>
          </div>

          <footer class="modal-footer">
            <button @click="isBookSyncModalOpen = false" class="btn btn-secondary">Cancel</button>
            <button @click="handleBookSync" class="btn btn-primary" :disabled="bookSyncing">
              <RefreshCw :size="16" :class="{ spin: bookSyncing }" />
              {{ bookSyncing ? 'Importing Books...' : 'Sync Book Inventory Now' }}
            </button>
          </footer>
        </div>
      </div>
      <!-- Custom Delete Confirmation Modal -->
      <div v-if="isDeleteModalOpen" class="modal-backdrop" @click.self="isDeleteModalOpen = false">
        <div class="modal-content glass-panel modal-sm text-center">
          <div class="delete-icon-wrapper">
            <div class="delete-icon-bg">
              <AlertTriangle :size="32" class="delete-icon" />
            </div>
          </div>

          <h2 class="modal-title">Delete Book</h2>
          <p class="delete-confirm-text">
            Are you sure you want to delete <strong class="highlight-title">"{{ bookToDelete?.title }}"</strong> from library inventory?
          </p>
          <small class="delete-subtext">This action cannot be undone and will permanently remove the book from the catalog.</small>

          <footer class="modal-footer justify-center mt-4">
            <button @click="isDeleteModalOpen = false" class="btn btn-secondary">Cancel</button>
            <button @click="executeDeleteBook" class="btn btn-danger-gradient" :disabled="deleting">
              <Trash2 :size="16" />
              {{ deleting ? 'Deleting...' : 'Yes, Delete Book' }}
            </button>
          </footer>
        </div>
      </div>

      <!-- Delete Success Popup Modal -->
      <div v-if="isDeleteSuccessOpen" class="modal-backdrop success-backdrop" @click="isDeleteSuccessOpen = false">
        <div class="modal-content glass-panel success-popup-content text-center">
          <div class="success-icon-wrapper">
            <div class="success-icon-bg">
              <CheckCircle :size="36" class="success-icon" />
            </div>
          </div>

          <h2 class="success-modal-title">Book Deleted Successfully!</h2>
          <p class="success-modal-subtitle">
            <strong class="highlight-title">"{{ deleteSuccessTitle }}"</strong> has been removed from the library catalog.
          </p>
          <button @click="isDeleteSuccessOpen = false" class="btn btn-primary btn-sm mt-3">OK, Got It</button>
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
import AdminSidebar from '../../components/AdminSidebar.vue';
import { Star, Plus, Search, Pencil, Trash2, X, Save, FileSpreadsheet, RefreshCw, CheckCircle, AlertCircle, AlertTriangle, ChevronLeft, ChevronRight, FileText, Upload } from 'lucide-vue-next';

const booksStore = useBooksStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const pdfFileInputRef = ref(null);

function triggerPdfSelect() {
  if (pdfFileInputRef.value) {
    pdfFileInputRef.value.click();
  }
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
    const res = await fetch('/api/books/sync-sheet', {
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

async function toggleFeatured(book) {
  try {
    const res = await fetch(`/api/books/${book.id}/toggle-featured`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    if (res.ok) {
      await booksStore.fetchBooks();
    }
  } catch (err) {
    console.error('Failed to toggle featured status:', err);
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

function openEditModal(book) {
  isEditing.value = true;
  editingId.value = book.id;
  formError.value = '';
  Object.assign(form, {
    title: book.title,
    author: book.author,
    isbn: book.isbn || '',
    category_id: book.category_id || 1,
    description: book.description || '',
    cover_url: book.cover_url || '',
    pdf_url: book.pdf_url || '',
    digital_content: book.digital_content || '',
    copies_total: book.copies_total,
    publisher: book.publisher || '',
    publish_year: book.publish_year || new Date().getFullYear(),
    is_featured: Boolean(book.is_featured)
  });
  isModalOpen.value = true;
}

async function saveBook() {
  saving.value = true;
  formError.value = '';
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

<style scoped>
.admin-layout-wrapper {
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
  width: 100%;
}

.admin-main-content {
  flex: 1;
  padding: 1.5rem 2rem 4rem;
  width: calc(100% - 280px);
  max-width: none !important;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
}

.page-subtitle {
  color: var(--text-secondary);
}

.main-panel {
  padding: 1.5rem;
}

.search-filter-bar {
  margin-bottom: 1.5rem;
}

.search-input {
  position: relative;
  max-width: 400px;
  display: flex;
  align-items: center;
}

.search-input .icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
}

.search-input input {
  width: 100%;
  padding-left: 2.75rem;
}

.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  padding: 0.85rem 1rem;
  background: rgba(125, 125, 125, 0.05);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.table-cover {
  width: 42px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.book-title-text {
  font-weight: 700;
  color: var(--text-primary);
}

.publisher-text {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.cat-pill {
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.pdf-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.pdf-upload-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.35rem;
}

.pdf-url-input {
  flex: 1;
}

.upload-pdf-btn {
  white-space: nowrap;
}

.pdf-attached-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.stock-count {
  font-weight: 600;
  color: var(--success);
}

.stock-count.empty {
  color: var(--danger);
}

.font-mono {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
}

.modal-lg {
  max-width: 750px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  margin-bottom: 1.5rem;
}

.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
}

.error-msg {
  padding: 0.75rem;
  background: var(--danger-bg);
  color: #ef4444;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pdf-attached-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
}

.text-extracted-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(99, 102, 241, 0.18);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.modal-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.help-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: block;
  margin-top: 0.25rem;
}

.success-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  font-size: 0.88rem;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  font-size: 0.88rem;
}

.modal-sm {
  max-width: 440px;
  padding: 2rem 1.5rem;
}

.text-center {
  text-align: center;
}

.justify-center {
  justify-content: center;
}

.delete-icon-wrapper, .success-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.delete-icon-bg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.2);
}

.delete-icon {
  color: #ef4444;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.delete-confirm-text {
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
  line-height: 1.4;
}

.highlight-title {
  color: var(--accent-primary);
}

.delete-subtext {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 1.25rem;
}

.btn-danger-gradient {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
  transition: all 0.25s var(--spring-ease);
}

.btn-danger-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
}

.btn-warning-star {
  background: rgba(245, 158, 11, 0.18);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.btn-warning-star:hover {
  background: rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}

.success-backdrop {
  backdrop-filter: blur(8px);
}

.success-popup-content {
  max-width: 420px;
  padding: 2.25rem 1.75rem;
  animation: modalPopIn 0.35s var(--spring-ease);
}

.success-icon-bg {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.success-icon {
  color: #10b981;
}

.success-modal-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.success-modal-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.25rem;
  margin-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-page {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: rgba(125, 125, 125, 0.08);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-page:hover:not(:disabled) {
  background: var(--accent-gradient);
  color: white;
  border-color: transparent;
}

.btn-page:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
