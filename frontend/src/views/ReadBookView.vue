<template>
  <div class="reader-page-wrapper" :class="themeMode">
    <!-- Top Reading Header Navigation Bar -->
    <header class="reader-nav-header">
      <div class="nav-left">
        <button @click="goBack" class="reader-back-btn" title="Back to Book Catalog">
          <ArrowLeft :size="16" /> <span>{{ localeStore.t('back') || 'Back' }}</span>
        </button>

        <div class="book-meta-group">
          <span class="category-badge">{{ book?.category_name || 'General' }}</span>
          <div class="title-meta">
            <h1 class="nav-book-title" :title="book?.title">{{ book?.title || 'Loading Book...' }}</h1>
            <span class="nav-book-author">by {{ book?.author || 'DUC Library' }}</span>
          </div>
          <div class="active-readers-pill" title="People reading this book online right now">
            <span class="live-pulse-dot"></span>
            <span>{{ activeReadersCount }} reading now</span>
          </div>
        </div>
      </div>

      <div class="nav-right">
        <!-- Theme Mode Switcher -->
        <div class="theme-picker-wrapper" title="Reading Background Theme">
          <span class="picker-label">Theme:</span>
          <div class="theme-picker">
            <button 
              @click="themeMode = 'theme-dark'" 
              class="theme-btn dark" 
              :class="{ active: themeMode === 'theme-dark' }"
              title="Dark Mode"
            >
              <Moon :size="14" />
              <span class="btn-label">Dark</span>
            </button>
            <button 
              @click="themeMode = 'theme-sepia'" 
              class="theme-btn sepia" 
              :class="{ active: themeMode === 'theme-sepia' }"
              title="Warm Sepia Mode"
            >
              <Coffee :size="14" />
              <span class="btn-label">Sepia</span>
            </button>
            <button 
              @click="themeMode = 'theme-light'" 
              class="theme-btn light" 
              :class="{ active: themeMode === 'theme-light' }"
              title="Light Mode"
            >
              <Sun :size="14" />
              <span class="btn-label">Light</span>
            </button>
          </div>
        </div>

        <!-- Fullscreen Toggle Button -->
        <button @click="toggleFullscreen" class="header-action-btn" title="Toggle Fullscreen">
          <Maximize2 v-if="!isFullscreen" :size="16" />
          <Minimize2 v-else :size="16" />
        </button>

        <!-- Borrow Book Action Button -->
        <button v-if="book" @click="openBorrowModal" class="borrow-btn">
          <BookmarkPlus :size="16" /> <span>Borrow Physical Copy</span>
        </button>
      </div>
    </header>

    <!-- Main Fullscreen Reading Area -->
    <main class="reader-main-area" ref="mainAreaRef">
      <!-- Loading State -->
      <div v-if="loading || pdfLoading" class="loading-state">
        <Loader2 :size="48" class="spin loader-icon" />
        <p>Loading Digital PDF Reader...</p>
      </div>

      <!-- Continuous Multi-Page PDF Canvas Reader View -->
      <div 
        v-else-if="book?.pdf_url" 
        class="ebook-canvas-container"
        ref="pdfScrollContainerRef"
        @scroll="onPdfScroll"
      >
        <div class="paper-viewport-list">
          <div 
            v-for="pageNum in totalPdfPages" 
            :key="pageNum"
            :id="`pdf-page-${pageNum}`"
            class="ebook-paper-sheet" 
            :class="themeMode"
          >
            <canvas :ref="el => setCanvasRef(el, pageNum)" class="pdf-page-canvas"></canvas>
            <div v-if="!renderedPagesSet.has(pageNum)" class="canvas-render-overlay">
              <Loader2 :size="32" class="spin" />
            </div>
            <div class="page-number-footer">Page {{ pageNum }} of {{ totalPdfPages }}</div>
          </div>
        </div>

        <!-- Floating Reader Dock -->
        <div class="ebook-floating-dock">
          <button @click="scrollToPage(currentPageNum - 1)" :disabled="currentPageNum <= 1" class="dock-btn" title="Previous Page">
            <ChevronLeft :size="18" /> <span>Prev</span>
          </button>

          <div class="dock-page-info">
            <span>Page</span>
            <input 
              type="number" 
              v-model.number="currentPageNum" 
              @change="scrollToPage(currentPageNum)" 
              min="1" 
              :max="totalPdfPages"
              class="page-input"
            />
            <span>of {{ totalPdfPages }}</span>
          </div>

          <div class="dock-zoom-controls">
            <button @click="zoomOut" class="dock-icon-btn" title="Zoom Out"><ZoomOut :size="16" /></button>
            <span @click="resetZoom" class="zoom-label" title="Reset Zoom">{{ Math.round(pdfScale * 100) }}%</span>
            <button @click="zoomIn" class="dock-icon-btn" title="Zoom In"><ZoomIn :size="16" /></button>
          </div>

          <button @click="scrollToPage(currentPageNum + 1)" :disabled="currentPageNum >= totalPdfPages" class="dock-btn primary" title="Next Page">
            <span>Next</span> <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <!-- Original Raw PDF Iframe View Fallback -->
      <div v-else-if="book?.pdf_url && viewMode === 'raw'" class="pdf-container">
        <iframe 
          :src="pdfUrlFormatted" 
          class="fullscreen-pdf-iframe" 
          title="Digital PDF Reader"
        ></iframe>
      </div>

      <!-- Physical Book Information Notice -->
      <div v-else class="empty-reader-notice">
        <div class="notice-card glass-panel">
          <div class="notice-icon-circle">
            <BookOpen :size="48" />
          </div>
          <h2>Physical Library Book</h2>
          <p class="notice-desc">
            <strong>"{{ book?.title }}"</strong> is available in physical copy at DUC Library!
          </p>
          <div class="copies-pill">
            <PackageCheck :size="16" />
            <span>{{ book?.copies_available || 0 }} of {{ book?.copies_total || 0 }} physical copies available for borrowing</span>
          </div>

          <div class="notice-actions">
            <button @click="goBack" class="btn btn-secondary">
              <ArrowLeft :size="16" /> Back to Catalog
            </button>
            <button @click="openBorrowModal" class="btn btn-primary" :disabled="book?.copies_available <= 0">
              <BookmarkPlus :size="16" /> Request Borrow Now
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Borrow Request Modal -->
    <BorrowModal 
      :is-open="isBorrowOpen" 
      :book="book" 
      @close="isBorrowOpen = false"
      @success="handleBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import BorrowModal from '../components/BorrowModal.vue';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Moon, Coffee, Sun, 
  Maximize2, Minimize2, BookmarkPlus, Loader2, BookOpen, 
  PackageCheck, ZoomIn, ZoomOut 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const booksStore = useBooksStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();

