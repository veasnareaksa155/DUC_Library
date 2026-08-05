const express = require('express');
const { all, get, run } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Request to borrow a book (User)
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { book_id, days = 14 } = req.body;
    const user_id = req.user.id;

    if (!book_id) {
      return res.status(400).json({ message: 'Book ID is required.' });
    }

    // Check if book exists and is available
    const book = await get('SELECT * FROM books WHERE id = ?', [book_id]);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (book.copies_available <= 0) {
      return res.status(400).json({ message: 'This book is currently out of stock.' });
    }

    // Check if user already has an active request or borrowing for this book
    const existingBorrow = await get(`
      SELECT id, status FROM borrowings 
      WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'approved')
    `, [user_id, book_id]);

    if (existingBorrow) {
      return res.status(400).json({
        message: existingBorrow.status === 'pending'
          ? 'You already have a pending borrow request for this book.'
          : 'You currently have an active borrowing for this book.'
      });
    }

    // Calculate due date
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + parseInt(days));
    const due_date = dueDateObj.toISOString().split('T')[0];

    const result = await run(`
      INSERT INTO borrowings (user_id, book_id, due_date, status)
      VALUES (?, ?, ?, 'pending')
    `, [user_id, book_id, due_date]);

    res.status(201).json({
      message: 'Borrow request submitted successfully. Awaiting admin approval.',
      borrowing_id: result.id
    });
  } catch (error) {
    console.error('Error submitting borrow request:', error);
    res.status(500).json({ message: 'Failed to request borrow.' });
  }
});

// Get user's own borrowing history and active borrowings
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const borrowings = await all(`
      SELECT br.*, b.title as book_title, b.author as book_author, b.cover_url as book_cover, b.pdf_url, b.digital_content
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      WHERE br.user_id = ?
      ORDER BY br.id DESC
    `, [user_id]);

    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching user borrowings:', error);
    res.status(500).json({ message: 'Failed to fetch borrowings.' });
  }
});

// User requests return or returns borrowed book
router.post('/:id/return', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const borrowing = await get('SELECT * FROM borrowings WHERE id = ?', [id]);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found.' });
    }

    // Ensure only owner or admin can initiate return
    if (borrowing.user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned.' });
    }

    const return_date = new Date().toISOString();

    // Mark borrowing as returned
    await run(`
      UPDATE borrowings 
      SET status = 'returned', return_date = ? 
      WHERE id = ?
    `, [return_date, id]);

    // Restore available copy count for the book
    await run(`
      UPDATE books 
      SET copies_available = copies_available + 1 
      WHERE id = ?
    `, [borrowing.book_id]);

    res.json({ message: 'Book returned successfully!' });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Failed to process return.' });
  }
});

module.exports = router;
