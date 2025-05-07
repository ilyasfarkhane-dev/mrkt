import express from "express";
import { addComment, deleteComment, getCommentsByProduct } from "../controllers/commentController.js";
import { authenticate,isAdmin,isAuthenticatedOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a comment
router.post("/", authenticate, addComment);

// Delete a comment
router.delete("/:id", authenticate,isAuthenticatedOrAdmin, deleteComment);

// Get all comments for a product
router.get("/product/:product_id", getCommentsByProduct);

export default router;
