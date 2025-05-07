import express from "express";
import {
    toggleLike,
  getLikesByProduct,
  checkIfUserLiked
} from "../controllers/likeController.js";
import { authenticate,isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Like a product
router.post("/toggle", authenticate, toggleLike);

// Get all likes for a product
router.get("/product/:product_id", getLikesByProduct);

// Check if user liked a specific product
router.get("/check/:product_id", authenticate, checkIfUserLiked);

export default router;
