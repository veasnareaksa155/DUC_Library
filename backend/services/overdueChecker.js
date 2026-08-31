const ORM = require('../googleSheetsORM');
const pushService = require('./pushService');
const sse = require('./sse');

let intervalId = null;

async function checkOverdueBooks() {
  try {
    const borrowings = await ORM.getAll('Borrowings');
    
    // Only check approved and not-yet-returned borrowings
    const activeBorrowings = borrowings.filter(b => b.status === 'approved');
    const now = new Date();

    for (const borrow of activeBorrowings) {
      if (!borrow.due_date) continue;
      
      const dueDate = new Date(borrow.due_date);
      
      // 1. DUE TODAY REMINDER
      const isDueToday = 
        dueDate.getFullYear() === now.getFullYear() &&
        dueDate.getMonth() === now.getMonth() &&
        dueDate.getDate() === now.getDate();
        
      if (isDueToday && now < dueDate && borrow.due_today_notified !== 'true') {
        const book = await ORM.getById('Books', borrow.book_id);
        const bookTitle = book ? book.title : 'a book';
        
        await ORM.update('Borrowings', borrow.id, { due_today_notified: 'true' });
        
        await pushService.sendPushNotification(borrow.user_id, {
          title: 'Return Reminder ⏰',
          body: `Your borrowed book "${bookTitle}" is due for return today!`,
          icon: '/duc-logo.png',
          data: { url: '/borrowings' }
        });
        
        sse.sendToUser(borrow.user_id, 'notification_alert', {
          title: 'Return Reminder ⏰',
          message: `Your borrowed book "${bookTitle}" is due today.`
        });
        
        await ORM.insert('Notifications', {
          user_id: borrow.user_id,
          title: 'Return Reminder',
          message: `Your borrowed book "${bookTitle}" is due for return today.`,
          type: 'info',
          is_read: 'false'
        });
        
        console.log(`[OverdueChecker] Sent due today reminder to user ${borrow.user_id}`);
      }
      
      // 2. OVERDUE NOTIFICATION (If the book is overdue and we haven't notified the user yet)
      if (now > dueDate && borrow.overdue_notified !== 'true') {
        
        const book = await ORM.getById('Books', borrow.book_id);
        const bookTitle = book ? book.title : 'a book';
        
        // Update database so we don't spam them
        await ORM.update('Borrowings', borrow.id, { overdue_notified: 'true' });
        
        // Notify the user via Web Push
        await pushService.sendPushNotification(borrow.user_id, {
          title: 'Book Overdue! ⚠️',
          body: `Your borrowed book "${bookTitle}" is overdue. Please return it to the library as soon as possible.`,
          icon: '/duc-logo.png',
          data: {
            url: '/borrowings'
          }
        });
        
        // Also send a real-time SSE event to the user's connected app instance
        sse.sendToUser(borrow.user_id, 'notification_alert', {
          title: 'Book Overdue!',
          message: `Your borrowed book "${bookTitle}" is overdue.`
        });
        
        // Add a notification to their inbox
        await ORM.insert('Notifications', {
          user_id: borrow.user_id,
          title: 'Book Overdue',
          message: `Your borrowed book "${bookTitle}" is overdue and must be returned.`,
          type: 'warning',
          is_read: 'false'
        });
        
        console.log(`[OverdueChecker] Sent overdue notification to user ${borrow.user_id} for book ${borrow.book_id}`);
      }
    }
  } catch (error) {
    console.error('[OverdueChecker] Error checking overdue books:', error);
  }
}

function start() {
  if (intervalId) return;
  // Run every 1 minute
  intervalId = setInterval(checkOverdueBooks, 60 * 1000);
  console.log('[OverdueChecker] Started background service');
  
  // Also run immediately on startup
  checkOverdueBooks();
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[OverdueChecker] Stopped background service');
  }
}

module.exports = {
  start,
  stop,
  checkOverdueBooks
};
