<template>
  <div v-if="isOpen" class="fixed inset-0 bg-[#0f172a]/75 backdrop-blur-[8px] z-[9999] flex justify-center items-start px-4 py-8 overflow-y-auto" @click.self="close">
    <div class="w-full max-w-[900px] bg-white text-slate-800 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] overflow-hidden">
      <!-- Toolbar Header (Screen Only) -->
      <header class="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
        <div class="flex items-center gap-2 font-bold text-slate-900">
          <FileText :size="20" class="text-indigo-600" />
          <span>Official Cambodian Library Activity Report Preview</span>
        </div>
        <div class="flex gap-3">
          <button @click="printReport" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-4 py-2 text-sm">
            <Printer :size="16" /> Print / Save as PDF
          </button>
          <button @click="close" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm">
            <X :size="18" /> Close
          </button>
        </div>
      </header>

      <!-- Official Printable Document Canvas -->
      <div class="bg-white px-[3.5rem] py-[3rem] font-sans text-slate-900 leading-[1.6]" id="printable-report">
        <!-- 1. Official Kingdom Header -->
        <div class="relative min-h-[180px] mb-8 pb-[1.2rem]">
          <!-- Left: Crest Logo & University Names -->
          <div class="absolute left-0 top-0 flex flex-col items-center text-center">
            <img src="/duc-logo.png" alt="DUC Crest Logo" class="h-[105px] w-auto object-contain mb-2 block" />
            <div class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[1rem] font-normal text-slate-900 leading-[1.6]">សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</div>
            <div class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[0.95rem] font-normal text-slate-900 mt-[0.2rem]">បណ្ណាល័យសិក្សា</div>
          </div>

          <!-- Center: Kingdom Motto -->
          <div class="absolute left-1/2 -translate-x-1/2 top-0 text-center w-max">
            <h1 class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[1.35rem] font-normal text-slate-900 mb-[0.4rem] leading-[1.5]">ព្រះរាជាណាចក្រកម្ពុជា</h1>
            <h2 class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[1.15rem] font-normal text-slate-900 mb-[0.6rem] leading-[1.5]">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
            <div class="flex justify-center items-center mt-[0.3rem]">
              <img src="/khmer-ornament.png" alt="Cambodian Flourish Divider" class="h-[28px] w-auto max-w-[240px] object-contain" />
            </div>
          </div>
        </div>

        <!-- 2. Official Document Title -->
        <div class="text-center my-6 mb-8">
          <h2 class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[1.75rem] font-normal text-slate-900 tracking-[1px] leading-[1.6]">របាយការណ៍</h2>
          <p class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[0.95rem] font-normal text-slate-900 mt-2 leading-[1.6]">
            ស្តីពីលទ្ធផលនិស្សិតប្រចាំ {{ periodKhmer }} ឆ្នាំ២០២៦
          </p>
        </div>

        <!-- 3. Section I: Student Reading Gender Summary Table -->
        <div class="mb-8">
          <h3 class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[0.98rem] font-normal text-slate-900 mb-3 leading-[1.6]">I. លទ្ធផលនិស្សិតចូលអានសៀវភៅសរុបប្រចាំ {{ periodKhmer }}</h3>
          <table class="w-full border-collapse text-[0.9rem]">
            <thead>
              <tr class="bg-[#b4c6e7] text-slate-900 font-extrabold text-center">
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="70">ល.រ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="220">ភេទ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="180">ចំនួន</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]">ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr class="even:bg-slate-50">
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">1</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">ប្រុស</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ toKhmerNum(reportData?.gender_summary?.male ?? (reportData?.top_readers?.length || 0)) }} នាក់</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem]"></td>
              </tr>
              <tr class="even:bg-slate-50">
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">2</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">ស្រី</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ toKhmerNum(reportData?.gender_summary?.female ?? 0) }} នាក់</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem]"></td>
              </tr>
              <tr>
                <td colspan="2" class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center font-extrabold text-[#1e1b4b] bg-[#b4c6e7]">សរុប</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center font-extrabold text-[#1e1b4b] bg-[#b4c6e7]">{{ toKhmerNum(reportData?.gender_summary?.total ?? (reportData?.top_readers?.length || 0)) }} នាក់</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] bg-[#b4c6e7]"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. Section II: Student Reading Activity List Table -->
        <div class="mb-8">
          <h3 class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[0.98rem] font-normal text-slate-900 mb-3 leading-[1.6]">II. លទ្ធផលនិស្សិតចូលអានសៀវភៅប្រចាំ {{ periodKhmer }}</h3>
          <table class="w-full border-collapse text-[0.9rem]">
            <thead>
              <tr class="bg-[#b4c6e7] text-slate-900 font-extrabold text-center">
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="60">ល.រ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="200">ឈ្មោះ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="80">ភេទ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="240">ជំនាញសិក្សា</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]">ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr class="even:bg-slate-50" v-if="!reportData?.top_readers || reportData.top_readers.length === 0">
                <td colspan="5" class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center text-slate-500">គ្មានទិន្នន័យសកម្មភាពសិស្សក្នុងអំឡុងពេលនេះឡើយ</td>
              </tr>
              <tr class="even:bg-slate-50" v-else v-for="(r, idx) in reportData.top_readers" :key="r.id">
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ idx + 1 }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] font-bold text-center">{{ r.name_khmer || r.name }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ r.gender || 'ស្រី' }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ r.major || 'ព័ត៌មានវិទ្យា' }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem]"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. Section III: Borrow & Return Book Summary Table -->
        <div class="mb-8">
          <h3 class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[0.98rem] font-normal text-slate-900 mb-3 leading-[1.6]">III. លទ្ធផលនិស្សិតខ្ចី និងសងសៀវភៅសរុបប្រចាំ {{ periodKhmer }}</h3>
          <table class="w-full border-collapse text-[0.9rem]">
            <thead>
              <tr class="bg-[#b4c6e7] text-slate-900 font-extrabold text-center">
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="70">ល.រ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="220">ទិន្នន័យសៀវភៅ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="180">ចំនួនសៀវភៅ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]">ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr class="even:bg-slate-50">
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">1</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">ខ្ចី</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ toKhmerNum(reportData?.borrowings_summary?.total_borrowed || 0) }} ក្បាល</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem]"></td>
              </tr>
              <tr class="even:bg-slate-50">
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">2</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">សង</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ toKhmerNum(reportData?.borrowings_summary?.total_returned || 0) }} ក្បាល</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem]"></td>
              </tr>
              <tr>
                <td colspan="2" class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center font-extrabold text-[#1e1b4b] bg-red-300">សរុបមិនទាន់សង</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center font-extrabold text-[#1e1b4b] bg-red-300">{{ toKhmerNum(reportData?.borrowings_summary?.pending_return || 0) }} ក្បាល</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] bg-red-300"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. Section IV: Detailed Student Borrow & Return Breakdown Table -->
        <div class="mb-8">
          <h3 class="font-['Moul','Moulpali','Khmer_OS_Muol_Light','Khmer_OS_Muol',serif] text-[0.98rem] font-normal text-slate-900 mb-3 leading-[1.6]">IV. លទ្ធផលនិស្សិតខ្ចី និងសងសៀវភៅប្រចាំ {{ periodKhmer }}</h3>
          <table class="w-full border-collapse text-[0.9rem]">
            <thead>
              <tr class="bg-[#b4c6e7] text-slate-900 font-extrabold text-center">
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="50">ល.រ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="170">ឈ្មោះ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="70">ភេទ</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="190">ជំនាញសិក្សា</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="100">ចំនួនខ្ចី</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]" width="100">ចំនួនសង</th>
                <th class="border border-slate-400 px-[0.85rem] py-[0.6rem]">ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr class="even:bg-slate-50" v-if="!reportData?.student_borrow_return_list || reportData.student_borrow_return_list.length === 0">
                <td colspan="7" class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center text-slate-500">គ្មានទិន្នន័យខ្ចី/សងសៀវភៅក្នុងអំឡុងពេលនេះឡើយ</td>
              </tr>
              <tr class="even:bg-slate-50" v-else v-for="(st, idx) in reportData.student_borrow_return_list" :key="st.id">
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ idx + 1 }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] font-bold text-center">{{ st.name_khmer || st.name }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ st.gender || 'ស្រី' }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center">{{ st.major || 'ព័ត៌មានវិទ្យា' }}</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center font-bold">{{ toKhmerNum(st.total_borrowed) }} ក្បាល</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem] text-center font-bold text-emerald-600">{{ toKhmerNum(st.total_returned) }} ក្បាល</td>
                <td class="border border-slate-400 px-[0.85rem] py-[0.6rem]"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. Official Footer & Signatures Block -->
        <div class="mt-12 break-inside-avoid">
          <div class="text-right text-[0.95rem] font-bold text-slate-700 mb-6">
            រាជធានីភ្នំពេញ, ថ្ងៃទី{{ toKhmerNum(currentDay) }} ខែ{{ currentMonthKhmer }} ឆ្នាំ២០២៦
          </div>

          <div class="flex justify-between">
            <div class="w-[45%] text-center">
              <div class="text-[1rem] font-extrabold text-[#1e1b4b]">បានឃើញ និង ត្រួតពិនិត្យ</div>
              <div class="text-[0.85rem] text-slate-500">ប្រធានបណ្ណាល័យ DUC Library</div>
              <div class="h-[90px] flex items-center justify-center">
                <span class="inline-block px-4 py-1.5 border-2 border-dashed border-slate-400 text-slate-400 text-[0.78rem] rounded-full -rotate-12">ត្រាផ្លូវការ</span>
              </div>
              <div class="text-[1.05rem] font-extrabold text-[#1e1b4b] border-t border-slate-300 pt-1 inline-block min-w-[160px]">សេង មករា</div>
            </div>

            <div class="w-[45%] text-center">
              <div class="text-[1rem] font-extrabold text-[#1e1b4b]">អ្នកធ្វើរបាយការណ៍</div>
              <div class="text-[0.85rem] text-slate-500">មន្ត្រីគ្រប់គ្រងបណ្ណាល័យ</div>
              <div class="h-[90px] flex items-center justify-center">
                <span class="font-['Brush_Script_MT',cursive,sans-serif] text-[1.3rem] text-blue-500 font-bold">បានចុះហត្ថលេខាឌីជីថល</span>
              </div>
              <div class="text-[1.05rem] font-extrabold text-[#1e1b4b] border-t border-slate-300 pt-1 inline-block min-w-[160px]">មិន មុនីនាថ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue';
