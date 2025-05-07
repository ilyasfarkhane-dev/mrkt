import express from "express";
import { createProduct, getAllProducts, getProductById, getMyProducts ,updateProduct, deleteProduct,getActiveProducts ,getRelatedProducts} from "../controllers/productController.js";
import { authenticate,isAdmin, isAdminSeller,isAuthenticatedOrAdmin, isSeller } from "../middleware/authMiddleware.js";
const router = express.Router();

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

// Create product (only authenticated users)
router.post("/", authenticate,isSeller, upload.fields([{ name: "images", maxCount: 10 }]), createProduct);

router.get("/active-products", getActiveProducts);
router.get("/my-products", authenticate, isSeller, getMyProducts);
router.get("/:id/related", getRelatedProducts);
// Get all products
router.get("/",authenticate, isAdmin,getAllProducts);

// Get one product
router.get("/:id", getProductById);

// Update product (only authenticated users, you can add isAdmin if needed)
router.put("/:id", authenticate,isAuthenticatedOrAdmin, upload.fields([{ name: "images", maxCount: 10 }]), updateProduct);

// Delete product (only authenticated users, you can add isAdmin if needed)
router.delete("/:id", authenticate,isAuthenticatedOrAdmin, deleteProduct);

export default router;
