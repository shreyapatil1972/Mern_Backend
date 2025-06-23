const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `image_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed.'), false);
  }
};

// Export configured multer upload middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;
