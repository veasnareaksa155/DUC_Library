const express = require('express');
const { all, get, run } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { syncBooksToDb } = require('../googleSheets');
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('[PDF-Parse] Module load warning:', e.message);
}

const router = express.Router();

async function autoExtractTextFromPdfIfNeeded(pdfUrl, digitalContent) {
  let content = digitalContent || '';
  const parseFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse && pdfParse.default);
  if (parseFn && pdfUrl && pdfUrl.startsWith('data:application/pdf;base64,')) {
    try {
      const base64Data = pdfUrl.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const parsed = await parseFn(buffer);
      if (parsed && parsed.text && parsed.text.trim()) {
        const cleaned = parsed.text
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        if (cleaned.length > 10) {
          content = cleaned;
          console.log(`[PDF Auto-Extractor] Successfully extracted ${cleaned.length} chars of text from ${parsed.numpages} PDF pages!`);
        }
      }
    } catch (err) {
      console.error('[PDF Auto-Extractor Error]:', err);
    }
  }
  return content;
}

// Sync books inventory from Google Sheet (Admin only)
router.post('/sync-sheet', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { spreadsheet_id } = req.body;
    if (!spreadsheet_id) {
      return res.status(400).json({ message: 'Spreadsheet ID is required.' });
    }
    const result = await syncBooksToDb(spreadsheet_id);
    res.json({
      message: `Successfully synced ${result.newlyAddedBooks} new books & ${result.updatedBooks} updated across ${result.totalCategories} categories!`,
      details: result
    });
  } catch (error) {
    console.error('Google Sheet book sync error:', error);
    res.status(500).json({ message: 'Failed to sync book inventory from Google Sheet.' });
  }
});

// Get list of books (supports search query, category filter, and availability filter)
router.get('/', async (req, res) => {
  try {
    const { search, category_id, available_only } = req.query;

    let query = `
      SELECT 
        b.id, b.title, b.author, b.isbn, b.category_id, b.description, 
        b.cover_url, b.copies_total, b.copies_available, b.publisher, 
        b.publish_year, b.created_at, b.is_featured,
        (CASE WHEN b.pdf_url IS NOT NULL AND length(b.pdf_url) > 0 THEN 1 ELSE 0 END) as has_pdf,
        (CASE WHEN b.digital_content IS NOT NULL AND length(b.digital_content) > 0 THEN 1 ELSE 0 END) as has_digital_content,
        c.name as category_name 
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.description LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (category_id && category_id !== 'all') {
      query += ` AND b.category_id = ?`;
      params.push(category_id);
    }

    if (available_only === 'true') {
      query += ` AND b.copies_available > 0`;
    }

    query += ` ORDER BY b.id DESC`;

    const books = await all(query, params);
    res.json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ message: 'Failed to retrieve books.' });
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await get(`
      SELECT b.*, c.name as category_name 
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch book details.' });
  }
});

