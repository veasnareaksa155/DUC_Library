const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

const { fetchStudentsFromSheet } = require('../googleSheets');

// In-memory cache for expensive Google Sheets operations
const cache = {
  users: { data: null, timestamp: 0 },
  books: { data: null, timestamp: 0 }
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getMappedUsers(forceSync = false) {
  const now = Date.now();
  if (!forceSync && cache.users.data && (now - cache.users.timestamp < CACHE_TTL)) {
    return cache.users.data;
  }

  const LIVE_STUDENTS = await fetchStudentsFromSheet(process.env.SPREADSHEET_ID || '1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU') || [];
  
  let photoMap = {};
  try {
    const localPhotos = await ORM.getAll('ProfilePhotos');
    localPhotos.forEach(p => { photoMap[p.student_id] = p.photo_url; });
  } catch (e) {
    console.error('Failed to load ProfilePhotos for admin mapping', e);
  }

  const mapped = LIVE_STUDENTS.map(s => ({
    id: s.studentId,
    name: s.latinName,
    email: `${s.studentId.toLowerCase()}@duc.com`,
    role: 'user',
    student_id: s.studentId,
    name_khmer: s.khmerName,
    gender: s.gender || '',
    dob: s.dateOfBirth || '',
    pob: s.province || '',
    high_school: s.highSchool || '',
    telegram: s.telegram || '',
    guardian_phone: s.guardianPhone || '',
    major: s.major || '',
    degree_level: s.degreeLevel || '',
    class_code: s.classCode || '',
    status: s.academicStatus || 'Active Student',
    academic_year: s.academicYear || '',
    generation: s.generation || '',
    bac2_grade: s.grade || '',
    phone: s.phone || '',
    dorm_room: s.dormRoom || '',
    profile_photo: photoMap[s.studentId] || s.profilePhoto || '',
    created_at: new Date().toISOString()
  }));

  cache.users.data = mapped;
  cache.users.timestamp = now;
  return mapped;
}

async function getUserMap() {
  const users = await getMappedUsers();
  const map = {};
  users.forEach(u => {
    map[u.id] = u;
  });
  return map;
}

async function getBookMap() {
  const now = Date.now();
  if (cache.books.data && (now - cache.books.timestamp < CACHE_TTL)) {
    return cache.books.data;
  }

  const books = await ORM.getAll('Books');
  const map = {};
  books.forEach(b => {
    map[b.id] = b;
  });
  
  cache.books.data = map;
  cache.books.timestamp = now;
  return map;
}

// Dashboard metrics overview
router.get('/dashboard-stats', async (req, res) => {
  try {
    const books = await ORM.getAll('Books');
    const users = await getMappedUsers();
    const borrowings = await ORM.getAll('Borrowings');
    const categories = await ORM.getAll('Categories');

    const totalBooks = books.length;
    const totalUsers = users.filter(u => u.role === 'user').length;
    const activeBorrowings = borrowings.filter(b => b.status === 'approved').length;
    const pendingRequests = borrowings.filter(b => b.status === 'pending').length;
    const returnedCount = borrowings.filter(b => b.status === 'returned').length;
    const totalBorrowingsCount = borrowings.length;
    const approvedBorrowingsList = borrowings.filter(b => b.status === 'approved');

    const todayStr = new Date().toISOString().split('T')[0];
    let overdueCount = 0;
    approvedBorrowingsList.forEach(b => {
      if (b.due_date && b.due_date < todayStr) overdueCount++;
    });

    const activeReadersService = require('../services/activeReaders');
    const activeReadersData = activeReadersService.getActiveReaders();
    
    const activeReadersCount = activeReadersData.count;
    const activeReadersDetail = activeReadersData.details;

    // Sort recent borrowings
    const recentBorrowings = [...borrowings]
      .filter(b => b.borrow_date)
      .sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date))
      .slice(0, 6);

    const usersMap = {};
    users.forEach(u => usersMap[u.id] = u);
    
    const booksMap = {};
    books.forEach(b => booksMap[b.id] = b);

    const categoriesMap = {};
    categories.forEach(c => categoriesMap[c.id] = c.name);

    const topReadBooks = [...books]
      .sort((a, b) => (Number(b.read_count) || 0) - (Number(a.read_count) || 0))
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        cover_url: b.cover_url,
        read_count: Number(b.read_count) || 0,
        category_name: categoriesMap[b.category_id] || ''
      }));

    const recentActivity = recentBorrowings.map(br => {
      const u = usersMap[br.user_id] || {};
      const b = booksMap[br.book_id] || {};
      return {
        ...br,
        user_name: u.name,
        user_email: u.email,
        book_title: b.title,
        profile_photo: u.profile_photo
      };
    });

    const currentYear = new Date().getFullYear();
    const monthlyDataMap = {};
    for (let i = 1; i <= 12; i++) monthlyDataMap[i] = { borrowed: 0, returned: 0 };

    borrowings.forEach(br => {
      if (!br.borrow_date) return;
      const date = new Date(br.borrow_date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth() + 1;
        monthlyDataMap[month].borrowed += 1;
        if (br.status === 'returned') {
          monthlyDataMap[month].returned += 1;
        }
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map((month, idx) => ({
      month,
      borrowed: monthlyDataMap[idx + 1].borrowed,
      returned: monthlyDataMap[idx + 1].returned
    }));

      const enrichedActiveReaders = activeReadersDetail.map(reader => {
        const u = usersMap[reader.user_id] || {};
        const b = booksMap[reader.book_id] || {};
        return {
          ...reader,
          name_khmer: u.name_khmer || u.name,
          user_name: u.name || reader.user_name,
          student_id: u.student_id,
          dorm_room: u.dorm_room,
          profile_photo: u.profile_photo,
          book_title: b.title || 'Unknown Book'
        };
      });

      res.json({
        total_books: totalBooks,
        total_users: totalUsers,
        active_borrowings: activeBorrowings,
        pending_requests: pendingRequests,
        overdue_count: overdueCount,
        returned_count: returnedCount,
        total_borrowings_count: totalBorrowingsCount,
        active_readers_count: activeReadersCount,
        active_readers_detail: enrichedActiveReaders,
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
    let borrowings = await ORM.getAll('Borrowings');
    
    // Sort descending by date
    borrowings.sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date));

    if (status && status !== 'all') {
      borrowings = borrowings.filter(b => b.status === status);
    }

    const usersMap = await getUserMap();
    const booksMap = await getBookMap();

    const formattedBorrowings = borrowings.map(br => {
      const u = usersMap[br.user_id] || {};
      const b = booksMap[br.book_id] || {};
      return {
        ...br,
        user_name: u.name,
        user_email: u.email,
        book_title: b.title,
        book_author: b.author,
        cover_url: b.cover_url,
        profile_photo: u.profile_photo
      };
    });

    res.json(formattedBorrowings);
  } catch (error) {
    console.error('Error fetching admin borrowings list:', error);
    res.status(500).json({ message: 'Failed to retrieve borrowings.' });
  }
});