import { Printer, X, FileText } from 'lucide-vue-next';
import { useModalScrollLock } from '../composables/useModalScrollLock';

const props = defineProps({
  isOpen: Boolean,
  period: String,
  reportData: Object
});

useModalScrollLock(toRef(props, 'isOpen'));

const emit = defineEmits(['close']);

function close() {
  emit('close');
}

function printReport() {
  window.print();
}

function toKhmerNum(num) {
  if (num === null || num === undefined) return '០';
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().replace(/\d/g, d => khmerDigits[d]);
}

const periodKhmer = computed(() => {
  return `ខែ${currentMonthKhmer}`;
});

const now = new Date();
const currentDay = now.getDate();

const khmerMonths = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];
const currentMonthKhmer = khmerMonths[now.getMonth()];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Moul&family=Moulpali&family=Kantumruy+Pro:ital,wght@0,300..700;1,300..700&display=swap');

/* Print Specific Rules */
@media print {
  body * {
    visibility: hidden;
  }
  .report-modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    background: transparent;
    padding: 0;
    display: block;
  }
  .report-modal-container {
    box-shadow: none;
    max-width: 100%;
    border-radius: 0;
  }
  .no-print {
    display: none !important;
  }
  #printable-report, #printable-report * {
    visibility: visible;
  }
  #printable-report {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 2cm 1.5cm;
  }
}
</style>
