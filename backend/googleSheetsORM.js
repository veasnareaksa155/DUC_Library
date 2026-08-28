const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Set a default or use env var
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

function getCredentialsPath() {
  const p1 = path.join(__dirname, 'google-credentials.json');
  const p2 = path.join(__dirname, 'google-credentials.json.json');
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return p1;
}

let sheetsClient = null;

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  const credPath = getCredentialsPath();
  if (!fs.existsSync(credPath)) {
    throw new Error('google-credentials.json not found. Please provide Service Account credentials.');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Need full write access
  });
  
  const client = await auth.getClient();
  sheetsClient = google.sheets({ version: 'v4', auth: client });
  return sheetsClient;
}

// In-Memory Cache to avoid Google Sheets API rate limits
const CACHE = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

// Maps sheet names to their exact column layouts
const SCHEMAS = {
  'Books': ['id', 'title', 'author', 'isbn', 'category_id', 'description', 'cover_url', 'pdf_url', 'digital_content', 'copies_total', 'copies_available', 'publisher', 'publish_year', 'is_featured', 'read_count', 'created_at'],
  'Categories': ['id', 'name', 'icon', 'created_at'],
  'Borrowings': ['id', 'book_id', 'user_id', 'borrow_date', 'due_date', 'return_date', 'status', 'admin_notes'],
  'Notifications': ['id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at'],
  'Checkins': ['id', 'user_id', 'checkin_time', 'lat', 'lng', 'status'],
  'ProfilePhotos': ['id', 'student_id', 'photo_url', 'updated_at'],
  'Admins': ['id', 'username', 'password', 'name', 'email', 'profile_photo', 'role'],
  'DigitalReads': ['id', 'session_id', 'user_id', 'user_name', 'book_id', 'start_time', 'end_time', 'duration_seconds'],
  'Wishlists': ['id', 'user_id', 'book_id', 'created_at'],
  'Settings': ['id', 'setting_key', 'setting_value', 'updated_at'],
  'UserSessions': ['id', 'user_id', 'device_type', 'os', 'browser', 'ip_address', 'status', 'created_at', 'last_active', 'device_name', 'location'],
  'User2FA': ['id', 'user_id', 'secret', 'is_enabled', 'created_at', 'updated_at']
};

/**
 * Creates the sheets if they don't exist, and ensures headers match schema
 */
async function initializeSheets() {
  const sheets = await getSheetsClient();
  
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = res.data.sheets.map(s => s.properties.title);

    for (const [sheetName, headers] of Object.entries(SCHEMAS)) {
      if (!existingSheets.includes(sheetName)) {
        // Create the sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: {
            requests: [{
              addSheet: { properties: { title: sheetName } }
            }]
          }
        });
        console.log(`[GoogleSheetsORM] Created sheet: ${sheetName}`);
      
        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          resource: { values: [headers] }
        });
        console.log(`Created new sheet: ${sheetName}`);
        
        // Insert default admin if creating the Admins sheet
        if (sheetName === 'Admins') {
          await insert('Admins', {
            id: 'admin-001',
            username: 'admin',
            password: 'admin123',
            name: 'System Admin',
            email: 'admin@duc.com',
            role: 'admin',
            profile_photo: ''
          });
          console.log(`Inserted default admin account into Admins sheet.`);
        }
      }
    }
  } catch (err) {
    console.error('[GoogleSheetsORM] Failed to initialize sheets:', err.message);
  }
}

/**
 * Get all rows from a sheet as an array of objects
 */
async function getAll(sheetName) {
  // Check cache first
  if (CACHE[sheetName] && (Date.now() - CACHE[sheetName].timestamp < CACHE_TTL_MS)) {
    return CACHE[sheetName].data;
  }

  const sheets = await getSheetsClient();
  const headers = SCHEMAS[sheetName];
  if (!headers) throw new Error(`Unknown sheet: ${sheetName}`);

  const range = `${sheetName}!A2:Z`; // Assuming max 26 columns
  
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
    const rows = res.data.values || [];
    
    const mappedRows = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        let val = row[index] || '';
        // Basic type parsing
        if (val === 'TRUE' || val === 'FALSE') {
          val = val === 'TRUE';
        } else if (!isNaN(val) && val !== '') {
          // If it's a number string (like copies_available) and doesn't start with 0 like a phone number
          if (String(val).startsWith('0') && String(val).length > 1) {
            // keep as string (phone number, isbn, etc.)
          } else {
            val = Number(val);
            
            // Fix for Google Sheets serial date numbers being converted to Jan 1 1970 in JS
            // Excel/Sheets serial dates are days since Dec 30, 1899. 25569 is Jan 1, 1970.
            // If the column is a date and the value looks like a serial date (e.g. 46259)
            if (header.includes('date') && val > 20000 && val < 90000) {
              const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
              val = jsDate.toISOString();
            }
          }
        }
        obj[header] = val;
      });
      return obj;
    });

    // Save to cache
    CACHE[sheetName] = { data: mappedRows, timestamp: Date.now() };
    return mappedRows;
  } catch (err) {
    console.error(`[GoogleSheetsORM] Error getting ${sheetName}:`, err.message);
    // If error occurs, try to return stale cache if available to prevent app crash
    if (CACHE[sheetName]) {
      console.warn(`[GoogleSheetsORM] Returning stale cache for ${sheetName} due to error.`);
      return CACHE[sheetName].data;
    }
    return [];
  }
}

/**
 * Get a single row by ID
 */
async function getById(sheetName, id) {
  const rows = await getAll(sheetName);
  return rows.find(r => String(r.id) === String(id)) || null;
}

