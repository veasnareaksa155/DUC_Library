const ORM = require('../googleSheetsORM');

const activeReaders = {};
const MINIMUM_SAVE_DURATION_SEC = 120; // Only save sessions longer than 2 minutes

/**
 * Save a reader session to Google Sheets
 */
async function saveSessionToDb(sessionId, reader) {
  if (!reader.start_time) return;
  const end_time = Date.now();
  const duration_seconds = Math.round((end_time - reader.start_time) / 1000);
  
  if (duration_seconds >= MINIMUM_SAVE_DURATION_SEC) {
    const newRow = {
      id: `read-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      session_id: sessionId,
      user_id: reader.user_id || 'anonymous',
      user_name: reader.user_name || 'Anonymous Student',
      book_id: reader.book_id,
      start_time: new Date(reader.start_time).toISOString(),
      end_time: new Date(end_time).toISOString(),
      duration_seconds: duration_seconds
    };

    try {
      await ORM.insert('DigitalReads', newRow);
      console.log(`Saved reading session ${sessionId} (${duration_seconds}s) to DB.`);
    } catch (e) {
      console.error('Failed to save reading session:', e);
    }
  }
}

/**
 * Update the last ping time for a reader session
 * @param {string} sessionId - The unique session ID of the reader
 * @param {string} bookId - The ID of the book being read
 * @param {object} user - Optional user information (name, id)
 */
function pingReader(sessionId, bookId, user) {
  let isNew = false;
  if (!activeReaders[sessionId]) {
    activeReaders[sessionId] = {
      book_id: bookId,
      user_id: user?.id || null,
      user_name: user?.name || 'Anonymous Student',
      start_time: Date.now(),
      last_ping: Date.now()
    };
    isNew = true;
  } else {
    activeReaders[sessionId].last_ping = Date.now();
    activeReaders[sessionId].user_id = user?.id || activeReaders[sessionId].user_id;
    activeReaders[sessionId].user_name = user?.name || activeReaders[sessionId].user_name;
  }
  return isNew;
}

/**
 * Get the current active readers count and details
 * @returns {object} { count, details }
 */
function getActiveReaders() {
  const now = Date.now();
  const timeoutMs = 60000; // 1 minute (timeout if ping is missed)

  const activeSessions = Object.keys(activeReaders).filter(sessionId => {
    return (now - activeReaders[sessionId].last_ping) < timeoutMs;
  });

  const details = activeSessions.map(sessionId => ({
    session_id: sessionId,
    ...activeReaders[sessionId]
  }));

  return {
    count: activeSessions.length,
    details
  };
}

/**
 * Get active readers count for a specific book
 * @param {string} bookId - The ID of the book
 * @returns {number} count
 */
function getActiveReadersForBook(bookId) {
  const now = Date.now();
  const timeoutMs = 60000; // 1 minute (timeout if ping is missed)

  return Object.values(activeReaders).filter(reader => 
    String(reader.book_id) === String(bookId) && (now - reader.last_ping) < timeoutMs
  ).length;
}

/**
 * Remove a reader session immediately (e.g. they closed the book)
 * @param {string} sessionId - The unique session ID of the reader
 */
async function removeReader(sessionId) {
  if (activeReaders[sessionId]) {
    const session = activeReaders[sessionId];
    const duration = Date.now() - session.start_time;
    // Save to DB if they read for at least 2 minutes (handled inside saveSessionToDb, but double check here)
    if (duration >= 120000) {
      saveSessionToDb(sessionId, session).catch(err => {
        console.error('Failed to save session on explicit leave:', err);
      });
    }
    delete activeReaders[sessionId];
  }
}

// Background cleanup task to save timed-out sessions
setInterval(async () => {
  const now = Date.now();
  const timeoutMs = 60000; // 1 minute (timeout if ping is missed)
  
  const timedOutSessions = [];
  
  // 1. Identify all timed-out sessions
  for (const sessionId in activeReaders) {
    if (now - activeReaders[sessionId].last_ping >= timeoutMs) {
      timedOutSessions.push({
        sessionId,
        data: activeReaders[sessionId]
      });
    }
  }

  if (timedOutSessions.length === 0) return;

  // 2. Remove them synchronously so `activeReaders` is instantly accurate
  timedOutSessions.forEach(({ sessionId }) => {
    delete activeReaders[sessionId];
  });

  // 3. Broadcast the correct total immediately
  try {
    const sse = require('./sse');
    const totalReaders = Object.keys(activeReaders).length;
    // Broadcast one event to update the count on the frontend
    sse.broadcastToAdmins('digital_read_ended', { 
      session_id: 'batch-cleanup', // not specifically needed if we just want to update the total
      total_active_readers: totalReaders
    });
  } catch (err) {
    console.error('Failed to broadcast read end event:', err);
  }

  // 4. Asynchronously save them to DB (preventing Google Sheets rate limits from blocking the cleanup)
  // We process them in chunks or just sequentially without blocking the main interval
  for (const session of timedOutSessions) {
    await saveSessionToDb(session.sessionId, session.data).catch(e => console.error(e));
  }
}, 30000); // Check every 30 seconds

module.exports = {
  pingReader,
  getActiveReaders,
  getActiveReadersForBook,
  removeReader
};
