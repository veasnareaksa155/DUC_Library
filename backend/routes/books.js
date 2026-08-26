const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadPdfToCloudinary, uploadImageToCloudinary } = require('../cloudinary');
const ORM = require('../googleSheetsORM');
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
      
      // Prevent parsing huge PDFs which blocks Node.js event loop or causes OOM
      const sizeInMB = (base64Data.length * 0.75) / (1024 * 1024);
      if (sizeInMB > 2) {
        console.log(`[PDF Auto-Extractor] Skipping extraction for large PDF (${sizeInMB.toFixed(2)} MB).`);
        return content;
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const parsed = await parseFn(buffer);
      if (parsed && parsed.text && parsed.text.trim()) {
        let cleaned = parsed.text
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
          
        if (cleaned.length > 10) {
          // Google Sheets cell limit is 50,000 chars. We must truncate to avoid database crash.
          if (cleaned.length > 49000) {
            console.log(`[PDF Auto-Extractor] Truncating ${cleaned.length} chars to 49000 to respect DB limits.`);
            cleaned = cleaned.substring(0, 49000) + '\n\n...[Content truncated due to size limits]';
          }
          content = cleaned;
          console.log(`[PDF Auto-Extractor] Successfully extracted ${cleaned.length} chars of text!`);
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
  if (global.bookCache) global.bookCache.clear();
  
  const sse = require('../services/sse');
  sse.broadcast('catalog_updated', { type: 'books' });

  res.json({
    message: `Library catalog synchronized! All users have been notified of the updates.`,
    details: { synced: true }
  });
});

// Get list of books (supports search query, category filter, and availability filter)
router.get('/', async (req, res) => {
  try {
    const { search, category_id, available_only } = req.query;

    const categories = await ORM.getAll('Categories');
    const categoriesMap = {};
    categories.forEach(c => {
      categoriesMap[c.id] = c.name;
    });

    let books = await ORM.getAll('Books');

    // Sort by created_at desc (newest first)
    books.sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    if (category_id && category_id !== 'all') {
      books = books.filter(b => String(b.category_id) === String(category_id));
    }
    
    if (available_only === 'true') {
      books = books.filter(b => Number(b.copies_available) > 0);
    }

    // Map fields to what frontend expects
    books = books.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category_id: b.category_id,
      description: b.description,
      cover_url: b.cover_url,
      copies_total: Number(b.copies_total) || 0,
      copies_available: Number(b.copies_available) || 0,
      publisher: b.publisher,
      publish_year: b.publish_year,
      created_at: b.created_at,
      is_featured: b.is_featured === '1' || b.is_featured === 1 || b.is_featured === true || String(b.is_featured).toLowerCase() === 'true' ? 1 : 0,
      has_pdf: (b.pdf_url && b.pdf_url.length > 0) ? 1 : 0,
      has_digital_content: (b.digital_content && b.digital_content.length > 0) ? 1 : 0,
      category_name: b.category_id ? categoriesMap[b.category_id] : null
    }));

    if (search) {
      const lowerSearch = search.toLowerCase();
      books = books.filter(b => 
        (b.title && b.title.toLowerCase().includes(lowerSearch)) ||
        (b.author && b.author.toLowerCase().includes(lowerSearch)) ||
        (b.category_name && b.category_name.toLowerCase().includes(lowerSearch)) ||
        (b.isbn && String(b.isbn).toLowerCase().includes(lowerSearch)) ||
        (b.description && b.description.toLowerCase().includes(lowerSearch))
      );
    }

    res.json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ message: 'Failed to retrieve books.' });
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await ORM.getById('Books', req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }
    
    if (book.category_id) {
      const cat = await ORM.getById('Categories', book.category_id);
      if (cat) {
        book.category_name = cat.name;
      }
    }
    
    book.copies_total = Number(book.copies_total) || 0;
    book.copies_available = Number(book.copies_available) || 0;
    book.is_featured = book.is_featured === '1' || book.is_featured === 1 || String(book.is_featured).toLowerCase() === 'true' ? 1 : 0;

    res.json(book);
  } catch (error) {
    console.error('Error getting single book:', error);
    res.status(500).json({ message: 'Failed to fetch book details.' });
  }
});

