const express = require('express');
const { all, get, run } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes in this module
router.use(authenticateToken, requireAdmin);

// Dashboard metrics overview
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalBooks = await get('SELECT COUNT(*) as count FROM books');
    const totalUsers = await get('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const activeBorrowings = await get('SELECT COUNT(*) as count FROM borrowings WHERE status = "approved"');
    const pendingRequests = await get('SELECT COUNT(*) as count FROM borrowings WHERE status = "pending"');
    const overdueCount = await get(`
      SELECT COUNT(*) as count FROM borrowings 
      WHERE status = "approved" AND due_date < date('now')
    `);

    // Clean stale sessions & fetch live active readers count
    await run("DELETE FROM active_readers WHERE last_ping < datetime('now', '-2 minutes')");
    const activeReadersTotal = await get("SELECT COUNT(*) as count FROM active_readers WHERE last_ping >= datetime('now', '-2 minutes')");

    const activeReadersDetail = await all(`
      SELECT ar.id as session_db_id, ar.book_id, ar.user_id, ar.session_id, ar.last_ping,
             b.title as book_title, b.cover_url, b.author as book_author,
             u.name as user_name, u.name_khmer, u.student_id, u.email as user_email, u.profile_photo, u.dorm_room
      FROM active_readers ar
      JOIN books b ON ar.book_id = b.id
      LEFT JOIN users u ON ar.user_id = u.id
      WHERE ar.last_ping >= datetime('now', '-2 minutes')
      ORDER BY ar.last_ping DESC
    `);

    const topReadBooks = await all(`
      SELECT b.id, b.title, b.author, b.cover_url, b.read_count, c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ORDER BY COALESCE(b.read_count, 0) DESC, b.id DESC
      LIMIT 5
    `);

    // Recent borrowing activity
    const recentActivity = await all(`
      SELECT br.*, u.name as user_name, u.email as user_email, b.title as book_title
      FROM borrowings br
      JOIN users u ON br.user_id = u.id
      JOIN books b ON br.book_id = b.id
      ORDER BY br.id DESC
      LIMIT 6
    `);

    const returnedCount = await get('SELECT COUNT(*) as count FROM borrowings WHERE status = "returned"');
    const totalBorrowings = await get('SELECT COUNT(*) as count FROM borrowings');

    // Real monthly borrowing stats for the current year
    const rawMonthly = await all(`
      SELECT 
        CAST(strftime('%m', borrow_date) AS INTEGER) as month_num,
        COUNT(id) as borrowed,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned
      FROM borrowings
      WHERE strftime('%Y', borrow_date) = strftime('%Y', 'now')
      GROUP BY month_num
    `);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map((month, idx) => {
      const found = rawMonthly.find(m => m.month_num === (idx + 1));
      return {
        month,
        borrowed: found ? (found.borrowed || 0) : 0,
        returned: found ? (found.returned || 0) : 0
      };
    });

    res.json({
      total_books: totalBooks.count,
      total_users: totalUsers.count,
      active_borrowings: activeBorrowings.count,
      pending_requests: pendingRequests.count,
      overdue_count: overdueCount.count,
      returned_count: returnedCount.count,
      total_borrowings_count: totalBorrowings.count,
      active_readers_count: activeReadersTotal?.count || 0,
      active_readers_detail: activeReadersDetail,
      top_read_books: topReadBooks,
      recent_activity: recentActivity,
      monthly_trends: monthlyData
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard stats.' });
  }
});

// Get all borrowings with filtering
router.get('/borrowings', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT br.*, u.name as user_name, u.email as user_email, b.title as book_title, b.author as book_author, b.cover_url
      FROM borrowings br
      JOIN users u ON br.user_id = u.id
      JOIN books b ON br.book_id = b.id
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE br.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY br.id DESC`;

    const borrowings = await all(query, params);
    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching admin borrowings list:', error);
    res.status(500).json({ message: 'Failed to retrieve borrowings.' });
  }
});

// Update borrowing status (Approve, Reject, Mark Returned)
router.put('/borrowings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body; // 'approved', 'rejected', 'returned'

    if (!['approved', 'rejected', 'returned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const borrowing = await get('SELECT * FROM borrowings WHERE id = ?', [id]);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found.' });
    }

    const book = await get('SELECT * FROM books WHERE id = ?', [borrowing.book_id]);

    // Handle inventory adjustment based on status change
    if (status === 'approved' && borrowing.status === 'pending') {
      if (book.copies_available <= 0) {
        return res.status(400).json({ message: 'Cannot approve: No available copies remaining for this book.' });
      }
      // Decrement available copies
      await run('UPDATE books SET copies_available = copies_available - 1 WHERE id = ?', [borrowing.book_id]);
    } else if (status === 'returned' && (borrowing.status === 'approved' || borrowing.status === 'pending')) {
      // Increment available copies if returning from approved state
      if (borrowing.status === 'approved') {
        await run('UPDATE books SET copies_available = copies_available + 1 WHERE id = ?', [borrowing.book_id]);
      }
    }

    const returnDateVal = status === 'returned' ? new Date().toISOString() : borrowing.return_date;

    await run(`
      UPDATE borrowings 
      SET status = ?, admin_notes = ?, return_date = ?
      WHERE id = ?
    `, [status, admin_notes || null, returnDateVal, id]);

    res.json({ message: `Borrowing status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating borrowing status:', error);
    res.status(500).json({ message: 'Failed to update borrowing status.' });
  }
});