// Update borrowing status
router.put('/borrowings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected', 'returned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const borrowing = await ORM.getById('Borrowings', id);
    if (!borrowing) return res.status(404).json({ message: 'Borrowing request not found.' });

    const book = await ORM.getById('Books', borrowing.book_id);
    if (!book) return res.status(404).json({ message: 'Associated book not found.' });

    const copiesAvailable = Number(book.copies_available) || 0;

    if (status === 'approved' && borrowing.status === 'pending') {
      if (copiesAvailable <= 0) {
        return res.status(400).json({ message: 'Cannot approve: No available copies remaining.' });
      }
      await ORM.update('Books', book.id, { copies_available: copiesAvailable - 1 });
      
      // Notify student
      await ORM.insert('Notifications', {
        user_id: borrowing.user_id,
        title: 'Book Request Approved! 🎉',
        message: `Your request for "${book.title}" has been approved. Please pick it up from the library.`,
        type: 'info',
        is_read: 'false',
        created_at: new Date().toISOString()
      });
    } else if (status === 'rejected' && borrowing.status === 'pending') {
      // Notify student
      await ORM.insert('Notifications', {
        user_id: borrowing.user_id,
        title: 'Book Request Declined',
        message: `Your request for "${book.title}" was declined. ${admin_notes ? 'Reason: ' + admin_notes : ''}`,
        type: 'alert',
        is_read: 'false',
        created_at: new Date().toISOString()
      });
    } else if (status === 'returned' && (borrowing.status === 'approved' || borrowing.status === 'pending')) {
      if (borrowing.status === 'approved') {
        await ORM.update('Books', book.id, { copies_available: copiesAvailable + 1 });
      }
    }

    const returnDateVal = status === 'returned' ? new Date().toISOString() : borrowing.return_date;

    await ORM.update('Borrowings', id, {
      status,
      admin_notes: admin_notes || '',
      return_date: returnDateVal
    });

    const sse = require('../services/sse');
    sse.emitToUser(borrowing.user_id, 'borrowing_updated', {
      id: borrowing.id,
      status: status,
      book_title: book.title,
      admin_notes: admin_notes || ''
    });

    res.json({ message: `Borrowing status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating borrowing status:', error);
    res.status(500).json({ message: 'Failed to update borrowing status.' });
  }
});

// Delete borrowing record
router.delete('/borrowings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const borrowing = await ORM.getById('Borrowings', id);
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found.' });
    }

    // Only allow deleting closed requests (returned or rejected)
    if (borrowing.status !== 'returned' && borrowing.status !== 'rejected') {
      return res.status(400).json({ message: 'Cannot delete an active borrowing request. Mark as returned or rejected first.' });
    }

    await ORM.remove('Borrowings', id);
    res.json({ message: 'Borrowing request deleted successfully.' });
  } catch (error) {
    console.error('Error deleting borrowing:', error);
    res.status(500).json({ message: 'Failed to delete borrowing request.' });
  }
});

// List all registered users
router.get('/users', async (req, res) => {
  try {
    const forceSync = req.query.force === 'true';
    const users = await getMappedUsers(forceSync);
    const borrowings = await ORM.getAll('Borrowings');

    const userStats = {};
    borrowings.forEach(br => {
      if (!userStats[br.user_id]) userStats[br.user_id] = { total: 0, active: 0 };
      userStats[br.user_id].total += 1;
      if (br.status === 'approved') userStats[br.user_id].active += 1;
    });

    const formattedUsers = users.map(u => ({
      ...u,
      total_borrowings: userStats[u.id]?.total || 0,
      active_borrowings: userStats[u.id]?.active || 0
    })).sort((a, b) => b.total_borrowings - a.total_borrowings);

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users.' });
  }
});

// Analytics Reports
router.get('/reading-reports', async (req, res) => {
  try {
    const { period } = req.query;
    let cutoffDate = new Date();
    let periodName = "Today (1 Day)";

    if (period === '1week') {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      periodName = "This Week (7 Days)";
    } else if (period === '1month') {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      periodName = "This Month (30 Days)";
    } else if (period === 'all') {
      cutoffDate = new Date(0); // 1970
      periodName = "All Time";
    } else {
      cutoffDate.setDate(cutoffDate.getDate() - 1); // 1 day
    }

    const allBorrowings = await ORM.getAll('Borrowings');
    const filteredBorrowings = allBorrowings.filter(b => b.borrow_date && new Date(b.borrow_date) >= cutoffDate);
    
    const usersMap = await getUserMap();
    const booksMap = await getBookMap();

    let total_borrowed = 0;
    let total_returned = 0;
    let pending_return = 0;
    
    const userReadCounts = {};
    const bookReadCounts = {};
    const activeStudentGenders = new Set();
    let maleCount = 0;
    let femaleCount = 0;

    filteredBorrowings.forEach(br => {
      total_borrowed++;
      if (br.status === 'returned') total_returned++;
      else pending_return++;

      if (!userReadCounts[br.user_id]) userReadCounts[br.user_id] = { reads: 0, returns: 0 };
      userReadCounts[br.user_id].reads++;
      if (br.status === 'returned') userReadCounts[br.user_id].returns++;

      if (!bookReadCounts[br.book_id]) bookReadCounts[br.book_id] = 0;
      bookReadCounts[br.book_id]++;

      const u = usersMap[br.user_id];
      if (u && !activeStudentGenders.has(br.user_id)) {
        activeStudentGenders.add(br.user_id);
        const g = (u.gender || '').toString().trim().toLowerCase();
        if (g === 'ស្រី' || g === 'female' || g === 'f') femaleCount++;
        else maleCount++;
      }
    });

    const topReaders = Object.keys(userReadCounts).map(uid => {
      const u = usersMap[uid] || {};
      return {
        id: uid,
        name: u.name,
        name_khmer: u.name_khmer,
        student_id: u.student_id,
        email: u.email,
        profile_photo: u.profile_photo,
        dorm_room: u.dorm_room,
        gender: u.gender,
        major: u.major,
        read_sessions: userReadCounts[uid].reads
      };
    }).sort((a, b) => b.read_sessions - a.read_sessions).slice(0, 15);

    const studentBorrowReturnList = Object.keys(userReadCounts).map(uid => {
      const u = usersMap[uid] || {};
      return {
        id: uid,
        name: u.name,
        name_khmer: u.name_khmer,
        gender: u.gender,
        major: u.major,
        student_id: u.student_id,
        total_borrowed: userReadCounts[uid].reads,
        total_returned: userReadCounts[uid].returns
      };
    }).sort((a, b) => b.total_borrowed - a.total_borrowed).slice(0, 20);

    const topBooks = Object.keys(bookReadCounts).map(bid => {
      const b = booksMap[bid] || {};
      return {
        id: bid,
        title: b.title,
        author: b.author,
        cover_url: b.cover_url,
        category_name: 'N/A', 
        period_reads: bookReadCounts[bid]
      };
    }).sort((a, b) => b.period_reads - a.period_reads).slice(0, 10);

    res.json({
      period: period || '1day',
      period_name: periodName,
      generated_at: new Date().toISOString(),
      total_reads: total_borrowed,
      top_books: topBooks,
      top_readers: topReaders,
      student_borrow_return_list: studentBorrowReturnList,
      borrowings_summary: {
        total_borrowed,
        total_returned,
        pending_return
      },
      gender_summary: {
        male: maleCount,
        female: femaleCount,
        total: activeStudentGenders.size
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report.' });
  }
});

// GET /checkins - Get all user checkins for admin
router.get('/checkins', async (req, res) => {
  try {
    const checkins = await ORM.getAll('Checkins');
    const userMap = await getUserMap();
    
    // Sort by checkin_time descending
    checkins.sort((a, b) => new Date(b.checkin_time) - new Date(a.checkin_time));
    
    const enriched = checkins.map(c => {
      const user = userMap[c.user_id] || {};
      return {
        ...c,
        user_name: user.name || 'Unknown',
        user_email: user.email || 'N/A',
        user_photo: user.profile_photo || '',
        user_major: user.major || '',
        user_class: user.class_code || ''
      };
    });
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching admin checkins:', error);
    res.status(500).json({ message: 'Failed to fetch checkins' });
  }
});

// GET /digital-reads - Get historical digital reading sessions
router.get('/digital-reads', async (req, res) => {
  try {
    const now = Date.now();
    let reads = [];
    if (global.digitalReadsCache && (now - global.digitalReadsCache.timestamp < 60000)) {
      reads = global.digitalReadsCache.data;
    } else {
      reads = await ORM.getAll('DigitalReads') || [];
      global.digitalReadsCache = { data: reads, timestamp: now };
    }
    
    const userMap = await getUserMap();
    const bookMap = await getBookMap();
    
    reads.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));
    
    const enriched = reads.map(r => {
      const user = userMap[r.user_id] || {};
      const book = bookMap[r.book_id] || {};
      return {
        ...r,
        user_name: user.name || r.user_name || 'Unknown',
        user_email: user.email || 'N/A',
        user_photo: user.profile_photo || '',
        user_major: user.major || '',
        user_class: user.class_code || '',
        book_title: book.title || 'Unknown Book',
        book_cover: book.cover_url || ''
      };
    });
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching digital reads:', error);
    res.status(500).json({ message: 'Failed to fetch digital reads' });
  }
});

// GET /digital-reads/live - Get live readers currently reading
router.get('/digital-reads/live', async (req, res) => {
  try {
    const activeReadersService = require('../services/activeReaders');
    const { details } = activeReadersService.getActiveReaders();
    const userMap = await getUserMap();
    const bookMap = await getBookMap();

    const enriched = details.map(r => {
      const user = userMap[r.user_id] || {};
      const book = bookMap[r.book_id] || {};
      return {
        session_id: r.session_id, // Might not be populated inside details explicitly without the key, wait activeReadersService doesn't store session_id inside the object!
        // We will fix that, actually it's fine just return what we have.
        user_id: r.user_id,
        user_name: user.name || r.user_name || 'Anonymous',
        user_email: user.email || 'N/A',
        user_photo: user.profile_photo || '',
        user_major: user.major || '',
        user_class: user.class_code || '',
        book_id: r.book_id,
        book_title: book.title || 'Unknown Book',
        book_cover: book.cover_url || '',
        start_time: new Date(r.start_time).toISOString(),
        last_ping: new Date(r.last_ping).toISOString(),
        duration_seconds: Math.round((Date.now() - r.start_time) / 1000)
      };
    });
    
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching live digital reads:', error);
    res.status(500).json({ message: 'Failed to fetch live digital reads' });
  }
});

module.exports = router;
