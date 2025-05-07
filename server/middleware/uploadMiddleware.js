import  multer from "multer"

// Configure Multer to handle image uploads
const storage = multer.diskStorage({
  destination: '../client/public/upload', // Directory to store uploaded images
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;