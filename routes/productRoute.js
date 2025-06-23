const express = require('express');
const productController = require('../controllers/productController');
const {auth} = require('../middleware/auth')
const multerMiddleware = require("../middleware/multer")


const router = express.Router();

router.post('/create',auth,multerMiddleware.single('image') ,productController.createProduct);
router.get('/getAllProducts', productController.getAllProducts);
router.get('/getProductById/:id', productController.getProductById);
router.put('/updateProduct/:id',auth,multerMiddleware.single('image'), productController.updateProduct);
router.delete('/deleteProduct/:id',auth, productController.deleteProduct);
router.get('/getproductByCategory/:category_id', productController.getProductsByCategory);
router.get('/getProductsByQuery',productController.getProductsByQuery);

module.exports = router
 