// Add new book (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category_id,
      description,
      cover_url,
      pdf_url,
      digital_content,
      copies_total,
      publisher,
      publish_year,
      is_featured
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Book title and author are required.' });
    }

    const total = parseInt(copies_total) || 1;
    const finalContent = await autoExtractTextFromPdfIfNeeded(pdf_url, digital_content);

    const result = await run(`
      INSERT INTO books (
        title, author, isbn, category_id, description, cover_url, pdf_url, digital_content,
        copies_total, copies_available, publisher, publish_year, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      author,
      isbn || null,
      category_id || null,
      description || '',
      cover_url || '',
      pdf_url || '',
      finalContent || '',
      total,
      total,
      publisher || '',
      publish_year || new Date().getFullYear(),
      is_featured ? 1 : 0
    ]);

    const newBook = await get('SELECT * FROM books WHERE id = ?', [result.id]);
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add new book.' });
  }
});

// Update book (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existingBook = await get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const {
      title,
      author,
      isbn,
      category_id,
      description,
      cover_url,
      pdf_url,
      digital_content,
      copies_total,
      copies_available,
      publisher,
      publish_year,
      is_featured
    } = req.body;

    const targetPdf = pdf_url !== undefined ? pdf_url : existingBook.pdf_url;
    const targetContent = digital_content !== undefined ? digital_content : existingBook.digital_content;
    const finalContent = await autoExtractTextFromPdfIfNeeded(targetPdf, targetContent);

    await run(`
      UPDATE books SET
        title = ?,
        author = ?,
        isbn = ?,
        category_id = ?,
        description = ?,
        cover_url = ?,
        pdf_url = ?,
        digital_content = ?,
        copies_total = ?,
        copies_available = ?,
        publisher = ?,
        publish_year = ?,
        is_featured = ?
      WHERE id = ?
    `, [
      title || existingBook.title,
      author || existingBook.author,
      isbn !== undefined ? isbn : existingBook.isbn,
      category_id !== undefined ? category_id : existingBook.category_id,
      description !== undefined ? description : existingBook.description,
      cover_url !== undefined ? cover_url : existingBook.cover_url,
      targetPdf,
      finalContent,
      copies_total !== undefined ? parseInt(copies_total) : existingBook.copies_total,
      copies_available !== undefined ? parseInt(copies_available) : existingBook.copies_available,
      publisher !== undefined ? publisher : existingBook.publisher,
      publish_year !== undefined ? parseInt(publish_year) : existingBook.publish_year,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existingBook.is_featured,
      id
    ]);

    const updatedBook = await get('SELECT * FROM books WHERE id = ?', [id]);
    res.json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Failed to update book.' });
  }
});

// Toggle featured status (Admin only)
router.patch('/:id/toggle-featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const book = await get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) return res.status(404).json({ message: 'Book not found.' });

    const newFeatured = book.is_featured ? 0 : 1;
    await run('UPDATE books SET is_featured = ? WHERE id = ?', [newFeatured, id]);
    res.json({ message: 'Featured status updated', is_featured: newFeatured });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ message: 'Failed to update featured status.' });
  }
});

// Delete book (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if book has active borrowings
    const activeBorrow = await get(`
      SELECT id FROM borrowings 
      WHERE book_id = ? AND status IN ('pending', 'approved')
    `, [id]);

    if (activeBorrow) {
      return res.status(400).json({ message: 'Cannot delete book with active or pending borrowings.' });
    }

    await run('DELETE FROM books WHERE id = ?', [id]);
    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book.' });
  }
});

// Upload or set PDF file for a book (Admin only)
router.put('/:id/pdf', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { pdf_url } = req.body;

    const book = await get('SELECT id, digital_content FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const extractedText = await autoExtractTextFromPdfIfNeeded(pdf_url, book.digital_content);

    await run('UPDATE books SET pdf_url = ?, digital_content = ? WHERE id = ?', [pdf_url || '', extractedText || '', id]);
    const updatedBook = await get('SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?', [id]);

    res.json({
      message: extractedText && extractedText.length > 50
        ? `Book PDF uploaded & ${extractedText.length} characters of readable text extracted!`
        : 'Book PDF updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Error updating book PDF:', error);
    res.status(500).json({ message: 'Failed to update book PDF.' });
  }
});
// Register or ping active digital reading session
router.post('/:id/read-ping', async (req, res) => {
  try {
    const { id } = req.params;
    const { session_id, user_id, is_initial } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    // Auto-clean stale active sessions older than 2 minutes (Do NOT store persistent reading history)
    await run("DELETE FROM active_readers WHERE last_ping < datetime('now', '-2 minutes')");

    // Insert or update active reader session (Upsert by user_id & book_id if logged in, or session_id if guest)
    let existing;
    if (user_id) {
      existing = await get('SELECT id FROM active_readers WHERE user_id = ? AND book_id = ?', [user_id, id]);
    } else {
      existing = await get('SELECT id FROM active_readers WHERE session_id = ?', [session_id]);
    }

    if (existing) {
      await run("UPDATE active_readers SET last_ping = CURRENT_TIMESTAMP, session_id = ? WHERE id = ?", [session_id, existing.id]);
    } else {
      await run("INSERT INTO active_readers (book_id, session_id, user_id) VALUES (?, ?, ?)", [id, session_id, user_id || null]);
    }

    // Get active count for this book & total active count across all books
    const activeBookCount = await get("SELECT COUNT(*) as count FROM active_readers WHERE book_id = ? AND last_ping >= datetime('now', '-2 minutes')", [id]);
    const activeTotalCount = await get("SELECT COUNT(*) as count FROM active_readers WHERE last_ping >= datetime('now', '-2 minutes')");
    const bookData = await get("SELECT read_count FROM books WHERE id = ?", [id]);

    res.json({
      book_id: parseInt(id),
      active_readers_count: activeBookCount?.count || 0,
      total_active_readers: activeTotalCount?.count || 0,
      read_count: bookData?.read_count || 0
    });
  } catch (error) {
    console.error('Reading ping error:', error);
    res.status(500).json({ message: 'Failed to update reading heartbeat.' });
  }
});

module.exports = router;
