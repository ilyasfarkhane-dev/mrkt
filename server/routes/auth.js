import express from "express";
import { login, register, logout, verifyEmail, requestPasswordReset, resetPassword } from "../controllers/auth.js";

const router = express.Router();

// Auth Routes
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

// Email Verification Route
router.get("/verify-email", verifyEmail);

router.post("/forgot-password", requestPasswordReset); // New route
router.post("/reset-password", resetPassword); // New route

export default router;