/**
 * Find rows by condition
 */
async function find(sheetName, conditionFn) {
  const rows = await getAll(sheetName);
  return rows.filter(conditionFn);
}

// In-Memory Queue for batching Google Sheets write requests
global.writeQueue = global.writeQueue || {};

// Start background writer loop
if (!global.writeQueueIntervalStarted) {
  global.writeQueueIntervalStarted = true;
  setInterval(async () => {
    for (const sheetName of Object.keys(global.writeQueue)) {
      const items = global.writeQueue[sheetName];
      if (items && items.length > 0) {
        // Take all items currently in the queue
        const batchToInsert = items.splice(0, items.length);
        try {
          const sheets = await getSheetsClient();
          const headers = SCHEMAS[sheetName];
          
          const rows = batchToInsert.map(data => {
            return headers.map(header => data[header] === undefined || data[header] === null ? '' : String(data[header]));
          });

          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:A`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values: rows }
          });
          console.log(`[GoogleSheetsORM] Successfully batched ${rows.length} writes into ${sheetName}`);
        } catch (err) {
          console.error(`[GoogleSheetsORM] Failed to batch write into ${sheetName}:`, err.message);
          // Put them back in the queue to retry next tick if they failed!
          global.writeQueue[sheetName].unshift(...batchToInsert);
        }
      }
    }
  }, 5000); // Flush queue every 5 seconds
}

/**
 * Insert a new row
 */
async function insert(sheetName, data) {
  const headers = SCHEMAS[sheetName];
  
  if (!data.id) {
    data.id = Date.now().toString() + Math.random().toString(36).substr(2, 5); // Simple UUID
  }
  if (!data.created_at) {
    data.created_at = new Date().toISOString();
  }

  // Enqueue for background batch writing
  if (!global.writeQueue[sheetName]) global.writeQueue[sheetName] = [];
  global.writeQueue[sheetName].push(data);

  // Optimistically update cache instantly
  if (CACHE[sheetName]) {
    CACHE[sheetName].data.push(data);
  }
  
  return data;
}

/**
 * Update a row by ID
 */
async function update(sheetName, id, updateData) {
  const sheets = await getSheetsClient();
  const headers = SCHEMAS[sheetName];
  
  // Need to find the exact row number
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${sheetName}!A:A` });
  const idColumn = res.data.values || [];
  
  // Row indices in Google Sheets are 1-based. 
  const rowIndex = idColumn.findIndex(row => String(row[0]) === String(id));
  if (rowIndex === -1) throw new Error(`Document with ID ${id} not found in ${sheetName}`);

  // Fetch the existing row to merge data
  const sheetRow = rowIndex + 1; // 1-based index
  const existingRes = await sheets.spreadsheets.values.get({ 
    spreadsheetId: SPREADSHEET_ID, 
    range: `${sheetName}!A${sheetRow}:Z${sheetRow}` 
  });
  
  const existingValues = existingRes.data.values[0] || [];
  const existingObj = {};
  headers.forEach((header, index) => {
    existingObj[header] = existingValues[index] || '';
  });

  // Merge
  const mergedObj = { ...existingObj, ...updateData };
  const newRowValues = headers.map(header => mergedObj[header] === undefined || mergedObj[header] === null ? '' : String(mergedObj[header]));

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${sheetRow}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [newRowValues] }
  });

  // Optimistically update cache instead of invalidating it
  if (CACHE[sheetName]) {
    const idx = CACHE[sheetName].data.findIndex(r => String(r.id) === String(id));
    if (idx !== -1) {
      CACHE[sheetName].data[idx] = mergedObj;
    }
  }
  return mergedObj;
}

/**
 * Delete a row by ID
 */
async function remove(sheetName, id) {
  const sheets = await getSheetsClient();
  
  // Find the exact row number
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${sheetName}!A:A` });
  const idColumn = res.data.values || [];
  
  const rowIndex = idColumn.findIndex(row => String(row[0]) === String(id));
  if (rowIndex === -1) throw new Error(`Document with ID ${id} not found in ${sheetName}`);
  
  // To delete a row properly via Sheets API, we need the SheetId (not the spreadsheet ID, but the GID of the specific tab)
  const metaRes = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetMeta = metaRes.data.sheets.find(s => s.properties.title === sheetName);
  const sheetId = sheetMeta.properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex, // 0-based index for API
            endIndex: rowIndex + 1
          }
        }
      }]
    }
  });
  
  // Optimistically update cache instead of invalidating it
  if (CACHE[sheetName]) {
    CACHE[sheetName].data = CACHE[sheetName].data.filter(r => String(r.id) !== String(id));
  }
  return true;
}

/**
 * Insert multiple rows at once (Bulk Insert)
 */
async function insertMany(sheetName, dataArray) {
  if (!dataArray || dataArray.length === 0) return [];
  const sheets = await getSheetsClient();
  const headers = SCHEMAS[sheetName];

  const rows = dataArray.map(data => {
    if (!data.id) {
      data.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }
    if (!data.created_at) {
      data.created_at = new Date().toISOString();
    }
    return headers.map(header => data[header] === undefined || data[header] === null ? '' : String(data[header]));
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: rows }
  });

  // Optimistically update cache instead of invalidating it
  if (CACHE[sheetName]) {
    CACHE[sheetName].data.push(...dataArray);
  }
  return dataArray;
}

module.exports = {
  initializeSheets,
  getAll,
  getById,
  find,
  insert,
  insertMany,
  update,
  remove
};
