const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { get, run, all } = require('./db');

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

        students.push({
          studentId,
          dormRoom: (col[2] || '').trim(),
          khmerName: (col[3] || '').trim(),
          latinName: (col[4] || col[3] || studentId).trim(),
          gender: (col[5] || '').trim(),
          dateOfBirth: (col[6] || '').trim(),
          profilePhoto: (col[7] || '').trim(),
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
      return {
        studentId,
        dormRoom: (row[2] || '').trim(),
        khmerName: (row[3] || '').trim(),
        latinName: (row[4] || row[3] || studentId).trim(),
        gender: (row[5] || '').trim(),
        dateOfBirth: (row[6] || '').trim(),
        profilePhoto: (row[7] || '').trim(),
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
 * Sync Google Sheet student records into SQLite database users table
 */
async function syncStudentsToDb(spreadsheetId) {
  const students = await fetchStudentsFromSheet(spreadsheetId);
  let count = 0;
  let updated = 0;

  for (const st of students) {
    if (!st.studentId) continue;

    // Unique email per Student ID (e.g. duc2024-0060@duc.com)
    const cleanId = st.studentId.toLowerCase().trim();
    const email = `${cleanId}@duc.com`;
    const name = st.latinName || st.khmerName || st.studentId;

    // Check unique email match only
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (!existing) {
      // Default password is set to Student ID (e.g. DUC2024-0060)
      const hashedPassword = await bcrypt.hash(st.studentId, 10);
      await run(
        `INSERT INTO users (
          name, email, password, role, student_id, dorm_room, name_khmer, name_latin, gender,
          date_of_birth, profile_photo, high_school, province, exam_year, grade, major,
          degree_level, class_code, academic_status, generation, academic_year, phone, telegram, guardian_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, email, hashedPassword, 'user', st.studentId, st.dormRoom, st.khmerName, st.latinName, st.gender,
          st.dateOfBirth, st.profilePhoto, st.highSchool, st.province, st.examYear, st.grade, st.major,
          st.degreeLevel, st.classCode, st.academicStatus, st.generation, st.academicYear, st.phone, st.telegram, st.guardianPhone
        ]
      );
      count++;
    } else {
      await run(
        `UPDATE users SET 
          student_id = ?, dorm_room = ?, name_khmer = ?, name_latin = ?, gender = ?,
          date_of_birth = ?, profile_photo = ?, high_school = ?, province = ?, exam_year = ?, grade = ?, major = ?,
          degree_level = ?, class_code = ?, academic_status = ?, generation = ?, academic_year = ?, phone = ?, telegram = ?, guardian_phone = ?
        WHERE email = ?`,
        [
          st.studentId, st.dormRoom, st.khmerName, st.latinName, st.gender,
          st.dateOfBirth, st.profilePhoto, st.highSchool, st.province, st.examYear, st.grade, st.major,
          st.degreeLevel, st.classCode, st.academicStatus, st.generation, st.academicYear, st.phone, st.telegram, st.guardianPhone,
          email
        ]
      );
      updated++;
    }
  }

  console.log(`[GoogleSheets] Synced ${count} new student accounts, ${updated} existing into database. Total: ${students.length}`);
  return { total: students.length, newlyAdded: count, existing: updated, students };
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

/**
 * Sync parsed Google Sheet category books into SQLite database
 */
async function syncBooksToDb(spreadsheetId) {
  const categoryBlocks = await fetchBooksFromSheet(spreadsheetId);
  let totalNewBooks = 0;
  let totalUpdatedBooks = 0;
  let totalCategories = 0;

  const defaultCovers = {
    'IT': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    'Leadership': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    'Culture': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    'General': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'
  };

  for (const block of categoryBlocks) {
    const catName = block.categoryName;
    
    // Check or insert category
    let cat = await get('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [catName]);
    let catId;

    if (!cat) {
      const result = await run('INSERT INTO categories (name, description) VALUES (?, ?)', [
        catName,
        `Library books under ${catName}`
      ]);
      catId = result.id;
      totalCategories++;
    } else {
      catId = cat.id;
    }

    // Assign cover based on category keywords
    let coverUrl = defaultCovers.General;
    if (catName.toUpperCase().includes('IT') || catName.toLowerCase().includes('information') || catName.includes('វិទ្យា')) {
      coverUrl = defaultCovers.IT;
    } else if (catName.toUpperCase().includes('MS') || catName.toLowerCase().includes('market')) {
      coverUrl = defaultCovers.Marketing;
    } else if (catName.toUpperCase().includes('LDS') || catName.toLowerCase().includes('leader')) {
      coverUrl = defaultCovers.Leadership;
    } else if (catName.toUpperCase().includes('CUL') || catName.toLowerCase().includes('culture') || catName.includes('វប្បធម៌')) {
      coverUrl = defaultCovers.Culture;
    }

    for (const b of block.books) {
      const existingBook = await get('SELECT id FROM books WHERE LOWER(title) = LOWER(?) AND category_id = ?', [
        b.title,
        catId
      ]);

      if (!existingBook) {
        const uniqueIsbn = `ISBN-${catId}-${totalNewBooks + 1}-${Math.floor(100 + Math.random() * 900)}`;
        await run(
          `INSERT INTO books (title, author, isbn, category_id, description, cover_url, copies_total, copies_available)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.title,
            'DUC Library',
            uniqueIsbn,
            catId,
            `Official DUC Library book under category ${catName}.`,
            coverUrl,
            b.copies,
            b.copies
          ]
        );
        totalNewBooks++;
      } else {
        await run(
          'UPDATE books SET copies_total = ?, copies_available = ? WHERE id = ?',
          [b.copies, b.copies, existingBook.id]
        );
        totalUpdatedBooks++;
      }
    }
  }

  console.log(`[GoogleSheets] Synced ${totalNewBooks} new books, ${totalUpdatedBooks} updated across ${categoryBlocks.length} categories.`);
  return {
    totalCategories: categoryBlocks.length,
    newlyAddedBooks: totalNewBooks,
    updatedBooks: totalUpdatedBooks,
    categories: categoryBlocks
  };
}

module.exports = {
  fetchStudentsFromSheet,
  syncStudentsToDb,
  fetchBooksFromSheet,
  syncBooksToDb,
  getServiceAccountEmail,
  SAMPLE_STUDENTS
};