const book = ref(null);
const loading = ref(true);
const viewMode = ref('ebook');
const themeMode = ref('theme-dark');
const isFullscreen = ref(false);
const isBorrowOpen = ref(false);
const mainAreaRef = ref(null);

// Continuous Multi-Page PDF State
const pdfDoc = shallowRef(null);
const currentPageNum = ref(1);
const totalPdfPages = ref(0);
const pdfScale = ref(1.25);
const pdfLoading = ref(true);
const pdfError = ref(null);
const canvasRefsMap = new Map();
const renderedPagesSet = ref(new Set());
const pdfScrollContainerRef = ref(null);

const sessionId = 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
const activeReadersCount = ref(1);
let heartbeatTimer = null;

const pdfUrlFormatted = computed(() => {
  if (!book.value?.pdf_url) return '';
  const url = book.value.pdf_url;
  if (url.includes('#')) return url;
  return `${url}#toolbar=1&navpanes=0&view=FitH`;
});

function setCanvasRef(el, pageNum) {
  if (el) {
    canvasRefsMap.set(pageNum, el);
  } else {
    canvasRefsMap.delete(pageNum);
  }
}

function loadPdfJsScript() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

async function renderPdfPageByNumber(pageNum) {
  if (!pdfDoc.value || pageNum < 1 || pageNum > totalPdfPages.value) return;
  if (renderedPagesSet.value.has(pageNum)) return;

  const canvas = canvasRefsMap.get(pageNum);
  if (!canvas) return;

  try {
    const page = await pdfDoc.value.getPage(pageNum);
    const context = canvas.getContext('2d');
    
    let scale = pdfScale.value;
    if (window.innerWidth <= 640) {
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      scale = Math.min(1.5, (window.innerWidth - 24) / unscaledViewport.width);
    }

    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    renderedPagesSet.value.add(pageNum);
  } catch (err) {
    console.error(`PDF page ${pageNum} render error:`, err);
  }
}

