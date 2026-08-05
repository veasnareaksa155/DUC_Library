const express = require('express');
const { all, run } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await all(`
      SELECT c.*, COUNT(b.id) as book_count 
      FROM categories c 
      LEFT JOIN books b ON b.category_id = c.id 
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

// Create new category (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const result = await run(
      'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
      [name, description || '', icon || 'BookOpen']
    );

    res.status(201).json({
      id: result.id,
      name,
      description,
      icon: icon || 'BookOpen',
      message: 'Category created successfully'
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'Category name already exists.' });
    }
    res.status(500).json({ message: 'Failed to create category.' });
  }
});

module.exports = router;
