const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');
const sse = require('../services/sse');

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
    const book = await ORM.getById('Books', book_id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (Number(book.copies_available) <= 0) {
      return res.status(400).json({ message: 'This book is currently out of stock.' });
    }

    // Check if user already has ANY active request or borrowing
    const borrowings = await ORM.getAll('Borrowings');
    const existingBorrow = borrowings.find(b => 
      String(b.user_id) === String(user_id) && 
      (b.status === 'pending' || b.status === 'approved')
    );

    if (existingBorrow) {
      return res.status(400).json({
        message: existingBorrow.status === 'pending'
          ? 'You already have a pending borrow request for a book. Please wait for it to be processed or return it first.'
          : 'You already have a book currently borrowed. Please return your active book before borrowing another.'
      });
    }

    // Calculate due date
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + parseInt(days));
    const due_date = dueDateObj.toISOString().split('T')[0];

    const newBorrowing = {
      user_id: String(user_id),
      book_id: String(book_id),
      borrow_date: new Date().toISOString(),
      due_date,
      return_date: '',
      status: 'pending',
      admin_notes: ''
    };

    const inserted = await ORM.insert('Borrowings', newBorrowing);

    // Alert connected Admins instantly
    sse.broadcastToAdmins('new_borrowing_request', {
      book_title: book.title,
      borrowing_id: inserted.id
    });

    res.status(201).json({
      message: 'Borrow request submitted successfully. Awaiting admin approval.',
      borrowing_id: inserted.id
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
    const allBorrowings = await ORM.getAll('Borrowings');
    const userBorrowings = allBorrowings.filter(b => String(b.user_id) === String(user_id));

    // Fetch book details for each borrowing
    const borrowingsWithBooks = await Promise.all(userBorrowings.map(async (br) => {
      const book = await ORM.getById('Books', br.book_id);
      if (book) {
        br.book_title = book.title;
        br.book_author = book.author;
        br.book_cover = book.cover_url;
        br.pdf_url = book.pdf_url;
        br.digital_content = book.digital_content;
      }
      return br;
    }));

    // Sort by borrow_date desc
    borrowingsWithBooks.sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date));

    res.json(borrowingsWithBooks);
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

    const borrowing = await ORM.getById('Borrowings', id);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found.' });
    }

    // Ensure only owner or admin can initiate return
    if (String(borrowing.user_id) !== String(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned.' });
    }

    const return_date = new Date().toISOString();

    // Mark borrowing as returned
    await ORM.update('Borrowings', id, {
      status: 'returned',
      return_date
    });

    // Restore available copy count for the book
    const book = await ORM.getById('Books', borrowing.book_id);
    if (book) {
      const newAvailable = (Number(book.copies_available) || 0) + 1;
      await ORM.update('Books', book.id, { copies_available: newAvailable });
    }

    res.json({ message: 'Book returned successfully!' });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Failed to process return.' });
  }
});

module.exports = router;
