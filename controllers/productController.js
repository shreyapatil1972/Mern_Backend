const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs');

// Handle uploaded file
const handleFileUpload = (file) => {
  if (!file) return null;
  return file.filename;
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const { name, description, price, category, quantity, inStock } = req.body;
    const image = handleFileUpload(req.file);

    if (!name || !description || !price || !category || !quantity || !image) {
      if (req.file) {
        fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
      }
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      quantity,
      inStock: inStock !== undefined ? inStock : true,
      image,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
    }
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};


// Get all products (Public)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .lean();

    const modifiedProducts = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      image: p.image ? `http://localhost:8000/uploads/${p.image}` : null,
    }));
    
    res.status(200).json({ 
      success: true, 
      products: modifiedProducts,
      count: modifiedProducts.length
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
};

// Get product by ID (Public)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const modified = {
      ...product,
      _id: product._id.toString(),
      image: product.image ? `http://localhost:8000/uploads/${product.image}` : null,
    };

    res.status(200).json({ 
      success: true, 
      product: modified 
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product',
      error: error.message 
    });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not Authorized" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.Quantity = req.body.Quantity || product.Quantity;
    product.Category_id = req.body.Category_id || product.Category_id;
    product.inStock = req.body.inStock !== undefined ? req.body.inStock : product.inStock;

    // Handle image update
    if (req.file) {
      // Delete old image
      if (product.image) {
        const oldImagePath = path.join(__dirname, "../uploads", product.image);
        fs.access(oldImagePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(oldImagePath, (err) => {
              if (err) console.error("Failed to delete old image:", err);
            });
          }
        });
      }

      // Set new image
      product.image = req.file.filename;
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...updatedProduct._doc,
        image: updatedProduct.image
          ? `http://localhost:8000/uploads/${updatedProduct.image}`
          : null,
      },
    });
  } catch (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    // ✅ Check admin authorization
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ✅ Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Delete image file if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, "../uploads", product.image);
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(imagePath, (err) => {
            if (err) console.error("❌ Failed to delete image:", err);
          });
        }
      });
    }

    // ✅ Delete product from DB
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category_id })
      .populate('category', 'name')
      .lean();

    const modifiedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      image: product.image ? `http://localhost:8000/uploads/${product.image}` : null,
    }));

    res.status(200).json({ 
      success: true, 
      products: modifiedProducts,
      count: modifiedProducts.length
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products by category',
      error: error.message 
    });
  }
};

// Search products by query
const getProductsByQuery = async (req, res) => {
  try {
    const { keyword } = req.query;
    const regex = new RegExp(keyword, 'i');
    const products = await Product.find({ name: { $regex: regex } });

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByQuery,
};
