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

// Update category (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const categories = await ORM.getAll('Categories');
    const categoryToUpdate = categories.find(c => String(c.id) === String(categoryId));
    
    if (!categoryToUpdate) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Check unique name if changing name
    if (categoryToUpdate.name.toLowerCase() !== name.toLowerCase()) {
      const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: 'Category name already exists.' });
      }
    }

    const updatedData = {
      name,
      description: description || '',
      icon: icon || 'BookOpen'
    };

    const updated = await ORM.update('Categories', categoryId, updatedData);

    res.json({
      ...updated,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category.' });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category exists
    const categories = await ORM.getAll('Categories');
    const category = categories.find(c => String(c.id) === String(categoryId));
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Check if books are using this category
    const books = await ORM.getAll('Books');
    const booksInCategory = books.filter(b => String(b.category_id) === String(categoryId));
    
    if (booksInCategory.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category because it contains ${booksInCategory.length} book(s). Please move these books to another category first.` 
      });
    }

    await ORM.remove('Categories', categoryId);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category.' });
  }
});

module.exports = router;
