const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Path to Google Service Account Credentials JSON (checks both .json and .json.json)
function getCredentialsPath() {
  const p1 = path.join(__dirname, 'google-credentials.json');
  const p2 = path.join(__dirname, 'google-credentials.json.json');
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return p1;
}

// Default sample data matching user's Google Sheet structure
const SAMPLE_STUDENTS = [
  { studentId: 'DUC2024-0060', room: 'GI78', khmerName: 'កើន ដាវ៉ាន់', latinName: 'KEUN DAVANN', gender: 'ស្រី', dob: '21/4/2003', phone: '0973028324' },
  { studentId: 'DUC2024-0072', room: 'K32', khmerName: 'គឹម កុសល', latinName: 'KEM KOSAL', gender: 'ប្រុស', dob: '08/5/2004', phone: '092734974' },
  { studentId: 'DUC2024-0198', room: 'J241', khmerName: 'ណុប សាវ៉ន', latinName: 'NOB SAVORN', gender: 'ស្រី', dob: '19/8/2005', phone: '096883789' },
  { studentId: 'DUC2024-0258', room: 'I241', khmerName: 'ថាង សំណាង', latinName: 'THEANG SAMNANG', gender: 'ស្រី', dob: '13/5/2005', phone: '096883789' }
];

// Helper to parse CSV line respecting quotes
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// Convert standard Google Drive viewing links to direct image rendering links
function formatDriveImageUrl(url, fallbackName = '') {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallbackName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random` : '';
  }
  const strUrl = url.trim();
  if (strUrl.includes('drive.google.com')) {
    const fileIdMatch = strUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    }
    const openIdMatch = strUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (openIdMatch && openIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${openIdMatch[1]}`;
    }
  }
  return strUrl;
}

/**
 * Fetch CSV directly from link-shared Google Sheet (no credentials required)
 */
async function fetchPublicSheetCsv(spreadsheetId) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
    console.log(`[GoogleSheets] Attempting public CSV fetch from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[GoogleSheets] Public CSV fetch failed with HTTP status ${response.status}`);
      return null;
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(l => l.trim());

    const students = [];
    for (let i = 0; i < lines.length; i++) {
      const col = parseCSVLine(lines[i]);
      // Search for Student ID column (usually col 1 or 0 matching DUC or numeric ID)
      const studentId = (col[1] || col[0] || '').trim();
      
      if (studentId && (studentId.toUpperCase().startsWith('DUC') || /^\d+$/.test(studentId) || studentId.length >= 4)) {
        // Skip header row if it literally says "អត្តលេខ" or "Student ID"
        if (studentId.includes('អត្តលេខ') || studentId.toLowerCase().includes('student')) continue;

        const latinName = (col[4] || col[3] || studentId).trim();

        students.push({
          studentId,
          dormRoom: (col[2] || '').trim(),
          khmerName: (col[3] || '').trim(),
          latinName: latinName,
          gender: (col[5] || '').trim(),
          dateOfBirth: (col[6] || '').trim(),
          profilePhoto: formatDriveImageUrl(col[7], latinName),
          highSchool: (col[8] || '').trim(),
          province: (col[9] || '').trim(),
          examYear: (col[10] || '').trim(),
          grade: (col[11] || '').trim(),
          major: (col[12] || '').trim(),
          degreeLevel: (col[13] || '').trim(),
          classCode: (col[14] || '').trim(),
          academicStatus: (col[15] || '').trim(),
          generation: (col[16] || '').trim(),
          academicYear: (col[17] || '').trim(),
          phone: (col[18] || col[16] || '').trim(),
          telegram: (col[19] || '').trim(),
          guardianPhone: (col[20] || '').trim()
        });
      }
    }

    console.log(`[GoogleSheets] Successfully parsed ${students.length} student rows via CSV export.`);
    return students.length > 0 ? students : null;
  } catch (err) {
    console.error('[GoogleSheets] CSV fetch error:', err.message);
    return null;
  }
}

function getServiceAccountEmail() {
  const credPath = getCredentialsPath();
  if (!fs.existsSync(credPath)) return null;
  try {
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    return creds.client_email || null;
  } catch (err) {
    return null;
  }
}

async function getGoogleSheetsClient() {
  const credPath = getCredentialsPath();
  if (!fs.existsSync(credPath)) {
    return null;
  }
  try {
    const email = getServiceAccountEmail();
    if (email) {
      console.log(`[GoogleSheets] Using Service Account Email: ${email}`);
    }
    const auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  } catch (err) {
    console.error('[GoogleSheets] Failed to initialize Google Auth:', err.message);
    return null;
  }
}

/**
 * Fetch rows using Service Account API v4 if available
 */
