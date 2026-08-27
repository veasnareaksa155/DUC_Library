const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');

const router = express.Router();

// GET all settings (Public / User Authenticated)
router.get('/', async (req, res) => {
  try {
    const settingsRows = await ORM.getAll('Settings');
    const settingsMap = {};
    
    for (const row of settingsRows) {
      if (row.setting_key) {
        try {
          // Attempt to parse JSON arrays/objects, fallback to raw string
          settingsMap[row.setting_key] = JSON.parse(row.setting_value);
        } catch {
          settingsMap[row.setting_key] = row.setting_value;
        }
      }
    }
    
    // Provide defaults if not set in DB
    if (!settingsMap['borrowing_durations']) {
      settingsMap['borrowing_durations'] = [7, 14, 21, 30];
    }
    
    res.json(settingsMap);
  } catch (err) {
    console.error('[Settings] Error fetching settings:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST setting (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;
    if (!setting_key) return res.status(400).json({ message: 'setting_key is required' });

    // Store as JSON string if it's an object/array
    const valueToStore = typeof setting_value === 'object' ? JSON.stringify(setting_value) : String(setting_value);

    // Check if it exists
    const existing = await ORM.find('Settings', s => s.setting_key === setting_key);
    
const sse = require('../services/sse');

    if (existing && existing.length > 0) {
      // Update
      const id = existing[0].id;
      await ORM.update('Settings', id, { 
        setting_value: valueToStore,
        updated_at: new Date().toISOString()
      });
    } else {
      // Insert
      await ORM.insert('Settings', {
        setting_key,
        setting_value: valueToStore,
        updated_at: new Date().toISOString()
      });
    }

    // Broadcast change in real-time to all connected users
    sse.broadcast('settings_updated', { setting_key, setting_value });

    res.json({ message: 'Setting updated successfully', setting_key, setting_value });
  } catch (err) {
    console.error('[Settings] Error updating setting:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
