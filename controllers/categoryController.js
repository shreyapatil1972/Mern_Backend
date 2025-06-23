const Category = require('../models/categoryModel');
const path = require('path');
const fs = require('fs');
const { Types } = require('mongoose');

const capitalizeName = (str) => {
  if (!str) return '';
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
};

// Create Category (Admin only)
const createCategory = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const rawName = req.body?.name;
    const name = capitalizeName(rawName);
    const image = req.file ? req.file.filename : null;
    const createdBy = req.user.id;

    if (!name) return res.status(400).json({ message: "Category name is required" });
    if (!image) return res.status(400).json({ message: "Category image is required" });

    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid image format. Allowed: JPEG, PNG, WEBP.' });
      }
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const newCategory = await Category.create({ name, image, createdBy });

    res.status(200).json({
      message: "Category created successfully",
      category: newCategory,
      success: true
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Categories (Public)
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    const modified = categories.map(category => ({
      _id: category._id,
      name: category.name,
      image: category.image ? `http://localhost:8000/uploads/${category.image}` : null
    }));

    res.status(200).json({ success: true, categories: modified });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Category by ID (Public)
const getCategoryByID = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const modified = {
      _id: category._id,
      name: category.name,
      image: category.image ? `http://localhost:8000/uploads/${category.image}` : null
    };

    res.status(200).json({ success: true, category: modified });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Category (Admin only)
const updateCategory = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const { id } = req.params;
    let name = req.body.name;
    const updatedBy = req.user.id;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.', success: false });
    }

    const existing = await Category.findOne({ name: capitalizeName(name), _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({ message: "Another category with this name already exists." });
    }

    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid image format. Allowed: JPEG, PNG, WEBP.' });
      }

      // Delete old image
      if (category.image) {
        const oldImagePath = path.join(__dirname, '../uploads', category.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Failed to delete old image:', err);
        });
      }
    }

    name = capitalizeName(name);
    const image = req.file ? req.file.filename : category.image;

    category.name = name;
    category.image = image;
    category.updatedBy = updatedBy;

    await category.save();

    res.status(200).json({
      message: 'Category updated successfully.',
      data: category,
      success: true
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Delete image file if exists
    if (category.image) {
      const imagePath = path.join(__dirname, '../uploads', category.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }

    await category.deleteOne();

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryByID,
  updateCategory,
  deleteCategory
};
