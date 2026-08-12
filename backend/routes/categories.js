const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await ORM.getAll('Categories');
    const books = await ORM.getAll('Books');

    const formattedCategories = categories.map(cat => {
      // Count books for this category
      const bookCount = books.filter(b => String(b.category_id) === String(cat.id)).length;
      
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        icon: cat.icon || 'BookOpen',
        book_count: bookCount
      };
    });

    formattedCategories.sort((a, b) => a.name.localeCompare(b.name));

    res.json(formattedCategories);
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

    // Check unique name
    const categories = await ORM.getAll('Categories');
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    
    if (existing) {
      return res.status(400).json({ message: 'Category name already exists.' });
    }

    const newCategory = {
      name,
      description: description || '',
      icon: icon || 'BookOpen'
    };

    const inserted = await ORM.insert('Categories', newCategory);

    res.status(201).json({
      ...inserted,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category.' });
  }
});

module.exports = router;