async function renderAllPdfPagesSequential() {
  if (!pdfDoc.value) return;
  renderedPagesSet.value.clear();
  
  // Render first 3 pages immediately
  for (let i = 1; i <= Math.min(3, totalPdfPages.value); i++) {
    await renderPdfPageByNumber(i);
  }
  
  // Progressively render remaining pages
  for (let i = 4; i <= totalPdfPages.value; i++) {
    renderPdfPageByNumber(i);
  }
}

function onPdfScroll() {
  if (!pdfDoc.value || totalPdfPages.value === 0) return;
  
  for (let pageNum = 1; pageNum <= totalPdfPages.value; pageNum++) {
    const pageEl = document.getElementById(`pdf-page-${pageNum}`);
    if (pageEl) {
      const rect = pageEl.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 3) {
        currentPageNum.value = pageNum;
        renderPdfPageByNumber(pageNum);
        if (pageNum + 1 <= totalPdfPages.value) {
          renderPdfPageByNumber(pageNum + 1);
        }
        break;
      }
    }
  }
}

function scrollToPage(targetPage) {
  if (targetPage < 1 || targetPage > totalPdfPages.value) return;
  currentPageNum.value = targetPage;
  const pageEl = document.getElementById(`pdf-page-${targetPage}`);
  if (pageEl) {
    pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderPdfPageByNumber(targetPage);
  }
}

async function zoomIn() {
  if (pdfScale.value < 2.5) {
    pdfScale.value = parseFloat((pdfScale.value + 0.15).toFixed(2));
    renderedPagesSet.value.clear();
    await nextTick();
    renderAllPdfPagesSequential();
  }
}

async function zoomOut() {
  if (pdfScale.value > 0.6) {
    pdfScale.value = parseFloat((pdfScale.value - 0.15).toFixed(2));
    renderedPagesSet.value.clear();
    await nextTick();
    renderAllPdfPagesSequential();
  }
}

async function resetZoom() {
  pdfScale.value = 1.25;
  renderedPagesSet.value.clear();
  await nextTick();
  renderAllPdfPagesSequential();
}

async function initPdfReader(url) {
  if (!url) return;
  pdfLoading.value = true;
  pdfError.value = null;
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('PDF.js canvas render timeout')), 5000)
  );

  try {
    const pdfjs = await loadPdfJsScript();
    const loadingTask = pdfjs.getDocument({
      url: url,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });
    
    pdfDoc.value = await Promise.race([loadingTask.promise, timeoutPromise]);
    totalPdfPages.value = pdfDoc.value.numPages;
    currentPageNum.value = 1;

    pdfLoading.value = false;
    await nextTick();
    await renderAllPdfPagesSequential();
  } catch (err) {
    console.warn('PDF.js loading error, falling back to raw iframe:', err);
    pdfError.value = err.message || 'Failed to render PDF canvas';
    viewMode.value = 'raw';
  } finally {
    pdfLoading.value = false;
  }
}

