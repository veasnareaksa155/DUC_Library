const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');

const router = express.Router();

// Get all categories (flat list with parent_id info + book counts)
router.get('/', async (req, res) => {
  try {
    const categories = await ORM.getAll('Categories');
    const books = await ORM.getAll('Books');

    // Helper to get all descendant category IDs (recursive)
    const getDescendantIds = (catId) => {
      const ids = new Set([String(catId)]);
      const queue = [String(catId)];
      while (queue.length > 0) {
        const currId = queue.shift();
        for (const c of categories) {
          if (String(c.parent_id) === currId && !ids.has(String(c.id))) {
            ids.add(String(c.id));
            queue.push(String(c.id));
          }
        }
      }
      return ids;
    };

    const formattedCategories = categories.map(cat => {
      const directBookCount = books.filter(b => String(b.category_id) === String(cat.id)).length;
      const allDescendantIds = getDescendantIds(cat.id);
      const totalBookCount = books.filter(b => allDescendantIds.has(String(b.category_id))).length;

      return {
        id: cat.id,
        name: cat.name,
        name_km: cat.name_km || '',
        description: cat.description || '',
        icon: cat.icon || 'BookOpen',
        parent_id: cat.parent_id || null,
        sort_order: cat.sort_order !== undefined && cat.sort_order !== '' ? Number(cat.sort_order) : 9999,
        book_count: directBookCount,
        total_book_count: totalBookCount
      };
    });

    // Sort by sort_order, then alphabetically as fallback
    formattedCategories.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

// Create new category (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, name_km, description, icon, parent_id } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const categories = await ORM.getAll('Categories');
    const existing = categories.find(c => 
      c.name.toLowerCase() === name.toLowerCase() && 
      String(c.parent_id || '') === String(parent_id || '')
    );
    if (existing) {
      return res.status(400).json({ message: 'Category name already exists under this parent.' });
    }

    // Validate parent_id if provided
    if (parent_id) {
      const parent = categories.find(c => String(c.id) === String(parent_id));
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found.' });
      }
      // Any existing category can be a parent, allowing arbitrary nesting levels!
    }

    const newCategory = {
      name,
      name_km: name_km || '',
      description: description || '',
      icon: icon || 'BookOpen',
      parent_id: parent_id || '',
      sort_order: String(categories.length) // default to end
    };

    const inserted = await ORM.insert('Categories', newCategory);

    const sse = require('../services/sse');
    sse.broadcast('catalog_updated', { type: 'categories' });

    res.status(201).json({ ...inserted, message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category.' });
  }
});

// Reorder categories (Admin only) - MUST be before /:id to avoid Express matching 'reorder' as an id
router.put('/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: '1', sort_order: 0 }, { id: '2', sort_order: 1 }, ...]
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: 'orders array is required.' });
    }

    const categories = await ORM.getAll('Categories');

    // Update sort_order for each category in the provided list
    for (const { id, sort_order } of orders) {
      const cat = categories.find(c => String(c.id) === String(id));
      if (cat) {
        await ORM.update('Categories', id, {
          name: cat.name,
          name_km: cat.name_km || '',
          description: cat.description || '',
          icon: cat.icon || 'BookOpen',
          parent_id: cat.parent_id || '',
          sort_order: String(sort_order)
        });
      }
    }

    const sse = require('../services/sse');
    sse.broadcast('catalog_updated', { type: 'categories' });

    res.json({ message: 'Categories reordered successfully.' });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ message: 'Failed to reorder categories.' });
  }
});

// Update category (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, name_km, description, icon, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const categories = await ORM.getAll('Categories');
    const categoryToUpdate = categories.find(c => String(c.id) === String(categoryId));

    if (!categoryToUpdate) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (categoryToUpdate.name.toLowerCase() !== name.toLowerCase() || String(categoryToUpdate.parent_id || '') !== String(parent_id || '')) {
      const existing = categories.find(c => 
        String(c.id) !== String(categoryId) && 
        c.name.toLowerCase() === name.toLowerCase() && 
        String(c.parent_id || '') === String(parent_id || '')
      );
      if (existing) {
        return res.status(400).json({ message: 'Category name already exists under this parent.' });
      }
    }

    if (parent_id) {
      if (String(parent_id) === String(categoryId)) {
        return res.status(400).json({ message: 'A category cannot be its own parent.' });
      }
      const parent = categories.find(c => String(c.id) === String(parent_id));
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found.' });
      }
      // Check for circular reference: parent cannot be a descendant of categoryId
      let curr = parent;
      while (curr && curr.parent_id) {
        if (String(curr.parent_id) === String(categoryId)) {
          return res.status(400).json({ message: 'Cannot set a descendant category as parent (circular reference).' });
        }
        curr = categories.find(c => String(c.id) === String(curr.parent_id));
      }
    }

    const updatedData = {
      name,
      name_km: name_km || '',
      description: description || '',
      icon: icon || 'BookOpen',
      parent_id: parent_id || '',
      sort_order: categoryToUpdate.sort_order || ''
    };

    const updated = await ORM.update('Categories', categoryId, updatedData);

    const sse = require('../services/sse');
    sse.broadcast('catalog_updated', { type: 'categories' });

    res.json({ ...updated, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category.' });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;

    const categories = await ORM.getAll('Categories');
    const category = categories.find(c => String(c.id) === String(categoryId));

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Prevent deleting if it has sub-categories
    const children = categories.filter(c => String(c.parent_id) === String(categoryId));
    if (children.length > 0) {
      return res.status(400).json({
        message: `Cannot delete this category because it has ${children.length} sub-categorie(s). Please delete or reassign the sub-categories first.`
      });
    }

    const books = await ORM.getAll('Books');
    const booksInCategory = books.filter(b => String(b.category_id) === String(categoryId));
    if (booksInCategory.length > 0) {
      return res.status(400).json({
        message: `Cannot delete category because it contains ${booksInCategory.length} book(s). Please move these books to another category first.`
      });
    }

    await ORM.remove('Categories', categoryId);

    const sse = require('../services/sse');
    sse.broadcast('catalog_updated', { type: 'categories' });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category.' });
  }
});


module.exports = router;