// List all registered users
router.get('/users', async (req, res) => {
  try {
    const users = await all(`
      SELECT u.*,
             COUNT(br.id) as total_borrowings,
             SUM(CASE WHEN br.status = 'approved' THEN 1 ELSE 0 END) as active_borrowings
      FROM users u
      LEFT JOIN borrowings br ON br.user_id = u.id
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users.' });
  }
});

// Analytics Reports (1 Day, 1 Week, 1 Month)
router.get('/reading-reports', async (req, res) => {
  try {
    const { period } = req.query; // 1day, 1week, 1month, all
    let timeCondition = "datetime('now', '-1 day')";
    let periodName = "Today (1 Day)";

    if (period === '1week') {
      timeCondition = "datetime('now', '-7 days')";
      periodName = "This Week (7 Days)";
    } else if (period === '1month') {
      timeCondition = "datetime('now', '-30 days')";
      periodName = "This Month (30 Days)";
    } else if (period === 'all') {
      timeCondition = "datetime('now', '-100 years')";
      periodName = "All Time";
    }

    // Top active student readers based on borrowings
    const topReaders = await all(`
      SELECT u.id, u.name, u.name_khmer, u.student_id, u.email, u.profile_photo, u.dorm_room, u.gender, u.major, COUNT(br.id) as read_sessions
      FROM borrowings br
      JOIN users u ON br.user_id = u.id
      WHERE br.borrow_date >= ${timeCondition}
      GROUP BY u.id, u.name, u.name_khmer, u.student_id, u.email, u.profile_photo, u.dorm_room, u.gender, u.major
      ORDER BY read_sessions DESC
      LIMIT 15
    `);

    // Student Borrowing & Return breakdown list (For Section IV)
    const studentBorrowReturnList = await all(`
      SELECT u.id, u.name, u.name_khmer, u.gender, u.major, u.student_id,
             COUNT(br.id) as total_borrowed,
             SUM(CASE WHEN br.status = 'returned' THEN 1 ELSE 0 END) as total_returned
      FROM borrowings br
      JOIN users u ON br.user_id = u.id
      WHERE br.borrow_date >= ${timeCondition}
      GROUP BY u.id, u.name, u.name_khmer, u.gender, u.major, u.student_id
      ORDER BY total_borrowed DESC
      LIMIT 20
    `);

    // Top requested books in period
    const topBooks = await all(`
      SELECT b.id, b.title, b.author, b.cover_url, c.name as category_name, COUNT(br.id) as period_reads
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE br.borrow_date >= ${timeCondition}
      GROUP BY b.id, b.title, b.author, b.cover_url, c.name
      ORDER BY period_reads DESC
      LIMIT 10
    `);

    // Borrowings in period (For Section III summary)
    const borrowingsSummary = await get(`
      SELECT 
        COUNT(*) as total_borrowed,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as total_returned,
        SUM(CASE WHEN status != 'returned' THEN 1 ELSE 0 END) as pending_return
      FROM borrowings
      WHERE borrow_date >= ${timeCondition}
    `);

    // Calculate male and female counts accurately from distinct active borrowers in period
    const activeStudentGenders = await all(`
      SELECT DISTINCT u.id, u.gender
      FROM borrowings br
      JOIN users u ON br.user_id = u.id
      WHERE br.borrow_date >= ${timeCondition}
    `);

    let maleCount = 0;
    let femaleCount = 0;
    activeStudentGenders.forEach(st => {
      const g = (st.gender || '').toString().trim();
      if (g === 'ស្រី' || g.toLowerCase() === 'female' || g.toLowerCase() === 'f') {
        femaleCount++;
      } else {
        maleCount++;
      }
    });

    res.json({
      period: period || '1day',
      period_name: periodName,
      generated_at: new Date().toISOString(),
      total_reads: borrowingsSummary?.total_borrowed || 0,
      top_books: topBooks,
      top_readers: topReaders,
      student_borrow_return_list: studentBorrowReturnList,
      borrowings_summary: {
        total_borrowed: borrowingsSummary?.total_borrowed || 0,
        total_returned: borrowingsSummary?.total_returned || 0,
        pending_return: borrowingsSummary?.pending_return || 0
      },
      gender_summary: {
        male: maleCount,
        female: femaleCount,
        total: activeStudentGenders.length
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report.' });
  }
});

module.exports = router;
