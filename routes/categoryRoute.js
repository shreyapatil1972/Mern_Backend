const express = require('express');
const categoryController = require('../controllers/categoryController');
const { auth } = require('../middleware/auth');
const multerMiddleware = require("../middleware/multer");

const router = express.Router();

router.post('/create', auth, multerMiddleware.single('image'), categoryController.createCategory);
router.get('/getAllCategories', categoryController.getAllCategories);
router.get('/getCategoryByID/:id', categoryController.getCategoryByID);
router.put('/updateCategory/:id', auth, multerMiddleware.single('image'), categoryController.updateCategory);
router.delete('/deleteCategory/:id', auth, categoryController.deleteCategory);

module.exports = router;
