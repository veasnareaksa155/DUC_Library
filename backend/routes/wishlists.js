const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');

const router = express.Router();
router.use(authenticateToken);

// Get current user's wishlist
router.get('/my', async (req, res) => {
  try {
    const user_id = req.user.id;
    const allWishlists = await ORM.getAll('Wishlists');
    const userWishlists = allWishlists.filter(w => String(w.user_id) === String(user_id));
    
    // Return just the array of book IDs
    const bookIds = userWishlists.map(w => w.book_id);
    res.json(bookIds);
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    res.status(500).json({ message: 'Failed to fetch wishlists.' });
  }
});

// Toggle a book in the wishlist
router.post('/toggle', async (req, res) => {
  try {
    const user_id = req.user.id;
    const { book_id } = req.body;

    if (!book_id) {
      return res.status(400).json({ message: 'Book ID is required.' });
    }

    const allWishlists = await ORM.getAll('Wishlists');
    const existing = allWishlists.find(w => String(w.user_id) === String(user_id) && String(w.book_id) === String(book_id));

    const sse = require('../services/sse');

    if (existing) {
      // Remove it
      await ORM.remove('Wishlists', existing.id);
      sse.broadcastToAdmins('wishlist_trends_updated', { type: 'wishlists' });
      
      const updatedWishlists = await ORM.getAll('Wishlists');
      const totalCount = updatedWishlists.filter(w => String(w.book_id) === String(book_id)).length;
      sse.broadcast('book_wishlist_updated', { book_id: String(book_id), total_wishlists: totalCount });
      
      sse.emitToUser(user_id, 'user_wishlist_updated', { action: 'removed', book_id: String(book_id) });
      return res.json({ message: 'Removed from wishlist', status: 'removed' });
    } else {
      // Add it
      await ORM.insert('Wishlists', {
        user_id: String(user_id),
        book_id: String(book_id),
        created_at: new Date().toISOString()
      });
      sse.broadcastToAdmins('wishlist_trends_updated', { type: 'wishlists' });
      
      const updatedWishlists = await ORM.getAll('Wishlists');
      const totalCount = updatedWishlists.filter(w => String(w.book_id) === String(book_id)).length;
      sse.broadcast('book_wishlist_updated', { book_id: String(book_id), total_wishlists: totalCount });
      
      sse.emitToUser(user_id, 'user_wishlist_updated', { action: 'added', book_id: String(book_id) });
      return res.json({ message: 'Added to wishlist', status: 'added' });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ message: 'Failed to toggle wishlist.' });
  }
});

// Clear current user's wishlist
router.delete('/clear', async (req, res) => {
  try {
    const user_id = req.user.id;
    const allWishlists = await ORM.getAll('Wishlists');
    const userWishlists = allWishlists.filter(w => String(w.user_id) === String(user_id));

    const sse = require('../services/sse');
    
    // Track which books are affected to broadcast updates
    const affectedBooks = new Set();
    const idsToRemove = [];
    
    for (const w of userWishlists) {
      affectedBooks.add(w.book_id);
      idsToRemove.push(w.id);
    }
    
    if (idsToRemove.length > 0) {
      await ORM.removeMany('Wishlists', idsToRemove);
    }
    
    sse.broadcastToAdmins('wishlist_trends_updated', { type: 'wishlists' });
    
    const updatedWishlists = await ORM.getAll('Wishlists');
    for (const book_id of affectedBooks) {
      const totalCount = updatedWishlists.filter(w => String(w.book_id) === String(book_id)).length;
      sse.broadcast('book_wishlist_updated', { book_id: String(book_id), total_wishlists: totalCount });
    }

    sse.emitToUser(user_id, 'user_wishlist_updated', { action: 'cleared' });

    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Failed to clear wishlist.' });
  }
});

module.exports = router;
