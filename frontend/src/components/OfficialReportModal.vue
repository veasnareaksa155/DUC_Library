<template>
  <div v-if="isOpen" class="report-modal-backdrop" @click.self="close">
    <div class="report-modal-container glass-panel">
      <!-- Toolbar Header (Screen Only) -->
      <header class="report-toolbar no-print">
        <div class="toolbar-title">
          <FileText :size="20" class="text-indigo" />
          <span>Official Cambodian Library Activity Report Preview</span>
        </div>
        <div class="toolbar-actions">
          <button @click="printReport" class="btn btn-primary btn-sm">
            <Printer :size="16" /> Print / Save as PDF
          </button>
          <button @click="close" class="btn btn-secondary btn-sm">
            <X :size="18" /> Close
          </button>
        </div>
      </header>

      <!-- Official Printable Document Canvas -->
      <div class="official-paper-canvas" id="printable-report">
        <!-- 1. Official Kingdom Header -->
        <div class="kingdom-header-grid">
          <!-- Left: Crest Logo & University Names -->
          <div class="header-left-block">
            <img src="/duc-logo.png" alt="DUC Crest Logo" class="duc-official-crest-logo" />
            <div class="duc-title-khmer">សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</div>
            <div class="duc-sub-khmer">បណ្ណាល័យសិក្សា</div>
          </div>

          <!-- Center: Kingdom Motto -->
          <div class="header-center-kingdom-block">
            <h1 class="kingdom-title">ព្រះរាជាណាចក្រកម្ពុជា</h1>
            <h2 class="kingdom-motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
            <div class="kingdom-ornament-wrap">
              <img src="/khmer-ornament.png" alt="Cambodian Flourish Divider" class="khmer-flourish-img" />
            </div>
          </div>
        </div>

        <!-- 2. Official Document Title -->
        <div class="report-main-title">
          <h2 class="report-heading">របាយការណ៍</h2>
          <p class="report-subheading">
            ស្តីពីលទ្ធផលនិស្សិតប្រចាំ {{ periodKhmer }} ឆ្នាំ២០២៦
          </p>
        </div>

        <!-- 3. Section I: Student Reading Gender Summary Table -->
        <div class="report-section">
          <h3 class="section-title-khmer">I. លទ្ធផលនិស្សិតចូលអានសៀវភៅសរុបប្រចាំ {{ periodKhmer }}</h3>
          <table class="khmer-official-table">
            <thead>
              <tr class="header-blue-row">
                <th width="70">ល.រ</th>
                <th width="220">ភេទ</th>
                <th width="180">ចំនួន</th>
                <th>ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td class="text-center">ប្រុស</td>
                <td class="text-center">{{ toKhmerNum(reportData?.gender_summary?.male ?? (reportData?.top_readers?.length || 0)) }} នាក់</td>
                <td></td>
              </tr>
              <tr>
                <td class="text-center">2</td>
                <td class="text-center">ស្រី</td>
                <td class="text-center">{{ toKhmerNum(reportData?.gender_summary?.female ?? 0) }} នាក់</td>
                <td></td>
              </tr>
              <tr class="summary-blue-footer">
                <td colspan="2" class="text-center bold-val">សរុប</td>
                <td class="text-center bold-val">{{ toKhmerNum(reportData?.gender_summary?.total ?? (reportData?.top_readers?.length || 0)) }} នាក់</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. Section II: Student Reading Activity List Table -->
        <div class="report-section">
          <h3 class="section-title-khmer">II. លទ្ធផលនិស្សិតចូលអានសៀវភៅប្រចាំ {{ periodKhmer }}</h3>
          <table class="khmer-official-table">
            <thead>
              <tr class="header-blue-row">
                <th width="60">ល.រ</th>
                <th width="200">ឈ្មោះ</th>
                <th width="80">ភេទ</th>
                <th width="240">ជំនាញសិក្សា</th>
                <th>ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!reportData?.top_readers || reportData.top_readers.length === 0">
                <td colspan="5" class="text-center text-muted">គ្មានទិន្នន័យសកម្មភាពសិស្សក្នុងអំឡុងពេលនេះឡើយ</td>
              </tr>
              <tr v-else v-for="(r, idx) in reportData.top_readers" :key="r.id">
                <td class="text-center">{{ idx + 1 }}</td>
                <td class="font-bold text-center">{{ r.name_khmer || r.name }}</td>
                <td class="text-center">{{ r.gender || 'ស្រី' }}</td>
                <td class="text-center">{{ r.major || 'ព័ត៌មានវិទ្យា' }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. Section III: Borrow & Return Book Summary Table -->
        <div class="report-section">
          <h3 class="section-title-khmer">III. លទ្ធផលនិស្សិតខ្ចី និងសងសៀវភៅសរុបប្រចាំ {{ periodKhmer }}</h3>
          <table class="khmer-official-table">
            <thead>
              <tr class="header-blue-row">
                <th width="70">ល.រ</th>
                <th width="220">ទិន្នន័យសៀវភៅ</th>
                <th width="180">ចំនួនសៀវភៅ</th>
                <th>ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td class="text-center">ខ្ចី</td>
                <td class="text-center">{{ toKhmerNum(reportData?.borrowings_summary?.total_borrowed || 0) }} ក្បាល</td>
                <td></td>
              </tr>
              <tr>
                <td class="text-center">2</td>
                <td class="text-center">សង</td>
                <td class="text-center">{{ toKhmerNum(reportData?.borrowings_summary?.total_returned || 0) }} ក្បាល</td>
                <td></td>
              </tr>
              <tr class="summary-red-footer">
                <td colspan="2" class="text-center bold-val">សរុបមិនទាន់សង</td>
                <td class="text-center bold-val">{{ toKhmerNum(reportData?.borrowings_summary?.pending_return || 0) }} ក្បាល</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. Section IV: Detailed Student Borrow & Return Breakdown Table -->
        <div class="report-section">
          <h3 class="section-title-khmer">IV. លទ្ធផលនិស្សិតខ្ចី និងសងសៀវភៅប្រចាំ {{ periodKhmer }}</h3>
          <table class="khmer-official-table">
            <thead>
              <tr class="header-blue-row">
                <th width="50">ល.រ</th>
                <th width="170">ឈ្មោះ</th>
                <th width="70">ភេទ</th>
                <th width="190">ជំនាញសិក្សា</th>
                <th width="100">ចំនួនខ្ចី</th>
                <th width="100">ចំនួនសង</th>
                <th>ផ្សេងៗ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!reportData?.student_borrow_return_list || reportData.student_borrow_return_list.length === 0">
                <td colspan="7" class="text-center text-muted">គ្មានទិន្នន័យខ្ចី/សងសៀវភៅក្នុងអំឡុងពេលនេះឡើយ</td>
              </tr>
              <tr v-else v-for="(st, idx) in reportData.student_borrow_return_list" :key="st.id">
                <td class="text-center">{{ idx + 1 }}</td>
                <td class="font-bold text-center">{{ st.name_khmer || st.name }}</td>
                <td class="text-center">{{ st.gender || 'ស្រី' }}</td>
                <td class="text-center">{{ st.major || 'ព័ត៌មានវិទ្យា' }}</td>
                <td class="text-center font-bold">{{ toKhmerNum(st.total_borrowed) }} ក្បាល</td>
                <td class="text-center font-bold text-emerald">{{ toKhmerNum(st.total_returned) }} ក្បាល</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. Official Footer & Signatures Block -->
        <div class="report-signature-block">
          <div class="signature-top-date">
            រាជធានីភ្នំពេញ, ថ្ងៃទី{{ toKhmerNum(currentDay) }} ខែ{{ currentMonthKhmer }} ឆ្នាំ២០២៦
          </div>

          <div class="signature-roles-grid">
            <div class="sig-col left-sig">
              <div class="sig-role-title">បានឃើញ និង ត្រួតពិនិត្យ</div>
              <div class="sig-role-sub">ប្រធានបណ្ណាល័យ DUC Library</div>
              <div class="sig-space">
                <span class="official-stamp-box">ត្រាផ្លូវការ</span>
              </div>
              <div class="sig-name">សេង មករា</div>
            </div>

            <div class="sig-col right-sig">
              <div class="sig-role-title">អ្នកធ្វើរបាយការណ៍</div>
              <div class="sig-role-sub">មន្ត្រីគ្រប់គ្រងបណ្ណាល័យ</div>
              <div class="sig-space">
                <span class="digital-sig-text">បានចុះហត្ថលេខាឌីជីថល</span>
              </div>
              <div class="sig-name">មិន មុនីនាថ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Printer, X, FileText } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  period: String,
  reportData: Object
});

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