// Add read-ping endpoint to track live readers
router.post('/:id/read-ping', async (req, res) => {
  try {
    const { session_id, book_title } = req.body;
    if (session_id) {
      const activeReadersService = require('../services/activeReaders');
      
      // Try to extract user from token if available, but don't strictly require it
      let user = null;
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            const { JWT_SECRET } = require('../middleware/auth');
            user = jwt.verify(token, JWT_SECRET);
          } catch (e) {}
        }
      }

      // Use a local cache for the PDF check to prevent hitting Google Sheets rate limit on every ping
      if (!global.bookCache) global.bookCache = new Map();
      const now = Date.now();
      let book = null;
      
      if (global.bookCache.has(req.params.id) && (now - global.bookCache.get(req.params.id).timestamp < 5 * 60 * 1000)) {
        book = global.bookCache.get(req.params.id).data;
      } else {
        book = await ORM.getById('Books', req.params.id);
        global.bookCache.set(req.params.id, { data: book, timestamp: now });
      }
      
      // Enforce: only count if it actually has a digital PDF to read
      if (!book || !book.pdf_url) {
        activeReadersService.removeReader(session_id);
        return res.json({ active_readers_count: 0 });
      }

      const isNew = activeReadersService.pingReader(session_id, req.params.id, user);
      console.log(`[read-ping] session: ${session_id}, book_id: ${req.params.id}, isNew: ${isNew}`);
      
      const sse = require('../services/sse');
      
      if (isNew) {
        const totalReaders = activeReadersService.getActiveReaders().count;
        console.log(`[read-ping] Broadcasting new_digital_read. Total: ${totalReaders}`);
        sse.broadcastToAdmins('new_digital_read', {
          user_name: user ? (user.name || user.name_latin) : 'Anonymous Student',
          book_title: book_title || 'A Digital Book',
          total_active_readers: totalReaders
        });
      }
      
      const count = activeReadersService.getActiveReadersForBook(req.params.id);
      if (isNew) {
        // Broadcast to ALL connected clients so they see the count update instantly
        sse.broadcast('active_readers_updated', { book_id: req.params.id, count });
      }
      
      return res.json({ active_readers_count: count });
    }
    res.json({ active_readers_count: 1 });
  } catch (error) {
    console.error('Read ping error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add read-leave endpoint to immediately decrement reader count
router.post('/:id/read-leave', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (session_id) {
      const activeReadersService = require('../services/activeReaders');
      activeReadersService.removeReader(session_id);
      
      const totalReaders = activeReadersService.getActiveReaders().count;
      const sse = require('../services/sse');
      sse.broadcastToAdmins('digital_read_ended', {
        session_id,
        total_active_readers: totalReaders
      });
      
      const count = activeReadersService.getActiveReadersForBook(req.params.id);
      
      // Broadcast to ALL connected clients so they see the count decrease instantly
      sse.broadcast('active_readers_updated', { book_id: req.params.id, count });
      
      return res.json({ active_readers_count: count });
    }
    res.json({ active_readers_count: 0 });
  } catch (error) {
    console.error('Read leave error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add new book (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title, author, isbn, category_id, description, cover_url, pdf_url, digital_content,
      copies_total, publisher, publish_year, is_featured
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Book title and author are required.' });
    }

    const total = parseInt(copies_total) >= 0 ? parseInt(copies_total) : 1;
    const finalContent = await autoExtractTextFromPdfIfNeeded(pdf_url, digital_content);

    let finalPdfUrl = pdf_url || '';
    if (finalPdfUrl.startsWith('data:application/pdf;base64,')) {
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      finalPdfUrl = await uploadPdfToCloudinary(finalPdfUrl, filename);
    }

    let finalCoverUrl = cover_url || '';
    if (finalCoverUrl.startsWith('data:image/')) {
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_cover_${Date.now()}`;
      finalCoverUrl = await uploadImageToCloudinary(finalCoverUrl, filename);
    }

    const newBookData = {
      title,
      author,
      isbn: isbn || '',
      category_id: category_id ? String(category_id) : '',
      description: description || '',
      cover_url: finalCoverUrl,
      pdf_url: finalPdfUrl,
      digital_content: finalContent || '',
      copies_total: total,
      copies_available: total,
      publisher: publisher || '',
      publish_year: publish_year || new Date().getFullYear(),
      is_featured: is_featured ? 1 : 0,
      read_count: 0
    };

    const inserted = await ORM.insert('Books', newBookData);
    res.status(201).json({ message: 'Book added successfully', book: inserted });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add new book.' });
  }
});

// Update book (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existingBook = await ORM.getById('Books', id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const {
      title, author, isbn, category_id, description, cover_url, pdf_url, digital_content,
      copies_total, copies_available, publisher, publish_year, is_featured
    } = req.body;

    let targetPdf = pdf_url !== undefined ? pdf_url : existingBook.pdf_url;
    const targetContent = digital_content !== undefined ? digital_content : existingBook.digital_content;
    const finalContent = await autoExtractTextFromPdfIfNeeded(targetPdf, targetContent);

    if (targetPdf && targetPdf.startsWith('data:application/pdf;base64,')) {
      const filename = `${(title || existingBook.title).replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      targetPdf = await uploadPdfToCloudinary(targetPdf, filename);
    }

    let targetCover = cover_url !== undefined ? cover_url : existingBook.cover_url;
    if (targetCover && targetCover.startsWith('data:image/')) {
      const filename = `${(title || existingBook.title).replace(/[^a-zA-Z0-9]/g, '_')}_cover_${Date.now()}`;
      targetCover = await uploadImageToCloudinary(targetCover, filename);
    }

    let newTotal = copies_total !== undefined ? parseInt(copies_total) : existingBook.copies_total;
    let newAvailable = copies_available !== undefined ? parseInt(copies_available) : existingBook.copies_available;

    if (copies_total !== undefined && copies_available === undefined) {
      const diff = newTotal - existingBook.copies_total;
      newAvailable = existingBook.copies_available + diff;
      if (newAvailable < 0) {
        return res.status(400).json({ message: 'Cannot reduce total copies below the number of currently borrowed copies.' });
      }
    }

    const updateData = {
      title: title || existingBook.title,
      author: author || existingBook.author,
      isbn: isbn !== undefined ? isbn : existingBook.isbn,
      category_id: category_id !== undefined ? String(category_id) : existingBook.category_id,
      description: description !== undefined ? description : existingBook.description,
      cover_url: targetCover,
      pdf_url: targetPdf,
      digital_content: finalContent,
      copies_total: newTotal,
      copies_available: newAvailable,
      publisher: publisher !== undefined ? publisher : existingBook.publisher,
      publish_year: publish_year !== undefined ? parseInt(publish_year) : existingBook.publish_year,
      is_featured: is_featured !== undefined ? (is_featured ? 1 : 0) : existingBook.is_featured
    };

    const updated = await ORM.update('Books', id, updateData);
    res.json({ message: 'Book updated successfully', book: updated });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Failed to update book.' });
  }
});

// Toggle featured status (Admin only)
router.patch('/:id/toggle-featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ORM.getById('Books', id);
    if (!doc) return res.status(404).json({ message: 'Book not found.' });

    const isCurrentlyFeatured = doc.is_featured === '1' || doc.is_featured === 1 || String(doc.is_featured).toLowerCase() === 'true';
    const newFeatured = isCurrentlyFeatured ? 0 : 1;
    
    await ORM.update('Books', id, { is_featured: newFeatured });
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
    const borrowings = await ORM.getAll('Borrowings');
    const activeBorrow = borrowings.find(b => 
      String(b.book_id) === String(id) && 
      (b.status === 'pending' || b.status === 'approved')
    );

    if (activeBorrow) {
      return res.status(400).json({ message: 'Cannot delete book with active or pending borrowings.' });
    }

    await ORM.remove('Books', id);
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

    const book = await ORM.getById('Books', id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }
    
    const extractedText = await autoExtractTextFromPdfIfNeeded(pdf_url, book.digital_content);

    const updatedBook = await ORM.update('Books', id, {
      pdf_url: pdf_url || '',
      digital_content: extractedText || ''
    });
    
    if (updatedBook.category_id) {
      const cat = await ORM.getById('Categories', updatedBook.category_id);
      if (cat) updatedBook.category_name = cat.name;
    }

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

module.exports = router;