async function fetchViaServiceAccount(spreadsheetId, range = 'A:Z') {
  const credPath = getCredentialsPath();
  if (!fs.existsSync(credPath)) return null;
  const sheets = await getGoogleSheetsClient();
  if (!sheets) return null;
  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = response.data.values;
    if (!rows || rows.length === 0) return null;

    return rows.map((row) => {
      const studentId = row[1] ? row[1].trim() : '';
      const latinName = (row[4] || row[3] || studentId).trim();
      return {
        studentId,
        dormRoom: (row[2] || '').trim(),
        khmerName: (row[3] || '').trim(),
        latinName: latinName,
        gender: (row[5] || '').trim(),
        dateOfBirth: (row[6] || '').trim(),
        profilePhoto: formatDriveImageUrl(row[7], latinName),
        highSchool: (row[8] || '').trim(),
        province: (row[9] || '').trim(),
        examYear: (row[10] || '').trim(),
        grade: (row[11] || '').trim(),
        major: (row[12] || '').trim(),
        degreeLevel: (row[13] || '').trim(),
        classCode: (row[14] || '').trim(),
        academicStatus: (row[15] || '').trim(),
        generation: (row[16] || '').trim(),
        academicYear: (row[17] || '').trim(),
        phone: (row[18] || row[16] || '').trim(),
        telegram: (row[19] || '').trim(),
        guardianPhone: (row[20] || '').trim()
      };
    }).filter(s => {
      if (!s.studentId) return false;
      const id = s.studentId.toLowerCase();
      if (id.includes('ព័ត៌មាន') || id.includes('អត្ថលេខ') || id.includes('student') || id.includes('អត្តលេខ')) return false;
      return true;
    });
  } catch (err) {
    console.error('[GoogleSheets] Service Account fetch error:', err.message);
    return null;
  }
}

/**
 * Fetch all students (Tries 1. Public CSV, 2. Service Account, 3. Sample Fallback)
 */
async function fetchStudentsFromSheet(spreadsheetId) {
  if (spreadsheetId) {
    // 1. Try fetching directly via public Google Sheet CSV URL
    const csvStudents = await fetchPublicSheetCsv(spreadsheetId);
    if (csvStudents && csvStudents.length > 0) {
      return csvStudents;
    }

    // 2. Try fetching via Service Account credentials
    const saStudents = await fetchViaServiceAccount(spreadsheetId);
    if (saStudents && saStudents.length > 0) {
      return saStudents;
    }
  }

  // 3. Fallback to sample data
  console.log('[GoogleSheets] Falling back to sample student data.');
  return SAMPLE_STUDENTS;
}

/**
 * Fetch and parse multi-column Category book blocks from Google Sheet
 */
async function fetchBooksFromSheet(spreadsheetId) {
  const sheets = await getGoogleSheetsClient();
  let rows = [];

  if (sheets) {
    try {
      const response = await sheets.spreadsheets.values.get({ 
        spreadsheetId, 
        range: 'A1:ZZ1000' 
      });
      rows = response.data.values || [];
    } catch (err) {
      console.error('[GoogleSheets] Service account fetch books error:', err.message);
    }
  }

  // Fallback to CSV if service account fails or not present
  if (rows.length === 0) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
      const response = await fetch(url);
      if (response.ok) {
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(l => l.trim());
        rows = lines.map(parseCSVLine);
      }
    } catch (err) {
      console.error('[GoogleSheets] CSV fetch books error:', err.message);
    }
  }

  if (rows.length < 3) {
    console.warn('[GoogleSheets] Not enough rows found in book sheet.');
    return [];
  }

  const categoryBlocks = [];
  const maxCols = Math.max(...rows.map(r => r.length));

  // Find column indexes where Category headers are defined in Row 0 or Row 1
  const categoryHeaderCols = [];
  for (let c = 0; c < maxCols; c++) {
    const val0 = (rows[0] && rows[0][c]) ? rows[0][c].trim() : '';
    const val1 = (rows[1] && rows[1][c]) ? rows[1][c].trim() : '';
    const text = (val0 || val1);

    if (text && !text.includes('Code') && !text.includes('ល.រ') && !text.includes('ចំនួន') && text.length > 2) {
      // Avoid duplicate adjacent column headers for the same merged cell
      const lastHeader = categoryHeaderCols[categoryHeaderCols.length - 1];
      if (!lastHeader || (c - lastHeader.col >= 3) || lastHeader.name !== text) {
        categoryHeaderCols.push({ col: c, name: text });
      }
    }
  }

  // Parse books for each detected category column group
  for (let i = 0; i < categoryHeaderCols.length; i++) {
    const group = categoryHeaderCols[i];
    const catCol = group.col;
    const catName = group.name;

    // Identify title & stock sub-columns around catCol
    let titleCol = catCol;
    let stockCol = catCol + 1;

    // Check Row 2 (headers row like "ល.រ", "ឈ្មោះ", "ចំនួន")
    if (rows[2]) {
      for (let sub = catCol; sub < catCol + 4 && sub < maxCols; sub++) {
        const subHeader = (rows[2][sub] || '').trim();
        if (subHeader.includes('ឈ្មោះ') || subHeader.toLowerCase().includes('name') || subHeader.toLowerCase().includes('title')) {
          titleCol = sub;
        } else if (subHeader.includes('ចំនួន') || subHeader.toLowerCase().includes('stock') || subHeader.toLowerCase().includes('qty')) {
          stockCol = sub;
        }
      }
    }

    if (titleCol === stockCol) stockCol = titleCol + 1;

    const books = [];
    // Scan data rows from Row 3 onwards
    for (let r = 3; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;

      const bookTitle = (row[titleCol] || '').trim();
      const stockVal = (row[stockCol] || '').trim();

      if (bookTitle && bookTitle !== 'ឈ្មោះ' && bookTitle !== 'Name' && !bookTitle.includes('ល.រ')) {
        const stock = parseInt(stockVal, 10) || 1;
        books.push({
          title: bookTitle,
          copies: stock
        });
      }
    }

    if (books.length > 0) {
      categoryBlocks.push({
        categoryName: catName,
        books
      });
    }
  }

  return categoryBlocks;
}

module.exports = {
  fetchStudentsFromSheet,
  fetchBooksFromSheet,
  getServiceAccountEmail,
  SAMPLE_STUDENTS
};
