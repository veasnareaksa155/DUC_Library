// In-memory store for active readers to avoid Google Sheets API rate limits
// Readers ping every 25 seconds, we consider them inactive after 45 seconds.

const activeReaders = {};

/**
 * Update the last ping time for a reader session
 * @param {string} sessionId - The unique session ID of the reader
 * @param {string} bookId - The ID of the book being read
 * @param {object} user - Optional user information (name, id)
 */
function pingReader(sessionId, bookId, user) {
  activeReaders[sessionId] = {
    book_id: bookId,
    user_id: user?.id || null,
    user_name: user?.name || 'Anonymous Student',
    last_ping: Date.now()
  };
}

/**
 * Get the current active readers count and details
 * @returns {object} { count, details }
 */
function getActiveReaders() {
  const now = Date.now();
  const timeoutMs = 45000; // 45 seconds

  const activeSessions = Object.keys(activeReaders).filter(sessionId => {
    return (now - activeReaders[sessionId].last_ping) < timeoutMs;
  });

  const details = activeSessions.map(sessionId => activeReaders[sessionId]);

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
  const timeoutMs = 45000;

  return Object.values(activeReaders).filter(reader => 
    String(reader.book_id) === String(bookId) && (now - reader.last_ping) < timeoutMs
  ).length;
}

/**
 * Remove a reader session
 * @param {string} sessionId - The unique session ID of the reader
 */
function removeReader(sessionId) {
  if (activeReaders[sessionId]) {
    delete activeReaders[sessionId];
  }
}

module.exports = {
  pingReader,
  getActiveReaders,
  getActiveReadersForBook,
  removeReader
};
