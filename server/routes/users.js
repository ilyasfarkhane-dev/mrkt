import express from "express";
const router = express.Router();
import { 
  getMyProfile, 
  getUserById, 
  getAllUsers, 
  updateUser,
  updateMyProfile,
  getSellers,
  getBuyers ,
  deleteUserWithProducts
} from "../controllers/userController.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";


// Get all users (Admin only)
router.get("/", authenticate, isAdmin, getAllUsers);

// Get all sellers (Admin only)
router.get("/sellers", authenticate, isAdmin, getSellers);

router.delete("/:id", authenticate,isAdmin, deleteUserWithProducts);
// Get all buyers (Admin only)
router.get("/buyers", authenticate, isAdmin, getBuyers);
// Get my profile
router.get("/profile", authenticate, getMyProfile);
// Get user by ID
router.get("/:id", authenticate, getUserById);
// Update my profile
router.put("/profile", authenticate, updateMyProfile);
// Update user (Admin only)
router.put("/:id", authenticate, isAdmin, updateUser);



export default router;