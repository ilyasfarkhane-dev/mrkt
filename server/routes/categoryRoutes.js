import express from "express";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { authenticate,isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

// Create category (only authenticated users, could limit to admins later)
router.post("/", authenticate, isAdmin, createCategory);

// Get all categories
router.get("/", getAllCategories);

// Get one category
router.get("/:id", getCategoryById);

// Update category (only authenticated users, could limit to admins later)
router.put("/:id", authenticate,isAdmin, updateCategory);

// Delete category (only authenticated users, could limit to admins later)
router.delete("/:id", authenticate,isAdmin, deleteCategory);

export default router;
