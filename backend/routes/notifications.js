const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET all notifications for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await ORM.find('Notifications', n => String(n.user_id) === String(userId));
    
    // Sort descending by created_at
    notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(notifications);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new notification (Admins or System only, usually)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Basic authorization check if needed. We assume only admins or the system can send to other users.
    const { title, message, type, target_user_id } = req.body;

    if (!target_user_id || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newNotif = {
      id: Date.now().toString(),
      user_id: target_user_id,
      title,
      message,
      type: type || 'info',
      is_read: 'false',
      created_at: new Date().toISOString()
    };

    const inserted = await ORM.insert('Notifications', newNotif);
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Failed to create notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const [notification] = await ORM.find('Notifications', n => String(n.id) === String(notificationId) && String(n.user_id) === String(userId));

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.is_read = 'true';
    await ORM.update('Notifications', notificationId, notification);
    
    res.json(notification);
  } catch (error) {
    console.error('Failed to update notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT mark all notifications as read for current user
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await ORM.find('Notifications', n => String(n.user_id) === String(userId) && n.is_read !== 'true');

    for (const notif of notifications) {
      notif.is_read = 'true';
      await ORM.update('Notifications', notif.id, notif);
    }
    
    res.json({ message: 'All notifications marked as read', count: notifications.length });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a specific notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Verify it belongs to user
    const [notification] = await ORM.find('Notifications', n => String(n.id) === String(notificationId) && String(n.user_id) === String(userId));
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await ORM.remove('Notifications', notificationId);
    res.json({ message: 'Notification removed' });
  } catch (error) {
    console.error('Failed to remove notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE all notifications for the current user
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await ORM.find('Notifications', n => String(n.user_id) === String(userId));

    for (const notif of notifications) {
      await ORM.remove('Notifications', notif.id);
    }
    
    res.json({ message: 'All notifications removed', count: notifications.length });
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