async function sendReadingPing(isInitial = false) {
  if (!book.value?.id) return;
  try {
    const res = await fetch(`http://localhost:5001/api/books/${book.value.id}/ping-reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    if (res.ok) {
      const data = await res.json();
      activeReadersCount.value = data.active_readers_count || 1;
    }
  } catch (err) {
    console.error('Reading heartbeat ping error:', err);
  }
}

onMounted(async () => {
  try {
    const bookId = route.params.id;
    book.value = await booksStore.fetchBookById(bookId);
    if (book.value?.id) {
      await sendReadingPing(true);
      heartbeatTimer = setInterval(() => sendReadingPing(false), 25000);
      
      if (book.value.pdf_url) {
        initPdfReader(book.value.pdf_url);
      }
    }
  } catch (err) {
    console.error('Failed to load book for reading:', err);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}

function openBorrowModal() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  isBorrowOpen.value = true;
}

function handleBorrowSuccess(msg) {
  isBorrowOpen.value = false;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen error:', err);
    });
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    isFullscreen.value = false;
  }
}
</script>

<style scoped>
.reader-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  transition: background-color 0.35s ease, color 0.35s ease;
}

/* Theme Base Rules */
.reader-page-wrapper.theme-dark {
  background: #0b0f19;
  color: #f8fafc;
}

.reader-page-wrapper.theme-sepia {
  background: #f2e3c6;
  color: #3b2a1a;
}

.reader-page-wrapper.theme-light {
  background: #e2e8f0;
  color: #0f172a;
}

/* Header */
.reader-nav-header {
  height: 60px;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  color: #f8fafc;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.reader-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reader-back-btn:hover {
  background: rgba(99, 102, 241, 0.25);
  border-color: #6366f1;
}

.book-meta-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
  font-size: 0.72rem;
  font-weight: 700;
}

.title-meta {
  display: flex;
  flex-direction: column;
}

.nav-book-title {
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  margin: 0;
}

.nav-book-author {
  font-size: 0.75rem;
  color: #94a3b8;
}

.active-readers-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  font-size: 0.72rem;
  font-weight: 600;
}

.live-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.theme-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.picker-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.theme-picker {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn.active {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.header-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.borrow-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.95rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

/* Main Area */
.reader-main-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: calc(100vh - 60px);
  color: #94a3b8;
}

.loader-icon {
  color: #6366f1;
}

/* Continuous Multi-Page PDF Canvas Container */
.ebook-canvas-container {
  width: 100%;
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 6rem;
  background: var(--reader-bg);
}

.paper-viewport-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  width: 100%;
  max-width: 100%;
}

.ebook-paper-sheet {
  position: relative;
  border-radius: var(--radius-md);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  background: #ffffff;
  overflow: hidden;
  transition: background 0.3s ease;
}

.theme-dark .ebook-paper-sheet {
  background: #0f172a;
}

.pdf-page-canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.canvas-render-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.page-number-footer {
  text-align: center;
  padding: 0.4rem;
  font-size: 0.72rem;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.8);
}

/* Floating Dock */
.ebook-floating-dock {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
  color: #f8fafc;
}

.dock-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.dock-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
}

.dock-page-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.page-input {
  width: 44px;
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.2rem 0;
}

.dock-zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.5rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.dock-icon-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.zoom-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #38bdf8;
  cursor: pointer;
}

@media (max-width: 640px) {
  .reader-nav-header {
    height: 52px;
    padding: 0 0.65rem;
  }
  .nav-book-title {
    max-width: 120px;
    font-size: 0.85rem;
  }
  .category-badge, .active-readers-pill, .picker-label, .borrow-btn span {
    display: none;
  }
  .ebook-canvas-container {
    padding: 0.75rem 0.25rem 5.5rem;
  }
  .ebook-floating-dock {
    bottom: 0.65rem;
    padding: 0.35rem 0.65rem;
    gap: 0.4rem;
  }
  .dock-btn span {
    display: none;
  }
}
</style>