.report-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.report-modal-container {
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  color: #1e293b;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.report-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #0f172a;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

/* Official Printable Paper Canvas */
.official-paper-canvas {
  background: #ffffff;
  padding: 3rem 3.5rem;
  font-family: 'Kantumruy Pro', 'Khmer OS Battambang', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #0f172a;
  line-height: 1.6;
}

/* Kingdom Header Grid */
.kingdom-header-grid {
  position: relative;
  min-height: 180px;
  margin-bottom: 2rem;
  padding-bottom: 1.2rem;
}

.header-left-block {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.duc-official-crest-logo {
  height: 105px;
  width: auto;
  object-fit: contain;
  margin-bottom: 0.5rem;
  display: block;
}

.duc-title-khmer {
  font-family: 'Moul', 'Moulpali', 'Khmer OS Muol Light', 'Khmer OS Muol', serif !important;
  font-size: 1rem;
  font-weight: 400 !important;
  color: #0f172a;
  line-height: 1.6;
}

.duc-sub-khmer {
  font-family: 'Moul', 'Moulpali', 'Khmer OS Muol Light', 'Khmer OS Muol', serif !important;
  font-size: 0.95rem;
  font-weight: 400 !important;
  color: #0f172a;
  margin-top: 0.2rem;
}

.header-center-kingdom-block {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  text-align: center;
  width: max-content;
}

.kingdom-title {
  font-family: 'Moul', 'Moulpali', 'Khmer OS Muol Light', 'Khmer OS Muol', serif !important;
  font-size: 1.35rem;
  font-weight: 400 !important;
  color: #0f172a;
  margin-bottom: 0.4rem;
  line-height: 1.5;
}

.kingdom-motto {
  font-family: 'Moul', 'Moulpali', 'Khmer OS Muol Light', 'Khmer OS Muol', serif !important;
  font-size: 1.15rem;
  font-weight: 400 !important;
  color: #0f172a;
  margin-bottom: 0.6rem;
  line-height: 1.5;
}

.kingdom-ornament-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.3rem;
}

.khmer-flourish-img {
  height: 28px;
  width: auto;
  max-width: 240px;
  object-fit: contain;
}

/* Report Main Title */
.report-main-title {
  text-align: center;
  margin: 1.5rem 0 2rem 0;
}

.report-heading {
  font-family: 'Moul', 'Moulpali', 'Khmer OS Muol Light', 'Khmer OS Muol', serif !important;
  font-size: 1.75rem;
  font-weight: 400 !important;
  color: #0f172a;
  letter-spacing: 1px;
  line-height: 1.6;
}

.report-subheading {
  font-family: 'Moul', 'Moulpali', 'Khmer OS Muol Light', 'Khmer OS Muol', serif !important;
  font-size: 0.95rem;
  font-weight: 400 !important;
  color: #0f172a;
  margin-top: 0.5rem;
  line-height: 1.6;
}

/* Section & Tables */
.report-section {
  margin-bottom: 2rem;
}

.section-title-khmer {
  font-family: 'Moul', 'Moulpali', 'Khmer OS Muol Light', 'Khmer OS Muol', serif !important;
  font-size: 0.98rem;
  font-weight: 400 !important;
  color: #0f172a;
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.khmer-official-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.khmer-official-table th,
.khmer-official-table td {
  border: 1px solid #94a3b8;
  padding: 0.6rem 0.85rem;
}

.khmer-official-table th {
  background: #b4c6e7;
  color: #0f172a;
  font-weight: 800;
  text-align: center;
}

.summary-blue-footer td {
  background: #b4c6e7;
  font-weight: 800;
  color: #0f172a;
}

.summary-red-footer td {
  background: #fca5a5;
  font-weight: 800;
  color: #0f172a;
}

.khmer-official-table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.bold-val {
  font-weight: 800;
  color: #1e1b4b;
}

/* Signatures */
.report-signature-block {
  margin-top: 3rem;
  page-break-inside: avoid;
}

.signature-top-date {
  text-align: right;
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 1.5rem;
}

.signature-roles-grid {
  display: flex;
  justify-content: space-between;
}

.sig-col {
  width: 45%;
  text-align: center;
}

.sig-role-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1e1b4b;
}

.sig-role-sub {
  font-size: 0.85rem;
  color: #64748b;
}

.sig-space {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.official-stamp-box {
  display: inline-block;
  padding: 0.4rem 1rem;
  border: 2px dashed #94a3b8;
  color: #94a3b8;
  font-size: 0.78rem;
  border-radius: 50%;
  transform: rotate(-12deg);
}

.digital-sig-text {
  font-family: 'Brush Script MT', cursive, sans-serif;
  font-size: 1.3rem;
  color: #3b82f6;
  font-weight: 700;
}

.sig-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e1b4b;
  border-top: 1px solid #cbd5e1;
  padding-top: 0.3rem;
  display: inline-block;
  min-width: 160px;
}

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
