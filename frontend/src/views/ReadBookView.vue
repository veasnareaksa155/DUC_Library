<template>
  <div class="flex flex-col h-[100dvh] w-screen overflow-hidden transition-colors duration-350 ease-in-out" :class="themeMode === 'theme-dark' ? 'bg-[#0b0f19] text-slate-50' : themeMode === 'theme-sepia' ? 'bg-[#f2e3c6] text-[#3b2a1a]' : 'bg-slate-200 text-slate-900'">
    <!-- Top Reading Header Navigation Bar -->
    <header class="sticky top-0 w-full shrink-0 h-[60px] px-5 flex items-center justify-between bg-slate-900 border-b border-white/10 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-slate-50 max-sm:h-[52px] max-sm:px-2.5 gap-4">
      <div class="flex items-center gap-4 min-w-0 flex-1">
        <button @click="goBack" class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent text-slate-300 text-[0.85rem] font-medium cursor-pointer transition-colors duration-200 hover:bg-white/10 hover:text-white" title="Back to Book Catalog">
          <ArrowLeft :size="16" /> <span>{{ localeStore.t('back') || 'Back' }}</span>
        </button>

        <div class="h-5 w-[1px] bg-white/15"></div>

        <div class="flex items-center gap-3 min-w-0">
          <div class="flex flex-col min-w-0 flex-1">
            <h1 class="text-[0.95rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px] m-0 max-sm:max-w-[120px] max-sm:text-[0.85rem]" :title="book?.title">{{ book?.title || 'Loading Book...' }}</h1>
            <div class="flex items-center gap-2 text-[0.75rem] text-slate-400 truncate">
              <span>{{ book?.category_name || 'General' }}</span>
              <span>&bull;</span>
              <span>{{ book?.author || 'DUC Library' }}</span>
            </div>
          </div>

          <div class="hidden md:flex items-center gap-2 text-slate-400 text-[0.75rem] flex-shrink-0 ml-2" title="People reading this book online right now">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{{ activeReadersCount }} reading now</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">

        <!-- Fullscreen Toggle Button -->
        <button @click="toggleFullscreen" class="w-[34px] h-[34px] rounded-full bg-white/10 border border-white/15 text-slate-50 flex items-center justify-center cursor-pointer" title="Toggle Fullscreen">
          <Maximize2 v-if="!isFullscreen" :size="16" />
          <Minimize2 v-else :size="16" />
        </button>

        <!-- Borrow Book Action Button -->
        <button v-if="book" @click="openBorrowModal" class="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md bg-indigo-600 text-white border-none text-[0.85rem] font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-indigo-600 [&:not(:disabled)]:hover:bg-indigo-700" :disabled="book.copies_available <= 0">
          <BookmarkPlus :size="16" /> <span class="hidden lg:inline-block">Borrow Physical Copy</span>
        </button>
      </div>
    </header>

    <!-- Main Fullscreen Reading Area -->
    <main class="flex-1 relative flex flex-col min-h-0" ref="mainAreaRef">
      <!-- Loading State -->
      <div v-if="loading || pdfLoading" class="flex flex-col items-center justify-center gap-4 h-[calc(100vh-60px)] text-slate-400">
        <Loader2 :size="48" class="animate-spin text-indigo-500" />
        <p>Loading Digital PDF Reader...</p>
      </div>

      <!-- Continuous Multi-Page PDF Canvas Reader View -->
      <div 
        v-else-if="book?.pdf_url && viewMode === 'ebook'" 
        class="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden relative flex flex-col items-center px-4 pb-24 pt-6 max-sm:px-1 max-sm:pb-22 max-sm:pt-3"
        ref="pdfScrollContainerRef"
        @scroll="onPdfScroll"
      >
        <div class="flex flex-col items-center gap-7 w-full max-w-full">
          <div 
            v-for="pageNum in totalPdfPages" 
            :key="pageNum"
            :id="`pdf-page-${pageNum}`"
            class="relative rounded-[var(--radius-md)] shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-colors duration-300" 
            :class="themeMode === 'theme-dark' ? 'bg-slate-900' : 'bg-white'"
          >
            <canvas :ref="el => setCanvasRef(el, pageNum)" class="block max-w-full h-auto"></canvas>
            <div v-if="!renderedPagesSet.has(pageNum)" class="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-indigo-500">
              <Loader2 :size="32" class="animate-spin" />
            </div>
            <div class="text-center p-1.5 text-[0.72rem] text-slate-400 bg-slate-900/80">Page {{ pageNum }} of {{ totalPdfPages }}</div>
          </div>
        </div>

        <!-- Google Drive Exact Style Floating Reader Dock -->
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99] flex items-center h-[46px] px-6 rounded-full bg-[#181a1b] shadow-xl text-[#f1f3f4] font-sans transition-all gap-5 border border-white/5">
          
          <!-- Page Navigation -->
          <div class="flex items-center">
            <span class="text-[15px] mr-3">Page</span>
            <input 
              type="text" 
              inputmode="numeric"
              pattern="[0-9]*"
              v-model.number="currentPageNum" 
              @change="scrollToPage(currentPageNum)" 
              class="w-12 h-7 px-1 text-center bg-[#090a0b] rounded-[4px] text-[#f1f3f4] text-[15px] outline-none transition-colors border-none"
            />
            <span class="text-[15px] ml-3 whitespace-nowrap">/ &nbsp; {{ totalPdfPages }}</span>
          </div>

          <!-- Divider -->
          <div class="w-[1px] h-7 bg-white/10"></div>

          <!-- Zoom Controls -->
          <div class="flex items-center gap-6">
            <button @click="zoomOut" class="flex items-center justify-center bg-transparent border-none text-[#f1f3f4] opacity-80 hover:opacity-100 cursor-pointer transition-opacity p-0" title="Zoom Out">
              <Minus :size="22" stroke-width="2" />
            </button>
            <button @click="resetZoom" class="flex items-center justify-center bg-transparent border-none text-[#f1f3f4] opacity-80 hover:opacity-100 cursor-pointer transition-opacity p-0" title="Reset Zoom">
              <ZoomIn :size="22" stroke-width="2" />
            </button>
            <button @click="zoomIn" class="flex items-center justify-center bg-transparent border-none text-[#f1f3f4] opacity-80 hover:opacity-100 cursor-pointer transition-opacity p-0" title="Zoom In">
              <Plus :size="22" stroke-width="2" />
            </button>
          </div>
        </div>
      </div>

      <!-- Original Raw PDF Iframe View Fallback -->
      <div v-else-if="book?.pdf_url && viewMode === 'raw'" class="flex-1 w-full relative">
        <iframe 
          :src="pdfUrlFormatted" 
          class="absolute inset-0 w-full h-full border-none" 
          title="Digital PDF Reader"
        ></iframe>
      </div>

      <!-- Premium Physical Book Information Notice -->
      <div v-else class="flex flex-col h-full w-full overflow-y-auto p-4 md:p-8 custom-scrollbar" :class="themeMode === 'theme-dark' ? 'bg-[#0b0f19]' : themeMode === 'theme-light' ? 'bg-slate-100' : 'bg-[#eadeb5]'">
        
        <div class="w-full max-w-[850px] mx-auto my-auto flex max-md:flex-col items-start gap-12 p-8 max-sm:p-5 max-sm:gap-6 rounded-xl border shrink-0" :class="themeMode === 'theme-dark' ? 'bg-slate-900 border-white/10' : themeMode === 'theme-light' ? 'bg-white border-slate-200' : 'bg-[#f5ebd2] border-[#d1bd8e]'">
          
          <!-- Book Cover -->
          <div class="relative shrink-0 max-md:mt-4 max-md:mx-auto">
            <div class="w-[220px] h-[320px] rounded-lg overflow-hidden border shadow-sm" :class="themeMode === 'theme-dark' ? 'border-white/10 bg-slate-800' : themeMode === 'theme-light' ? 'border-slate-200 bg-slate-100' : 'border-[#d1bd8e] bg-[#eadeb5]'">
              <img v-if="book?.cover_url" :src="book.cover_url" class="w-full h-full object-cover" alt="Book Cover" />
              <div v-else class="w-full h-full flex items-center justify-center" :class="themeMode === 'theme-dark' ? 'text-slate-500' : 'text-slate-400'">
                <BookOpen :size="48" />
              </div>
            </div>
          </div>

          <div class="flex-1 text-left flex flex-col items-start w-full">
            <div class="inline-flex items-center gap-1.5 mb-4" :class="themeMode === 'theme-dark' ? 'text-slate-400' : themeMode === 'theme-light' ? 'text-slate-500' : 'text-[#8a7250]'">
              <Library :size="14" />
              <span class="text-[0.75rem] font-bold tracking-wider uppercase">Physical Collection</span>
            </div>
            
            <h2 class="text-[2rem] font-bold mb-3 leading-tight" :class="themeMode === 'theme-dark' ? 'text-white' : 'text-slate-900'">
              {{ book?.title }}
            </h2>
            
            <p class="text-[0.95rem] leading-relaxed mb-8 max-w-[450px]" :class="themeMode === 'theme-dark' ? 'text-slate-300' : themeMode === 'theme-light' ? 'text-slate-600' : 'text-[#5c4a30]'">
              This physical book is available in our library catalog. Reserve your copy online and pick it up from the front desk.
            </p>

            <div class="w-full h-[1px] mb-8" :class="themeMode === 'theme-dark' ? 'bg-white/10' : themeMode === 'theme-light' ? 'bg-slate-200' : 'bg-[#d1bd8e]'"></div>

            <div class="flex flex-wrap items-center justify-start gap-4 w-full mb-8">
              <div class="flex items-center gap-4 px-5 py-3 rounded-lg border min-w-[200px]" :class="themeMode === 'theme-dark' ? 'bg-[#0b0f19] border-white/10' : themeMode === 'theme-light' ? 'bg-slate-50 border-slate-200' : 'bg-[#eadeb5] border-[#d1bd8e]'">
                <div class="flex flex-col text-left">
                  <span class="text-[0.7rem] font-bold uppercase tracking-wider mb-1" :class="themeMode === 'theme-dark' ? 'text-slate-400' : themeMode === 'theme-light' ? 'text-slate-500' : 'text-[#8a7250]'">Status</span>
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :class="book?.copies_available > 0 ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    <span class="text-[1.05rem] font-bold" :class="book?.copies_available > 0 ? 'text-emerald-500' : 'text-rose-500'">
                      {{ book?.copies_available > 0 ? 'Available' : 'Out of Stock' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-4 px-5 py-3 rounded-lg border min-w-[200px]" :class="themeMode === 'theme-dark' ? 'bg-[#0b0f19] border-white/10' : themeMode === 'theme-light' ? 'bg-slate-50 border-slate-200' : 'bg-[#eadeb5] border-[#d1bd8e]'">
                <div class="flex flex-col text-left">
                  <span class="text-[0.7rem] font-bold uppercase tracking-wider mb-1" :class="themeMode === 'theme-dark' ? 'text-slate-400' : themeMode === 'theme-light' ? 'text-slate-500' : 'text-[#8a7250]'">Copies Left</span>
                  <span class="text-[1.05rem] font-bold" :class="themeMode === 'theme-dark' ? 'text-white' : 'text-slate-900'">
                    {{ book?.copies_available || 0 }} <span class="font-normal" :class="themeMode === 'theme-dark' ? 'text-slate-500' : themeMode === 'theme-light' ? 'text-slate-400' : 'text-[#8a7250]'">/ {{ book?.copies_total || 0 }}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap justify-start gap-3 w-full">
              <button @click="openBorrowModal" :disabled="book?.copies_available <= 0" class="flex justify-center items-center gap-2 px-6 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer">
                <BookmarkPlus :size="16" /> Reserve Physical Copy
              </button>
            </div>
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
  PackageCheck, PackageX, Library, ZoomIn, ZoomOut, ChevronDown,
  ChevronUp, Minus, Plus 
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
const isThemeDropdownOpen = ref(false);
const isFullscreen = ref(false);
const isBorrowOpen = ref(false);
const mainAreaRef = ref(null);

// Continuous Multi-Page PDF State
const pdfDoc = shallowRef(null);
const currentPageNum = ref(1);
const totalPdfPages = ref(0);
const pdfScale = ref(1.25);
const pdfLoading = ref(false);
const pdfError = ref(null);
const canvasRefsMap = new Map();
const renderedPagesSet = ref(new Set());
const pdfScrollContainerRef = ref(null);

// Generate a unique session ID for this specific reading session
const sessionId = 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
const activeReadersCount = ref(1);
let heartbeatTimer = null;

const pdfUrlFormatted = computed(() => {
  if (!book.value?.pdf_url) return '';
  let url = book.value.pdf_url;
  
  // Convert Google Drive view links to preview links for iframe embedding
  if (url.includes('drive.google.com/file/d/')) {
    url = url.replace(/\/view.*$/, '/preview');
    return url;
  }
  
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
  
  // Google Drive links cannot be read by PDF.js due to CORS and HTML responses
  if (url.includes('drive.google.com')) {
    viewMode.value = 'raw';
    return;
  }

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
  if (!book.value?.id || !book.value?.pdf_url) return;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/${book.value.id}/read-ping`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ 
        session_id: sessionId,
        book_title: book.value.title 
      })
    });
    if (res.ok) {
      const data = await res.json();
      activeReadersCount.value = data.active_readers_count || 1;
    }
  } catch (err) {
    console.error('Reading heartbeat ping error:', err);
  }
}

async function sendReadingLeave() {
  if (!book.value?.id || !sessionId || !book.value?.pdf_url) return;
  try {
    const url = `${import.meta.env.VITE_API_URL || ''}/api/books/${book.value.id}/read-leave`;
    const data = JSON.stringify({ session_id: sessionId });
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
      keepalive: true
    });
  } catch (err) {
    console.error('Reading leave error:', err);
  }
}

const handleBeforeUnload = () => {
  sendReadingLeave();
};

const handleActiveReadersUpdate = (e) => {
  if (book.value?.id && String(book.value.id) === String(e.detail.book_id)) {
    activeReadersCount.value = e.detail.count;
  }
};

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('active_readers_updated', handleActiveReadersUpdate);
  try {
    const bookId = route.params.id;
    book.value = await booksStore.fetchBookById(bookId);
    if (book.value?.id) {
      if (book.value.pdf_url) {
        await sendReadingPing(true);
        heartbeatTimer = setInterval(() => sendReadingPing(false), 25000);
        initPdfReader(book.value.pdf_url);
      } else {
        // Not a digital read, reset count to 0 so it doesn't show "1 reading now"
        activeReadersCount.value = 0;
      }
    }
  } catch (err) {
    console.error('Failed to load book for reading:', err);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  window.removeEventListener('active_readers_updated', handleActiveReadersUpdate);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  sendReadingLeave();
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
/* Removed bubbly animations */
</style>
